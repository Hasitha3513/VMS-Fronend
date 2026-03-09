import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { useAuth } from '../../app/AuthContext';
import { organizationService } from '../../services/organizationService';
import { supplierService } from '../../services/supplier_management/supplierService';

const emptyForm = {
  supplierCode: '',
  supplierName: '',
  contactName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxId: '',
  supplierTypeId: '',
  isActive: true,
};

export default function SupplierManagementPage() {
  const { token, auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailsPath = location.pathname === '/suppliers/details';

  const [tab, setTab] = useState(isDetailsPath ? 1 : 0);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [supplierTypes, setSupplierTypes] = useState([]);
  const [companyContext, setCompanyContext] = useState({ companyId: '', companyCode: '' });
  const [overview, setOverview] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    totalTypes: 0,
    byType: [],
  });
  const [detailsRows, setDetailsRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyForm);

  const isViewMode = dialogMode === 'view';
  const dialogTitle = dialogMode === 'create' ? 'Add Supplier' : (dialogMode === 'edit' ? 'Edit Supplier' : 'View Supplier');

  useEffect(() => {
    setTab(isDetailsPath ? 1 : 0);
  }, [isDetailsPath]);

  const loadOverview = async () => {
    if (!token) return;
    setOverviewLoading(true);
    try {
      const res = await supplierService.overview(token);
      setOverview({
        totalSuppliers: Number(res?.totalSuppliers || 0),
        activeSuppliers: Number(res?.activeSuppliers || 0),
        inactiveSuppliers: Number(res?.inactiveSuppliers || 0),
        totalTypes: Number(res?.totalTypes || 0),
        byType: Array.isArray(res?.byType) ? res.byType : [],
      });
    } finally {
      setOverviewLoading(false);
    }
  };

  const loadDetails = async () => {
    if (!token) return;
    setDetailsLoading(true);
    try {
      const res = await supplierService.details(token);
      setDetailsRows(Array.isArray(res) ? res : []);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const values = await organizationService.enumValues('supplier_type', { locale: 'en-US', activeOnly: true });
        if (!ignore) setSupplierTypes(Array.isArray(values) ? values : []);
      } catch {
        if (!ignore) setSupplierTypes([]);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      if (!auth?.companyCode) {
        if (!ignore) setCompanyContext({ companyId: '', companyCode: '' });
        return;
      }
      try {
        const companies = await organizationService.listCompanies(token, {
          activeOnly: false,
          companyCode_like: auth.companyCode,
        });
        const rows = Array.isArray(companies)
          ? companies
          : (Array.isArray(companies?.content) ? companies.content : []);
        const own = rows.find(
          (c) => String(c?.companyCode || '').toLowerCase() === String(auth.companyCode).toLowerCase()
        ) || rows[0];
        if (!ignore) {
          setCompanyContext({
            companyId: own?.companyId ? String(own.companyId) : '',
            companyCode: own?.companyCode || auth.companyCode || '',
          });
        }
      } catch {
        if (!ignore) {
          setCompanyContext({
            companyId: '',
            companyCode: auth?.companyCode || '',
          });
        }
      }
    })();
    return () => { ignore = true; };
  }, [token, auth?.companyCode]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setError('');
      try {
        await loadOverview();
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load supplier overview');
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || tab !== 1) return;
      setError('');
      try {
        await loadDetails();
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load supplier details');
      }
    })();
    return () => { ignore = true; };
  }, [token, tab]);

  const filteredDetails = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return detailsRows;
    return detailsRows.filter((r) =>
      [
        r?.supplierCode,
        r?.supplierName,
        r?.supplierTypeName,
        r?.contactName,
        r?.contactPerson,
        r?.phone,
        r?.email,
        r?.taxId,
      ].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [detailsRows, search]);

  const handleTabChange = (_, nextTab) => {
    setTab(nextTab);
    setSuccess('');
    setError('');
    if (nextTab === 1) navigate('/suppliers/details');
    else navigate('/suppliers');
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMode('create');
    setSelectedId('');
    setForm(emptyForm);
  };

  const openCreate = () => {
    setDialogMode('create');
    setSelectedId('');
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setDialogMode('edit');
    setSelectedId(String(row?.supplierId || ''));
    setForm({
      supplierCode: row?.supplierCode || '',
      supplierName: row?.supplierName || '',
      contactName: row?.contactName || '',
      contactPerson: row?.contactPerson || '',
      phone: row?.phone || '',
      email: row?.email || '',
      address: row?.address || '',
      taxId: row?.taxId || '',
      supplierTypeId: row?.supplierTypeId != null ? String(row.supplierTypeId) : '',
      isActive: !!row?.isActive,
    });
    setDialogOpen(true);
  };

  const openView = (row) => {
    setDialogMode('view');
    setSelectedId(String(row?.supplierId || ''));
    setForm({
      supplierCode: row?.supplierCode || '',
      supplierName: row?.supplierName || '',
      contactName: row?.contactName || '',
      contactPerson: row?.contactPerson || '',
      phone: row?.phone || '',
      email: row?.email || '',
      address: row?.address || '',
      taxId: row?.taxId || '',
      supplierTypeId: row?.supplierTypeId != null ? String(row.supplierTypeId) : '',
      isActive: !!row?.isActive,
    });
    setDialogOpen(true);
  };

  const onSave = async () => {
    if (!token || isViewMode) return;
    setSuccess('');
    setError('');

    if (!form.supplierName.trim()) {
      setError('Supplier Name is required');
      return;
    }

    const body = {
      companyId: companyContext.companyId || null,
      companyCode: companyContext.companyCode || null,
      supplierName: form.supplierName.trim(),
      contactName: form.contactName.trim() || null,
      contactPerson: form.contactPerson.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      taxId: form.taxId.trim() || null,
      supplierTypeId: form.supplierTypeId ? Number(form.supplierTypeId) : null,
      isActive: !!form.isActive,
    };

    setSaving(true);
    try {
      if (dialogMode === 'edit' && selectedId) {
        await supplierService.update(token, selectedId, body);
        setSuccess('Supplier updated successfully');
      } else {
        await supplierService.create(token, body);
        setSuccess('Supplier added successfully');
      }
      closeDialog();
      await Promise.all([loadDetails(), loadOverview()]);
    } catch (e) {
      setError(e?.message || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    const id = row?.supplierId;
    if (!token || !id) return;
    const ok = window.confirm(`Delete supplier "${row?.supplierName || id}"?`);
    if (!ok) return;

    setSuccess('');
    setError('');
    try {
      await supplierService.delete(token, id);
      setSuccess('Supplier deleted successfully');
      await Promise.all([loadDetails(), loadOverview()]);
    } catch (e) {
      setError(e?.message || 'Failed to delete supplier');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 4 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <StorefrontRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Supplier Management
          </Typography>
        </Stack>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Supplier Overview" />
          <Tab label="Supplier Details" />
        </Tabs>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        {tab === 0 && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {[
                { label: 'Total Suppliers', value: overview.totalSuppliers },
                { label: 'Active Suppliers', value: overview.activeSuppliers },
                { label: 'Inactive Suppliers', value: overview.inactiveSuppliers },
                { label: 'Supplier Types', value: overview.totalTypes },
              ].map((x) => (
                <Card key={x.label} variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{x.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{x.value}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Suppliers by Type</Typography>
                {overviewLoading ? <CircularProgress size={18} /> : null}
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {(overview.byType || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No type data found.</Typography>
                ) : (
                  overview.byType.map((x, i) => (
                    <Chip
                      key={`${x?.supplierTypeId || 'type'}-${i}`}
                      label={`${x?.supplierTypeName || 'Unknown'}: ${x?.supplierCount || 0}`}
                      variant="outlined"
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
              <TextField
                size="small"
                label="Search suppliers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: { xs: '100%', md: 340 } }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                {detailsLoading ? <CircularProgress size={20} /> : null}
                <Button variant="contained" onClick={openCreate}>Add Supplier</Button>
              </Stack>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier Code</TableCell>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No supplier details found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDetails.map((r, idx) => (
                      <TableRow key={String(r?.supplierId || idx)} hover>
                        <TableCell>{r?.supplierCode || '—'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{r?.supplierName || '—'}</TableCell>
                        <TableCell>{r?.supplierTypeName || '—'}</TableCell>
                        <TableCell>{r?.contactPerson || r?.contactName || '—'}</TableCell>
                        <TableCell>{r?.phone || '—'}</TableCell>
                        <TableCell>{r?.email || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r?.isActive ? 'Active' : 'Inactive'}
                            color={r?.isActive ? 'success' : 'default'}
                            variant={r?.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="outlined" onClick={() => openView(r)}>View</Button>
                            <Button size="small" variant="outlined" onClick={() => openEdit(r)}>Edit</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => onDelete(r)}>Delete</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1.5} sx={{ mt: 0.2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Supplier Code"
                value={form.supplierCode || (dialogMode === 'create' ? 'Auto-generated' : '')}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Supplier Name" value={form.supplierName} onChange={(e) => setField('supplierName', e.target.value)} required disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth size="small" disabled={isViewMode}>
                <InputLabel>Supplier Type</InputLabel>
                <Select value={form.supplierTypeId} label="Supplier Type" onChange={(e) => setField('supplierTypeId', e.target.value)}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {supplierTypes.map((x, i) => {
                    const val = x?.id != null ? x.id : (x?.value != null ? x.value : '');
                    const lbl = x?.name || x?.label || String(val || '');
                    return <MenuItem key={`${val}-${i}`} value={String(val)}>{lbl}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Contact Name" value={form.contactName} onChange={(e) => setField('contactName', e.target.value)} disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Contact Person" value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Tax ID" value={form.taxId} onChange={(e) => setField('taxId', e.target.value)} disabled={isViewMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" disabled={isViewMode}>
                <InputLabel>Status</InputLabel>
                <Select value={form.isActive ? 'true' : 'false'} label="Status" onChange={(e) => setField('isActive', e.target.value === 'true')}>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} disabled={isViewMode} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {!isViewMode ? (
            <Button onClick={onSave} variant="contained" disabled={saving}>
              {saving ? 'Saving...' : (dialogMode === 'edit' ? 'Update' : 'Create')}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
