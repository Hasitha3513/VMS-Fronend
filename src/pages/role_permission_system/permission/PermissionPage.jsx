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
import { permissionService } from '../../../services/role_permission_system/permission/permissionService';
import { systemModuleService } from '../../../services/role_permission_system/system_module/systemModuleService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const EMPTY_FORM = {
  permission_code: '',
  module_id: '',
  description: '',
  is_active: true,
};

export default function PermissionPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [permissionSearch, setPermissionSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('permission_code');
  const [sortDir, setSortDir] = useState('asc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ value: String(m.module_id || ''), label: `${m.module_name || '-'} (${m.module_code || '-'})` })).filter((x) => x.value),
    [modules]
  );

  const loadLookups = async () => {
    const moduleRows = await systemModuleService.list(token, { sortBy: 'display_order', sortDir: 'asc' });
    setModules(Array.isArray(moduleRows) ? moduleRows : []);
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await permissionService.list(token, {
        permission_code_like: permissionSearch || undefined,
        module_name: moduleFilter || undefined,
        is_active: statusFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load permissions');
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
        if (!ignore) setError(e?.message || 'Failed to load module list');
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    loadRows();
  }, [token, permissionSearch, moduleFilter, statusFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.permission_id || ''));
    setForm({
      permission_code: String(row?.permission_code || ''),
      module_id: String(row?.module_id || ''),
      description: String(row?.description || ''),
      is_active: row?.is_active !== false,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId('');
    setForm(EMPTY_FORM);
  };

  const onSave = async () => {
    if (!form.permission_code || !form.module_id) {
      setError('Permission Code and Module are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      permission_code: form.permission_code || null,
      module_id: form.module_id || null,
      description: form.description || null,
      is_active: !!form.is_active,
    };
    try {
      if (editingId) {
        await permissionService.update(token, editingId, payload);
        setSuccess('Permission updated');
      } else {
        await permissionService.create(token, payload);
        setSuccess('Permission created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save permission');
    }
  };

  const onDelete = async (row) => {
    const id = row?.permission_id;
    if (!id) return;
    if (!window.confirm('Delete this permission?')) return;
    try {
      await permissionService.remove(token, id);
      setSuccess('Permission deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete permission');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>Permissions</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add Permission</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Permission Code Search"
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label="Module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Modules</MenuItem>
            {[...new Set(rows.map((r) => String(r.module_name || '').trim()).filter(Boolean))].map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="permission_code">Permission Code</MenuItem>
            <MenuItem value="module_name">Module</MenuItem>
            <MenuItem value="description">Description</MenuItem>
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
              <TableCell>Permission Code</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.permission_id}>
                <TableCell>{fmt(row.permission_code)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{fmt(row.description)}</TableCell>
                <TableCell><Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No permissions found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Permission Code" value={form.permission_code} onChange={(e) => setForm((p) => ({ ...p, permission_code: e.target.value }))} />
            <Autocomplete
              options={moduleOptions}
              value={moduleOptions.find((m) => String(m.value) === String(form.module_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, module_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Module" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <TextField size="small" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} multiline minRows={2} />
            <TextField
              select
              size="small"
              label="Status"
              value={form.is_active ? 'true' : 'false'}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
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
