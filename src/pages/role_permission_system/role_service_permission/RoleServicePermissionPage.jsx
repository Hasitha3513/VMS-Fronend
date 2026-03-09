import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { roleServicePermissionService } from '../../../services/role_permission_system/role_service_permission/roleServicePermissionService';
import { roleService } from '../../../services/role_permission_system/role/roleService';
import { systemServiceService } from '../../../services/role_permission_system/system_service/systemServiceService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const EMPTY_FORM = {
  role_id: '',
  service_id: '',
  can_access: true,
  can_create: false,
  can_edit: false,
  can_delete: false,
  can_export: false,
};

export default function RoleServicePermissionPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [roleNameSearch, setRoleNameSearch] = useState('');
  const [serviceNameSearch, setServiceNameSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [canAccessFilter, setCanAccessFilter] = useState('');
  const [sortBy, setSortBy] = useState('role_name');
  const [sortDir, setSortDir] = useState('asc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState({ role_id: '', service_id: '' });
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

  const serviceOptions = useMemo(
    () => services
      .map((s) => ({
        value: String(s.service_id || ''),
        label: `${s.service_name || '-'} (${s.module_name || '-'})`,
      }))
      .filter((x) => x.value),
    [services]
  );

  const loadLookups = async () => {
    const [roleRows, serviceRows] = await Promise.all([
      roleService.list(token, { sortBy: 'role_name', sortDir: 'asc' }),
      systemServiceService.list(token, { sortBy: 'service_name', sortDir: 'asc' }),
    ]);
    setRoles(Array.isArray(roleRows) ? roleRows : []);
    setServices(Array.isArray(serviceRows) ? serviceRows : []);
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await roleServicePermissionService.list(token, {
        role_name_like: roleNameSearch || undefined,
        service_name_like: serviceNameSearch || undefined,
        module_name: moduleFilter || undefined,
        can_access: canAccessFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load role service permissions');
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
  }, [token, roleNameSearch, serviceNameSearch, moduleFilter, canAccessFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingKey({ role_id: '', service_id: '' });
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingKey({ role_id: String(row?.role_id || ''), service_id: String(row?.service_id || '') });
    setForm({
      role_id: String(row?.role_id || ''),
      service_id: String(row?.service_id || ''),
      can_access: row?.can_access === true,
      can_create: row?.can_create === true,
      can_edit: row?.can_edit === true,
      can_delete: row?.can_delete === true,
      can_export: row?.can_export === true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingKey({ role_id: '', service_id: '' });
    setForm(EMPTY_FORM);
  };

  const onSave = async () => {
    if (!form.role_id || !form.service_id) {
      setError('Role and Service are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      role_id: form.role_id,
      service_id: form.service_id,
      can_access: !!form.can_access,
      can_create: !!form.can_create,
      can_edit: !!form.can_edit,
      can_delete: !!form.can_delete,
      can_export: !!form.can_export,
    };
    try {
      if (editingKey.role_id && editingKey.service_id) {
        await roleServicePermissionService.update(token, editingKey.role_id, editingKey.service_id, payload);
        setSuccess('Role service permission updated');
      } else {
        await roleServicePermissionService.create(token, payload);
        setSuccess('Role service permission created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save role service permission');
    }
  };

  const onDelete = async (row) => {
    const roleId = row?.role_id;
    const serviceId = row?.service_id;
    if (!roleId || !serviceId) return;
    if (!window.confirm('Delete this role service permission?')) return;
    try {
      await roleServicePermissionService.remove(token, roleId, serviceId);
      setSuccess('Role service permission deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete role service permission');
    }
  };

  const moduleOptions = Array.from(new Set(rows.map((r) => String(r.module_name || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>Role Service Permissions</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add Role Service Permission</Button>
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
            label="Service Name Search"
            value={serviceNameSearch}
            onChange={(e) => setServiceNameSearch(e.target.value)}
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
            label="Can Access"
            value={canAccessFilter}
            onChange={(e) => setCanAccessFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
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
            <MenuItem value="service_name">Service Name</MenuItem>
            <MenuItem value="module_name">Module</MenuItem>
            <MenuItem value="can_access">Can Access</MenuItem>
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
              <TableCell>Service</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Access</TableCell>
              <TableCell>Create</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Export</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.role_id}-${row.service_id}`}>
                <TableCell>{fmt(row.role_name)}</TableCell>
                <TableCell>{fmt(row.role_company_code)}</TableCell>
                <TableCell>{fmt(row.service_name)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{row.can_access ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.can_create ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.can_edit ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.can_delete ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.can_export ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={10} align="center">No role service permissions found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingKey.role_id && editingKey.service_id ? 'Edit Role Service Permission' : 'Add Role Service Permission'}</DialogTitle>
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
              options={serviceOptions}
              value={serviceOptions.find((s) => String(s.value) === String(form.service_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, service_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Service" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <FormControlLabel control={<Checkbox checked={!!form.can_access} onChange={(e) => setForm((p) => ({ ...p, can_access: e.target.checked }))} />} label="Can Access" />
            <FormControlLabel control={<Checkbox checked={!!form.can_create} onChange={(e) => setForm((p) => ({ ...p, can_create: e.target.checked }))} />} label="Can Create" />
            <FormControlLabel control={<Checkbox checked={!!form.can_edit} onChange={(e) => setForm((p) => ({ ...p, can_edit: e.target.checked }))} />} label="Can Edit" />
            <FormControlLabel control={<Checkbox checked={!!form.can_delete} onChange={(e) => setForm((p) => ({ ...p, can_delete: e.target.checked }))} />} label="Can Delete" />
            <FormControlLabel control={<Checkbox checked={!!form.can_export} onChange={(e) => setForm((p) => ({ ...p, can_export: e.target.checked }))} />} label="Can Export" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={onSave}>{editingKey.role_id && editingKey.service_id ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
