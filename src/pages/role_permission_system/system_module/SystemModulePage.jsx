import { useEffect, useState } from 'react';
import {
  Alert,
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
import { systemModuleService } from '../../../services/role_permission_system/system_module/systemModuleService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const EMPTY_FORM = {
  module_code: '',
  module_name: '',
  description: '',
  display_order: 0,
  is_active: true,
};

export default function SystemModulePage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortDir, setSortDir] = useState('asc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await systemModuleService.list(token, {
        module_name_like: nameSearch || undefined,
        is_active: statusFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load system modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [token, nameSearch, statusFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.module_id || ''));
    setForm({
      module_code: String(row?.module_code || ''),
      module_name: String(row?.module_name || ''),
      description: String(row?.description || ''),
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
    if (!form.module_code || !form.module_name) {
      setError('Module Code and Module Name are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      module_code: form.module_code || null,
      module_name: form.module_name || null,
      description: form.description || null,
      display_order: Number.isFinite(Number(form.display_order)) ? Number(form.display_order) : 0,
      is_active: !!form.is_active,
    };
    try {
      if (editingId) {
        await systemModuleService.update(token, editingId, payload);
        setSuccess('System module updated');
      } else {
        await systemModuleService.create(token, payload);
        setSuccess('System module created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save system module');
    }
  };

  const onDelete = async (row) => {
    const id = row?.module_id;
    if (!id) return;
    if (!window.confirm('Delete this system module?')) return;
    try {
      await systemModuleService.remove(token, id);
      setSuccess('System module deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete system module');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>System Modules</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add System Module</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Module Name Search"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
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
            <MenuItem value="module_name">Module Name</MenuItem>
            <MenuItem value="module_code">Module Code</MenuItem>
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
              <TableCell>Module Code</TableCell>
              <TableCell>Module Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.module_id}>
                <TableCell>{fmt(row.module_code)}</TableCell>
                <TableCell>{fmt(row.module_name)}</TableCell>
                <TableCell>{fmt(row.description)}</TableCell>
                <TableCell>{fmt(row.display_order)}</TableCell>
                <TableCell><Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No system modules found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit System Module' : 'Add System Module'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Module Code" value={form.module_code} onChange={(e) => setForm((p) => ({ ...p, module_code: e.target.value }))} />
            <TextField size="small" label="Module Name" value={form.module_name} onChange={(e) => setForm((p) => ({ ...p, module_name: e.target.value }))} />
            <TextField size="small" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} multiline minRows={2} />
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
