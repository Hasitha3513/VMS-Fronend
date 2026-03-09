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
import { roleHierarchyService } from '../../../services/role_permission_system/role_hierarchy/roleHierarchyService';
import { roleService } from '../../../services/role_permission_system/role/roleService';
import { useAuth } from '../../../app/AuthContext';

const fmt = (v) => (v == null || v === '' ? '-' : String(v));
const fmtDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const EMPTY_FORM = {
  parent_role_id: '',
  child_role_id: '',
};

export default function RoleHierarchyPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [parentRoleSearch, setParentRoleSearch] = useState('');
  const [childRoleSearch, setChildRoleSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
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

  const companyOptions = useMemo(
    () => Array.from(new Set(roles.map((r) => String(r.company_code || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [roles]
  );

  const loadLookups = async () => {
    const roleRows = await roleService.list(token, { sortBy: 'role_name', sortDir: 'asc' });
    setRoles(Array.isArray(roleRows) ? roleRows : []);
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await roleHierarchyService.list(token, {
        parent_role_name_like: parentRoleSearch || undefined,
        child_role_name_like: childRoleSearch || undefined,
        parent_company_code: companyFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load role hierarchies');
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
        if (!ignore) setError(e?.message || 'Failed to load role list');
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    loadRows();
  }, [token, parentRoleSearch, childRoleSearch, companyFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.hierarchy_id || ''));
    setForm({
      parent_role_id: String(row?.parent_role_id || ''),
      child_role_id: String(row?.child_role_id || ''),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId('');
    setForm(EMPTY_FORM);
  };

  const onSave = async () => {
    if (!form.parent_role_id || !form.child_role_id) {
      setError('Parent Role and Child Role are required');
      return;
    }
    if (form.parent_role_id === form.child_role_id) {
      setError('Parent role and child role cannot be the same');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      parent_role_id: form.parent_role_id,
      child_role_id: form.child_role_id,
    };
    try {
      if (editingId) {
        await roleHierarchyService.update(token, editingId, payload);
        setSuccess('Role hierarchy updated');
      } else {
        await roleHierarchyService.create(token, payload);
        setSuccess('Role hierarchy created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save role hierarchy');
    }
  };

  const onDelete = async (row) => {
    const id = row?.hierarchy_id;
    if (!id) return;
    if (!window.confirm('Delete this role hierarchy?')) return;
    try {
      await roleHierarchyService.remove(token, id);
      setSuccess('Role hierarchy deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete role hierarchy');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>Role Hierarchies</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add Role Hierarchy</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            label="Parent Role Search"
            value={parentRoleSearch}
            onChange={(e) => setParentRoleSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            size="small"
            label="Child Role Search"
            value={childRoleSearch}
            onChange={(e) => setChildRoleSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            size="small"
            label="Company"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Companies</MenuItem>
            {companyOptions.map((code) => <MenuItem key={code} value={code}>{code}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="created_at">Created At</MenuItem>
            <MenuItem value="parent_role_name">Parent Role</MenuItem>
            <MenuItem value="child_role_name">Child Role</MenuItem>
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
              <TableCell>Parent Role</TableCell>
              <TableCell>Child Role</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.hierarchy_id}>
                <TableCell>{fmt(row.parent_role_name)}</TableCell>
                <TableCell>{fmt(row.child_role_name)}</TableCell>
                <TableCell>{fmt(row.parent_company_code)}</TableCell>
                <TableCell>{fmtDateTime(row.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No role hierarchies found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Role Hierarchy' : 'Add Role Hierarchy'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={roleOptions}
              value={roleOptions.find((r) => String(r.value) === String(form.parent_role_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, parent_role_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Parent Role" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
            <Autocomplete
              options={roleOptions}
              value={roleOptions.find((r) => String(r.value) === String(form.child_role_id)) || null}
              onChange={(_, next) => setForm((p) => ({ ...p, child_role_id: next?.value || '' }))}
              getOptionLabel={(o) => o?.label || ''}
              renderInput={(params) => <TextField {...params} size="small" label="Child Role" />}
              isOptionEqualToValue={(a, b) => String(a?.value || '') === String(b?.value || '')}
            />
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
