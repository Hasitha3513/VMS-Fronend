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
import { systemServiceService } from '../../../services/role_permission_system/system_service/systemServiceService';
import { systemModuleService } from '../../../services/role_permission_system/system_module/systemModuleService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const EMPTY_FORM = {
  module_id: '',
  service_code: '',
  service_name: '',
  service_description: '',
  service_path: '',
  icon_name: '',
  parent_service_id: '',
  display_order: 0,
  is_active: true,
};

export default function SystemServicePage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nameSearch, setNameSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortDir, setSortDir] = useState('asc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ value: String(m.module_id || ''), label: `${m.module_name || '-'} (${m.module_code || '-'})` })).filter((x) => x.value),
    [modules]
  );
  const parentOptions = useMemo(
    () => rows.map((s) => ({ value: String(s.service_id || ''), label: s.service_name || String(s.service_id || '-') })),
    [rows]
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
      const data = await systemServiceService.list(token, {
        service_name_like: nameSearch || undefined,
        module_name: moduleFilter || undefined,
        is_active: statusFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load system services');
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
  }, [token, nameSearch, moduleFilter, statusFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.service_id || ''));
    setForm({
      module_id: String(row?.module_id || ''),
      service_code: String(row?.service_code || ''),
      service_name: String(row?.service_name || ''),
      service_description: String(row?.service_description || ''),
      service_path: String(row?.service_path || ''),
      icon_name: String(row?.icon_name || ''),
      parent_service_id: String(row?.parent_service_id || ''),
      display_order: Number(row?.display_order || 0),
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
    if (!form.module_id || !form.service_code || !form.service_name) {
      setError('Module, Service Code and Service Name are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      module_id: form.module_id || null,
      service_code: form.service_code || null,
      service_name: form.service_name || null,
      service_description: form.service_description || null,
      service_path: form.service_path || null,
      icon_name: form.icon_name || null,
      parent_service_id: form.parent_service_id || null,
      display_order: Number.isFinite(Number(form.display_order)) ? Number(form.display_order) : 0,
      is_active: !!form.is_active,
    };
    try {
      if (editingId) {
        await systemServiceService.update(token, editingId, payload);
        setSuccess('System service updated');
      } else {
        await systemServiceService.create(token, payload);
        setSuccess('System service created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save system service');
    }
  };

  const onDelete = async (row) => {
    const id = row?.service_id;
    if (!id) return;
    if (!window.confirm('Delete this system service?')) return;
    try {
      await systemServiceService.remove(token, id);
      setSuccess('System service deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete system service');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>System Services</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add System Service</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Service Name Search"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label="Module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            sx={{ minWidth: 240 }}
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
            <MenuItem value="display_order">Display Order</MenuItem>
            <MenuItem value="service_name">Service Name</MenuItem>
            <MenuItem value="service_code">Service Code</MenuItem>
            <MenuItem value="module_name">Module</MenuItem>
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
              <TableCell>Service Code</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Parent Service</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.service_id}>
                <TableCell>{fmt(row.service_code)}</TableCell>
                <TableCell>{fmt(row.service_name)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{fmt(row.parent_service_name)}</TableCell>
                <TableCell>{fmt(row.service_path)}</TableCell>
                <TableCell>{fmt(row.display_order)}</TableCell>
                <TableCell><Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No system services found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit System Service' : 'Add System Service'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={moduleOptions}
              value={moduleOptions.find((m) => String(m.value) === String(form.module_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, module_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Module" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <TextField size="small" label="Service Code" value={form.service_code} onChange={(e) => setForm((p) => ({ ...p, service_code: e.target.value }))} />
            <TextField size="small" label="Service Name" value={form.service_name} onChange={(e) => setForm((p) => ({ ...p, service_name: e.target.value }))} />
            <TextField size="small" label="Description" value={form.service_description} onChange={(e) => setForm((p) => ({ ...p, service_description: e.target.value }))} multiline minRows={2} />
            <TextField size="small" label="Path" value={form.service_path} onChange={(e) => setForm((p) => ({ ...p, service_path: e.target.value }))} />
            <TextField size="small" label="Icon Name" value={form.icon_name} onChange={(e) => setForm((p) => ({ ...p, icon_name: e.target.value }))} />
            <Autocomplete
              options={[{ value: '', label: 'No Parent Service' }, ...parentOptions.filter((x) => String(x.value) !== String(editingId))]}
              value={[{ value: '', label: 'No Parent Service' }, ...parentOptions].find((p) => String(p.value || '') === String(form.parent_service_id || '')) || { value: '', label: 'No Parent Service' }}
              onChange={(_, next) => setForm((p) => ({ ...p, parent_service_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Parent Service" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <TextField size="small" type="number" label="Display Order" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))} />
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
