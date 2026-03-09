import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
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
import { userRoleService } from '../../../services/role_permission_system/user_role/userRoleService';
import { appUserService } from '../../../services/role_permission_system/app_user/appUserService';
import { roleService } from '../../../services/role_permission_system/role/roleService';
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
  role_id: '',
  company_id: '',
  company_code: '',
  expires_at: '',
  is_active: true,
};

export default function UserRolePage() {
  const { token, auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usernameSearch, setUsernameSearch] = useState('');
  const [companyCodeFilter, setCompanyCodeFilter] = useState('');
  const [roleNameFilter, setRoleNameFilter] = useState('');
  const [sortBy, setSortBy] = useState('assigned_at');
  const [sortDir, setSortDir] = useState('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const companyByCode = useMemo(
    () => Object.fromEntries(companies.map((c) => [String(c.companyCode || ''), c])),
    [companies]
  );

  const loadLookups = async () => {
    const [companyRows, userRows, roleRows] = await Promise.all([
      organizationService.listCompanies(token, { activeOnly: false }),
      appUserService.list(token, {}),
      roleService.list(token, {}),
    ]);
    setCompanies(Array.isArray(companyRows) ? companyRows : []);
    setUsers(Array.isArray(userRows) ? userRows : []);
    setRoles(Array.isArray(roleRows) ? roleRows : []);
  };

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        username_like: usernameSearch || undefined,
        company_code: companyCodeFilter || undefined,
        role_name: roleNameFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      };
      const data = await userRoleService.list(token, params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load user roles');
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
    if (!token) return;
    loadRows();
  }, [token, usernameSearch, companyCodeFilter, roleNameFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.user_role_id || ''));
    setForm({
      user_id: String(row?.user_id || ''),
      role_id: String(row?.role_id || ''),
      company_id: String(row?.company_id || ''),
      company_code: String(row?.company_code || ''),
      expires_at: row?.expires_at ? String(row.expires_at).slice(0, 16) : '',
      is_active: row?.is_active !== false,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(EMPTY_FORM);
    setEditingId('');
  };

  const onFormChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'company_code') {
        const company = companyByCode[String(value || '')];
        next.company_id = company?.companyId ? String(company.companyId) : '';
      }
      if (key === 'user_id') {
        const user = users.find((u) => String(u.user_id || '') === String(value || ''));
        if (user?.company_code) {
          next.company_code = String(user.company_code);
          const company = companyByCode[String(user.company_code)];
          if (company?.companyId) next.company_id = String(company.companyId);
        }
      }
      return next;
    });
  };

  const onSave = async () => {
    if (!form.user_id || !form.role_id || !form.company_code) {
      setError('User, Role and Company are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      user_id: form.user_id,
      role_id: form.role_id,
      company_id: form.company_id || null,
      company_code: form.company_code || null,
      branch_id: null,
      department_id: null,
      assigned_by: auth?.userId || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: !!form.is_active,
    };
    try {
      if (editingId) {
        await userRoleService.update(token, editingId, payload);
        setSuccess('User role updated');
      } else {
        await userRoleService.create(token, payload);
        setSuccess('User role created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save user role');
    }
  };

  const onDelete = async (row) => {
    const id = row?.user_role_id;
    if (!id) return;
    if (!window.confirm('Delete this user role?')) return;
    try {
      await userRoleService.remove(token, id);
      setSuccess('User role deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete user role');
    }
  };

  const companyOptions = companies
    .map((c) => ({ value: String(c.companyCode || ''), label: `${c.companyCode || '-'} - ${c.companyName || '-'}` }))
    .filter((x) => x.value);
  const roleNameOptions = Array.from(new Set(roles.map((r) => String(r.role_name || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>User Roles</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add User Role</Button>
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
            select
            size="small"
            label="Role Type"
            value={roleNameFilter}
            onChange={(e) => setRoleNameFilter(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {roleNameOptions.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="assigned_at">Assigned At</MenuItem>
            <MenuItem value="username">Username</MenuItem>
            <MenuItem value="role_name">Role Name</MenuItem>
            <MenuItem value="company_name">Company</MenuItem>
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
              <TableCell>Role</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Assigned By</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.user_role_id}>
                <TableCell>{fmt(row.username)}</TableCell>
                <TableCell>{fmt(row.email)}</TableCell>
                <TableCell>{fmt(row.role_name)}</TableCell>
                <TableCell>{fmt(row.company_name)}</TableCell>
                <TableCell>{fmt(row.assigned_by_name)}</TableCell>
                <TableCell>{fmtDateTime(row.assigned_at)}</TableCell>
                <TableCell>{fmtDateTime(row.expires_at)}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center">No user roles found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit User Role' : 'Add User Role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={users}
              value={users.find((u) => String(u.user_id) === String(form.user_id)) || null}
              onChange={(_, next) => onFormChange('user_id', next?.user_id || '')}
              getOptionLabel={(u) => u ? `${u.username || '-'} (${u.company_code || '-'})` : ''}
              renderInput={(params) => <TextField {...params} label="User" size="small" />}
              isOptionEqualToValue={(a, b) => String(a?.user_id || '') === String(b?.user_id || '')}
            />
            <Autocomplete
              options={roles}
              value={roles.find((r) => String(r.role_id) === String(form.role_id)) || null}
              onChange={(_, next) => onFormChange('role_id', next?.role_id || '')}
              getOptionLabel={(r) => r ? `${r.role_name || '-'} (${r.role_code || '-'})` : ''}
              renderInput={(params) => <TextField {...params} label="Role Type" size="small" />}
              isOptionEqualToValue={(a, b) => String(a?.role_id || '') === String(b?.role_id || '')}
            />
            <TextField
              select
              label="Company"
              size="small"
              value={form.company_code}
              onChange={(e) => onFormChange('company_code', e.target.value)}
            >
              {companyOptions.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Expires At"
              size="small"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => onFormChange('expires_at', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={form.is_active ? 'true' : 'false'}
              onChange={(e) => onFormChange('is_active', e.target.value === 'true')}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
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
