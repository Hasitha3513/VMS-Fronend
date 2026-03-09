import { useEffect, useMemo, useState } from 'react';
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
  company_id: '',
  company_code: '',
  role_code: '',
  role_name: '',
  description: '',
  is_system: false,
  is_active: true,
};

export default function RolePage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [roleNameSearch, setRoleNameSearch] = useState('');
  const [companyCodeFilter, setCompanyCodeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const companyByCode = useMemo(
    () => Object.fromEntries(companies.map((c) => [String(c.companyCode || ''), c])),
    [companies]
  );

  const loadCompanies = async () => {
    const data = await organizationService.listCompanies(token, { activeOnly: false });
    setCompanies(Array.isArray(data) ? data : []);
  };

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        role_name_like: roleNameSearch || undefined,
        company_code: companyCodeFilter || undefined,
        sortBy: sortBy || undefined,
        sortDir: sortDir || undefined,
      };
      const data = await roleService.list(token, params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(e?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        await loadCompanies();
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load companies');
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadRows();
  }, [token, roleNameSearch, companyCodeFilter, sortBy, sortDir]);

  const openAddDialog = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingId(String(row?.role_id || ''));
    setForm({
      company_id: String(row?.company_id || ''),
      company_code: String(row?.company_code || ''),
      role_code: String(row?.role_code || ''),
      role_name: String(row?.role_name || ''),
      description: String(row?.description || ''),
      is_system: row?.is_system === true,
      is_active: row?.is_active !== false,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId('');
    setForm(EMPTY_FORM);
  };

  const onFormChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'company_code') {
        const company = companyByCode[String(value || '')];
        next.company_id = company?.companyId ? String(company.companyId) : '';
      }
      return next;
    });
  };

  const onSave = async () => {
    if (!form.company_code || !form.role_code || !form.role_name) {
      setError('Company, Role Code and Role Name are required');
      return;
    }
    setError('');
    setSuccess('');
    const payload = {
      company_id: form.company_id || null,
      company_code: form.company_code || null,
      role_code: form.role_code || null,
      role_name: form.role_name || null,
      description: form.description || null,
      is_system: !!form.is_system,
      is_active: !!form.is_active,
    };
    try {
      if (editingId) {
        await roleService.update(token, editingId, payload);
        setSuccess('Role updated');
      } else {
        await roleService.create(token, payload);
        setSuccess('Role created');
      }
      closeDialog();
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to save role');
    }
  };

  const onDelete = async (row) => {
    const id = row?.role_id;
    if (!id) return;
    if (!window.confirm('Delete this role?')) return;
    try {
      await roleService.remove(token, id);
      setSuccess('Role deleted');
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Failed to delete role');
    }
  };

  const companyOptions = companies
    .map((c) => ({ value: String(c.companyCode || ''), label: `${c.companyCode || '-'} - ${c.companyName || '-'}` }))
    .filter((x) => x.value);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>Roles</Typography>
        <Button variant="contained" onClick={openAddDialog}>Add Role</Button>
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
            sx={{ minWidth: 240 }}
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
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="created_at">Created At</MenuItem>
            <MenuItem value="role_name">Role Name</MenuItem>
            <MenuItem value="role_code">Role Code</MenuItem>
            <MenuItem value="company_code">Company</MenuItem>
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
              <TableCell>Role Code</TableCell>
              <TableCell>Role Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>System</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.role_id}>
                <TableCell>{fmt(row.role_code)}</TableCell>
                <TableCell>{fmt(row.role_name)}</TableCell>
                <TableCell>{fmt(row.company_code)}</TableCell>
                <TableCell>{fmt(row.description)}</TableCell>
                <TableCell><Chip size="small" label={row.is_system ? 'Yes' : 'No'} color={row.is_system ? 'info' : 'default'} /></TableCell>
                <TableCell><Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} /></TableCell>
                <TableCell>{fmtDateTime(row.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}><EditRoundedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No roles found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              size="small"
              label="Company"
              value={form.company_code}
              onChange={(e) => onFormChange('company_code', e.target.value)}
            >
              {companyOptions.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Role Code" value={form.role_code} onChange={(e) => onFormChange('role_code', e.target.value)} />
            <TextField size="small" label="Role Name" value={form.role_name} onChange={(e) => onFormChange('role_name', e.target.value)} />
            <TextField size="small" label="Description" value={form.description} onChange={(e) => onFormChange('description', e.target.value)} multiline minRows={2} />
            <TextField
              select
              size="small"
              label="System Role"
              value={form.is_system ? 'true' : 'false'}
              onChange={(e) => onFormChange('is_system', e.target.value === 'true')}
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
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
