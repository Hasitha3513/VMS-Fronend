import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { userPermissionService } from '../../../services/role_permission_system/user_permission/userPermissionService';
import { appUserService } from '../../../services/role_permission_system/app_user/appUserService';
import { permissionService } from '../../../services/role_permission_system/permission/permissionService';
import { organizationService } from '../../../services/organizationService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const fmtDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const EMPTY_FORM = {
  user_id: '',
  permission_id: '',
  grant_type: 'GRANT',
};

export default function UserPermissionPage() {
  const { token, auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usernameSearch, setUsernameSearch] = useState('');
  const [companyCodeFilter, setCompanyCodeFilter] = useState('');
  const [permissionCodeSearch, setPermissionCodeSearch] = useState('');
  const [grantTypeFilter, setGrantTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('assigned_at');
  const [sortDir, setSortDir] = useState('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const userOptions = useMemo(
    () => users
      .map((u) => ({
        value: String(u.user_id || ''),
        label: `${u.username || '-'} (${u.company_code || '-'})`,
      }))
      .filter((x) => x.value),
    [users]
  );

  const permissionOptions = useMemo(
    () => permissions
      .map((p) => ({
        value: String(p.permission_id || ''),
        label: `${p.permission_code || '-'} (${p.module_name || '-'})`,
      }))
      .filter((x) => x.value),
    [permissions]
  );

  const companyOptions = useMemo(
    () => companies
      .map((c) => ({ value: String(c.companyCode || ''), label: `${c.companyCode || '-'} - ${c.companyName || '-'}` }))
      .filter((x) => x.value),
    [companies]
  );

  const loadLookups = async () => {
    const [userRows, permissionRows, companyRows] = await Promise.all([
      appUserService.list(token, {}),
      permissionService.list(token, { sortBy: 'permission_code', sortDir: 'asc' }),
      organizationService.listCompanies(token, { activeOnly: false }),
    ]);
    setUsers(Array.isArray(userRows) ? userRows : []);
    setPermissions(Array.isArray(permissionRows) ? permissionRows : []);
    setCompanies(Array.isArray(companyRows) ? companyRows : []);
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await userPermissionService.list(token, {
        username_like: usernameSearch || undefined,
        company_code: companyCodeFilter || undefined,
        permission_code_like: permissionCodeSearch || undefined,
        grant_type: grantTypeFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        await loadLookups();
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load dropdown data');
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    loadRows();
  }, [token, usernameSearch, companyCodeFilter, permissionCodeSearch, grantTypeFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.user_permission_id || ''));
    setForm({
      user_id: String(row?.user_id || ''),
      permission_id: String(row?.permission_id || ''),
      grant_type: String(row?.grant_type || 'GRANT'),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId('');
    setForm(EMPTY_FORM);
  };

  const onSave = async () => {
    if (!form.user_id || !form.permission_id) {
      setError('User and Permission are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      user_id: form.user_id,
      permission_id: form.permission_id,
      grant_type: form.grant_type || 'GRANT',
      assigned_by: auth?.userId || null,
    };
    try {
      if (editingId) {
        await userPermissionService.update(token, editingId, payload);
        setSuccess('User permission updated');
      } else {
        await userPermissionService.create(token, payload);
        setSuccess('User permission created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save user permission');
    }
  };

  const onDelete = async (row) => {
    const id = row?.user_permission_id;
    if (!id) return;
    if (!window.confirm('Delete this user permission?')) return;
    try {
      await userPermissionService.remove(token, id);
      setSuccess('User permission deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete user permission');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>User Permissions</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add User Permission</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Username Search"
            value={usernameSearch}
            onChange={(e) => setUsernameSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            size="small"
            label="Company"
            value={companyCodeFilter}
            onChange={(e) => setCompanyCodeFilter(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">All Companies</MenuItem>
            {companyOptions.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
          </TextField>
          <TextField
            size="small"
            label="Permission Code Search"
            value={permissionCodeSearch}
            onChange={(e) => setPermissionCodeSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label="Grant Type"
            value={grantTypeFilter}
            onChange={(e) => setGrantTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="GRANT">GRANT</MenuItem>
            <MenuItem value="DENY">DENY</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="assigned_at">Assigned At</MenuItem>
            <MenuItem value="username">Username</MenuItem>
            <MenuItem value="permission_code">Permission Code</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Sort Dir"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="asc">ASC</MenuItem>
            <MenuItem value="desc">DESC</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Permission Code</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Grant Type</TableCell>
              <TableCell>Assigned By</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.user_permission_id}>
                <TableCell>{fmt(row.username)}</TableCell>
                <TableCell>{fmt(row.email)}</TableCell>
                <TableCell>{fmt(row.company_code)}</TableCell>
                <TableCell>{fmt(row.permission_code)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{fmt(row.grant_type)}</TableCell>
                <TableCell>{fmt(row.assigned_by_name)}</TableCell>
                <TableCell>{fmtDateTime(row.assigned_at)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center">No user permissions found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit User Permission' : 'Add User Permission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={userOptions}
              value={userOptions.find((u) => String(u.value) === String(form.user_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, user_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="User" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <Autocomplete
              options={permissionOptions}
              value={permissionOptions.find((p) => String(p.value) === String(form.permission_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, permission_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Permission" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <TextField
              select
              size="small"
              label="Grant Type"
              value={form.grant_type}
              onChange={(e) => setForm((p) => ({ ...p, grant_type: e.target.value }))}
            >
              <MenuItem value="GRANT">GRANT</MenuItem>
              <MenuItem value="DENY">DENY</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={onSave}>{editingId ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
