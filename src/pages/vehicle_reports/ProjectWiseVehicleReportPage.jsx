import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
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
import { useAuth } from '../../app/AuthContext';
import { organizationService } from '../../services/organizationService';
import { vehicleReportService } from '../../services/vehicle_reports/vehicleReportService';
import { rowsFrom } from '../employee_hr_management/shared/hrCrudCommon';

const fmt = (value) => (value == null || value === '' ? '-' : String(value));
const fmtDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
};
const fmtDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

function buildVehicleLabel(item) {
  const key = item.identificationCode || '-';
  const reg = item.registrationNumber || '-';
  const chassis = item.chassisNumber || '-';
  return `${key} | ${reg} | ${chassis}`;
}

export default function ProjectWiseVehicleReportPage() {
  const { token, auth } = useAuth();

  const [tab, setTab] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [baseLocationType, setBaseLocationType] = useState('');
  const [locationType, setLocationType] = useState('');
  const [locationName, setLocationName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('recordedAt');
  const [sortDir, setSortDir] = useState('desc');

  const [rows, setRows] = useState([]);
  const [cardRows, setCardRows] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        let resolvedCompanyId = auth?.companyId ? String(auth.companyId) : '';
        if (!resolvedCompanyId && auth?.companyCode) {
          const companies = rowsFrom(await organizationService.listCompanies(token, {
            activeOnly: false,
            companyCode_like: auth.companyCode,
          }));
          const own = companies.find((c) => String(c.companyCode || '').toLowerCase() === String(auth.companyCode || '').toLowerCase()) || companies[0];
          if (own?.companyId) resolvedCompanyId = String(own.companyId);
        }
        if (!ignore) setCompanyId(resolvedCompanyId || '');
      } catch {
        if (!ignore) setCompanyId('');
      }
    })();
    return () => { ignore = true; };
  }, [token, auth?.companyId, auth?.companyCode]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const vehiclesRaw = await vehicleReportService.runningDetailVehicleOptions(token, {
          companyId: companyId || undefined,
        });
        const merged = rowsFrom(vehiclesRaw)
          .map((v) => ({
            vehicleId: String(v.vehicleId || ''),
            runningVehicleId: String(v.runningVehicleId || v.vehicleId || ''),
            vehicleSource: v.vehicleSource || 'Vehicle',
            identificationCode: v.identificationCode || '',
            registrationNumber: v.registrationNumber || '',
            chassisNumber: v.chassisNumber || '',
            label: v.label || buildVehicleLabel(v),
          }))
          .filter((v) => v.vehicleId)
          .sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')));

        if (!ignore) {
          setVehicleOptions(merged);
          if (!selectedVehicleId || !merged.some((x) => x.vehicleId === selectedVehicleId)) {
            setSelectedVehicleId('');
          }
        }
      } catch {
        if (!ignore) {
          setVehicleOptions([]);
          setSelectedVehicleId('');
        }
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId]);

  const selectedVehicle = useMemo(
    () => vehicleOptions.find((x) => x.vehicleId === selectedVehicleId) || null,
    [vehicleOptions, selectedVehicleId]
  );
  const queryVehicleId = useMemo(
    () => selectedVehicle?.runningVehicleId || selectedVehicleId || '',
    [selectedVehicle?.runningVehicleId, selectedVehicleId]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const params = {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId || undefined,
          baseLocationType: baseLocationType || undefined,
          locationType_like: locationType || undefined,
          locationName_like: locationName || undefined,
          isCurrent: 'true',
          periodStartDate_from: dateFrom || undefined,
          periodStartDate_to: dateTo || undefined,
          sortBy: sortBy || undefined,
          sortDir: sortDir || undefined,
        };
        const res = await vehicleReportService.locationWise(token, params);
        if (!ignore) setRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) {
          setRows([]);
          setError(e?.message || 'Failed to load location wise report');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, baseLocationType, locationType, locationName, dateFrom, dateTo, sortBy, sortDir]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setCardsLoading(true);
      setCardsError('');
      try {
        const params = {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId || undefined,
          baseLocationType: baseLocationType || undefined,
          locationType_like: locationType || undefined,
          locationName_like: locationName || undefined,
          isCurrent: 'true',
          periodStartDate_from: dateFrom || undefined,
          periodStartDate_to: dateTo || undefined,
        };
        const res = await vehicleReportService.locationWiseCards(token, params);
        if (!ignore) setCardRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) {
          setCardRows([]);
          setCardsError(e?.message || 'Failed to load location cards');
        }
      } finally {
        if (!ignore) setCardsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, baseLocationType, locationType, locationName, dateFrom, dateTo]);

  const dashboard = useMemo(() => {
    const currentCount = rows.filter((r) => r?.isCurrent === true).length;
    const uniqueLocations = new Set(rows.map((r) => String(r?.locationName || '').trim()).filter(Boolean)).size;
    return { currentCount, uniqueLocations };
  }, [rows]);

  const locationCards = useMemo(() => {
    const map = new Map();
    for (const row of cardRows) {
      const location = String(row?.locationName || 'Unknown Location').trim() || 'Unknown Location';
      const vehicleType = String(row?.vehicleTypeName || 'Unknown Type').trim() || 'Unknown Type';
      const qty = Number(row?.vehicleCount || 0);
      const current = map.get(location) || { locationName: location, total: 0, types: [] };
      current.total += qty;
      current.types.push({ vehicleTypeName: vehicleType, vehicleCount: qty });
      map.set(location, current);
    }
    return Array.from(map.values())
      .map((card) => ({
        ...card,
        types: card.types.sort((a, b) => b.vehicleCount - a.vehicleCount || a.vehicleTypeName.localeCompare(b.vehicleTypeName)),
      }))
      .sort((a, b) => b.total - a.total || a.locationName.localeCompare(b.locationName));
  }, [cardRows]);

  const baseLocationOptions = [
    { value: '', label: 'All Base Locations' },
    { value: 'COMPANY', label: 'Company' },
    { value: 'BRANCH', label: 'Branch' },
    { value: 'DEPARTMENT', label: 'Department' },
    { value: 'PROJECT', label: 'Project' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Location Wise Vehicle Report</Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={[{ vehicleId: '', label: 'All Vehicles' }, ...vehicleOptions]}
              value={selectedVehicle || { vehicleId: '', label: 'All Vehicles' }}
              getOptionLabel={(opt) => opt?.label || '-'}
              onChange={(_, val) => setSelectedVehicleId(String(val?.vehicleId || ''))}
              renderInput={(params) => <TextField {...params} label="Vehicle (Company + Hired)" size="small" />}
              isOptionEqualToValue={(opt, val) => String(opt.vehicleId || '') === String(val?.vehicleId || '')}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Base Location"
              value={baseLocationType}
              onChange={(e) => setBaseLocationType(e.target.value)}
              SelectProps={{ native: true }}
            >
              {baseLocationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Location Type" value={locationType} onChange={(e) => setLocationType(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="recordedAt">Recorded At</option>
              <option value="periodStartDate">Period Start Date</option>
              <option value="durationDays">Duration Days</option>
              <option value="locationName">Location Name</option>
              <option value="vehicleDisplayName">Vehicle</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort Direction"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable">
          <Tab label="Dashboard" />
          <Tab label="Location Wise Details" />
        </Tabs>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <CircularProgress size={24} /> : null}

      {tab === 0 ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Paper sx={{ p: 2 }}><Typography variant="subtitle2">Total Records</Typography><Typography variant="h5">{rows.length}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p: 2 }}><Typography variant="subtitle2">Current Records</Typography><Typography variant="h5">{dashboard.currentCount}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p: 2 }}><Typography variant="subtitle2">Unique Locations</Typography><Typography variant="h5">{dashboard.uniqueLocations}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p: 2 }}><Typography variant="subtitle2">Location Cards</Typography><Typography variant="h5">{locationCards.length}</Typography></Paper></Grid>
          </Grid>
          {cardsError ? <Alert severity="warning">{cardsError}</Alert> : null}
          {cardsLoading ? <CircularProgress size={20} /> : null}
          <Grid container spacing={2}>
            {locationCards.map((card) => (
              <Grid item xs={12} md={6} lg={4} key={card.locationName}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography variant="subtitle1" fontWeight={700}>{card.locationName}</Typography>
                      <Chip size="small" color="primary" label={`Total: ${card.total}`} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">Vehicle Type Wise Qty</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {card.types.map((t) => (
                        <Chip
                          key={`${card.locationName}-${t.vehicleTypeName}`}
                          size="small"
                          label={`${t.vehicleTypeName}: ${t.vehicleCount}`}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {!cardsLoading && locationCards.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">No location-wise vehicle type summary found.</Typography>
                </Paper>
              </Grid>
            ) : null}
          </Grid>
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Vehicle Type</TableCell>
                <TableCell>Base Location</TableCell>
                <TableCell>Location Type</TableCell>
                <TableCell>Location Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Zone/Region</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recorded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.locationId}>
                  <TableCell>{fmt(row.vehicleDisplayName)}</TableCell>
                  <TableCell>{fmt(row.vehicleSource)}</TableCell>
                  <TableCell>{fmt(row.vehicleTypeName)}</TableCell>
                  <TableCell>{fmt(row.baseLocationType)}</TableCell>
                  <TableCell>{fmt(row.locationType)}</TableCell>
                  <TableCell>{fmt(row.locationName)}</TableCell>
                  <TableCell>{fmt(row.city)}</TableCell>
                  <TableCell>{fmt(row.assignedZone)} / {fmt(row.assignedRegion)}</TableCell>
                  <TableCell>{fmtDate(row.periodStartDate)} to {fmtDate(row.periodEndDate)}</TableCell>
                  <TableCell>{fmt(row.durationDays)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.isCurrent ? 'Current' : 'Previous'}
                      color={row.isCurrent ? 'success' : 'default'}
                      variant={row.isCurrent ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{fmtDateTime(row.recordedAt)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading ? (
                <TableRow><TableCell colSpan={12} align="center">No records found</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
