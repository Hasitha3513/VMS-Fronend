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
import { rolePermissionService } from '../../../services/role_permission_system/role_permission/rolePermissionService';
import { roleService } from '../../../services/role_permission_system/role/roleService';
import { permissionService } from '../../../services/role_permission_system/permission/permissionService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const EMPTY_FORM = {
  role_id: '',
  permission_id: '',
  grant_type: 'GRANT',
};

export default function RolePermissionPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [roleNameSearch, setRoleNameSearch] = useState('');
  const [permissionCodeSearch, setPermissionCodeSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [grantTypeFilter, setGrantTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('role_name');
  const [sortDir, setSortDir] = useState('asc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState({ role_id: '', permission_id: '' });
  const [form, setForm] = useState(EMPTY_FORM);

  const roleOptions = useMemo(
    () => roles
      .map((r) => ({
        value: String(r.role_id || ''),
        label: `${r.role_name || '-'} (${r.role_code || '-'}) - ${r.company_code || '-'}`,
      }))
      .filter((x) => x.value),
    [roles]
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

  const loadLookups = async () => {
    const [roleRows, permissionRows] = await Promise.all([
      roleService.list(token, { sortBy: 'role_name', sortDir: 'asc' }),
      permissionService.list(token, { sortBy: 'permission_code', sortDir: 'asc' }),
    ]);
    setRoles(Array.isArray(roleRows) ? roleRows : []);
    setPermissions(Array.isArray(permissionRows) ? permissionRows : []);
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await rolePermissionService.list(token, {
        role_name_like: roleNameSearch || undefined,
        permission_code_like: permissionCodeSearch || undefined,
        module_name: moduleFilter || undefined,
        grant_type: grantTypeFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load role permissions');
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
  }, [token, roleNameSearch, permissionCodeSearch, moduleFilter, grantTypeFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingKey({ role_id: '', permission_id: '' });
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingKey({ role_id: String(row?.role_id || ''), permission_id: String(row?.permission_id || '') });
    setForm({
      role_id: String(row?.role_id || ''),
      permission_id: String(row?.permission_id || ''),
      grant_type: String(row?.grant_type || 'GRANT'),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingKey({ role_id: '', permission_id: '' });
    setForm(EMPTY_FORM);
  };

  const onSave = async () => {
    if (!form.role_id || !form.permission_id) {
      setError('Role and Permission are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      role_id: form.role_id,
      permission_id: form.permission_id,
      grant_type: form.grant_type || 'GRANT',
    };
    try {
      if (editingKey.role_id && editingKey.permission_id) {
        await rolePermissionService.update(token, editingKey.role_id, editingKey.permission_id, payload);
        setSuccess('Role permission updated');
      } else {
        await rolePermissionService.create(token, payload);
        setSuccess('Role permission created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save role permission');
    }
  };

  const onDelete = async (row) => {
    const roleId = row?.role_id;
    const permissionId = row?.permission_id;
    if (!roleId || !permissionId) return;
    if (!window.confirm('Delete this role permission?')) return;
    try {
      await rolePermissionService.remove(token, roleId, permissionId);
      setSuccess('Role permission deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete role permission');
    }
  };

  const moduleOptions = Array.from(new Set(rows.map((r) => String(r.module_name || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>Role Permissions</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add Role Permission</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Role Name Search"
            value={roleNameSearch}
            onChange={(e) => setRoleNameSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
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
            label="Module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Modules</MenuItem>
            {moduleOptions.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Grant Type"
            value={grantTypeFilter}
            onChange={(e) => setGrantTypeFilter(e.target.value)}
            sx={{ minWidth: 180 }}
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
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="role_name">Role Name</MenuItem>
            <MenuItem value="permission_code">Permission Code</MenuItem>
            <MenuItem value="module_name">Module</MenuItem>
            <MenuItem value="grant_type">Grant Type</MenuItem>
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
              <TableCell>Role</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Permission Code</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Grant Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.role_id}-${row.permission_id}`}>
                <TableCell>{fmt(row.role_name)}</TableCell>
                <TableCell>{fmt(row.role_company_code)}</TableCell>
                <TableCell>{fmt(row.permission_code)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{fmt(row.permission_description)}</TableCell>
                <TableCell>{fmt(row.grant_type)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No role permissions found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingKey.role_id && editingKey.permission_id ? 'Edit Role Permission' : 'Add Role Permission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={roleOptions}
              value={roleOptions.find((r) => String(r.value) === String(form.role_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, role_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Role" />}
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
          <Button variant="contained" onClick={onSave}>{editingKey.role_id && editingKey.permission_id ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
