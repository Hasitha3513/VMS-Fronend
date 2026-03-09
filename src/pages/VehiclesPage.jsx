import {
  Alert, Box, Button, Card, CardContent, Chip, Grid, IconButton,
  InputAdornment, LinearProgress, MenuItem, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { apiFetch } from '../services/apiClient';

function VehicleTypeIcon({ type }) {
  const t = (type || '').toLowerCase();
  if (t.includes('truck') || t.includes('van') || t.includes('ship')) return <LocalShippingRoundedIcon />;
  if (t.includes('bike') || t.includes('motor') || t.includes('two')) return <TwoWheelerRoundedIcon />;
  return <DirectionsCarRoundedIcon />;
}

function computeStats(rows) {
  return {
    total:       rows.length,
    active:      rows.filter((r) => (r.status || r.statusId || '').toUpperCase() === 'ACTIVE').length,
    maintenance: rows.filter((r) => (r.status || r.statusId || '').toUpperCase() === 'MAINTENANCE').length,
    inactive:    rows.filter((r) => (r.status || r.statusId || '').toUpperCase() === 'INACTIVE').length,
  };
}

const defaults = { registrationNo: '', make_like: '', model_like: '', status: '' };

export default function VehiclesPage() {
  const theme = useTheme();
  const { token } = useAuth();
  const [filters, setFilters] = useState(defaults);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const params = {};
      if (filters.registrationNo) params.registrationNo = filters.registrationNo;
      if (filters.make_like)       params.make_like      = filters.make_like;
      if (filters.model_like)      params.model_like     = filters.model_like;
      if (filters.status)          params.status         = filters.status;
      const data = await apiFetch('/api/v1/fleet/vehicles', { token, params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.message && e.message.includes('404')) { setRows([]); }
      else { setError(e.message || 'Failed to load vehicles'); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const f = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));
  const stats = computeStats(rows);
  const statusStyle = (s) => {
    const st = (s || '').toUpperCase();
    if (st === 'ACTIVE') return { bg: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.main };
    if (st === 'MAINTENANCE') return { bg: alpha(theme.palette.warning.main, 0.14), color: theme.palette.warning.main };
    if (st === 'INACTIVE') return { bg: alpha(theme.palette.error.main, 0.14), color: theme.palette.error.main };
    return { bg: alpha(theme.palette.text.secondary, 0.15), color: theme.palette.text.secondary };
  };
  const fleetStats = [
    { label: 'Total Fleet',  key: 'total',       color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.14) },
    { label: 'Active',       key: 'active',      color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.14) },
    { label: 'Maintenance',  key: 'maintenance', color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14) },
    { label: 'Inactive',     key: 'inactive',    color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.14) },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DirectionsCarRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5">Vehicles</Typography>
            <Typography variant="caption" color="text.secondary">{rows.length} vehicles in fleet</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh"><IconButton onClick={load} size="small"><RefreshRoundedIcon /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<AddRoundedIcon />} size="small" sx={{ height: 36 }}>Add Vehicle</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {fleetStats.map((s) => (
          <Grid key={s.key} size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>{s.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 0.5 }}>{stats[s.key]}</Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                    <DirectionsCarRoundedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <FilterListRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">Filters</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
            <TextField
              label="Registration No" value={filters.registrationNo} onChange={f('registrationNo')} size="small" sx={{ minWidth: 160 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            />
            <TextField label="Make" value={filters.make_like} onChange={f('make_like')} size="small" sx={{ minWidth: 120 }} />
            <TextField label="Model" value={filters.model_like} onChange={f('model_like')} size="small" sx={{ minWidth: 120 }} />
            <TextField select label="Status" value={filters.status} onChange={f('status')} size="small" sx={{ minWidth: 130 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="RETIRED">Retired</MenuItem>
            </TextField>
            <Button variant="contained" onClick={load} disabled={loading} startIcon={<SearchRoundedIcon />} size="small" sx={{ alignSelf: 'flex-end', height: 40 }}>Search</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Make / Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Company</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <DirectionsCarRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.2, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2">No vehicles found</Typography>
                    <Typography variant="caption">Try adjusting filters or add a vehicle</Typography>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r, i) => {
                const sc = statusStyle(r.status || r.statusId);
                return (
                  <TableRow key={r.vehicleId || r.id || i}>
                    <TableCell>
                      <Box sx={{ color: 'text.secondary' }}><VehicleTypeIcon type={r.vehicleType || r.type} /></Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.registrationNo || r.registration || 'N/A'} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'action.selected' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {[r.make, r.model].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{r.year || r.manufactureYear || '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.status || r.statusId || 'N/A'} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{r.driverName || r.assignedDriver || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{r.companyCode || r.companyName || '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
