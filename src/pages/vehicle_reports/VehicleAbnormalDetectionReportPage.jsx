import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { useAuth } from '../../app/AuthContext';
import { vehicleReportService } from '../../services/vehicle_reports/vehicleReportService';
import { companyVehicleService } from '../../services/vehicle_management/company_vehicle/companyVehicleService';
import { hiredVehicleService } from '../../services/vehicle_management/hired_vehicle/hiredVehicleService';

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '-');
const fmtNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : '-';
};
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);
const normalizeRow = (r = {}) => ({
  ...r,
  notificationId: pick(r.notificationId, r.notification_id),
  metricValue: pick(r.metricValue, r.metric_value),
  ratedValue: pick(r.ratedValue, r.rated_value),
  ifScore: pick(r.ifScore, r.if_score),
  ratedDeviationPct: pick(r.ratedDeviationPct, r.rated_deviation_pct),
  isAbnormal: pick(r.isAbnormal, r.is_abnormal),
  abnormalReason: pick(r.abnormalReason, r.abnormal_reason),
});
const normalizeDetail = (d = {}) => ({
  ...normalizeRow(d),
  fuelQty: pick(d.fuelQty, d.fuel_qty),
  currentKm: pick(d.currentKm, d.current_km),
  currentHr: pick(d.currentHr, d.current_hr),
  derivedKmDifference: pick(d.derivedKmDifference, d.derived_km_difference),
  derivedHrDifference: pick(d.derivedHrDifference, d.derived_hr_difference),
});
const toVehicleOption = (row = {}, sourceType) => {
  const companyVehicleId = pick(row.companyVehicleId, row.companyvehicleId, row.companyvehicle_id);
  const hiredVehicleId = pick(row.hiredVehicleId, row.hiredvehicleId, row.hiredvehicle_id);
  const keyNumber = pick(row.keyNumber, row.key_number);
  const registrationNumber = pick(row.registrationNumber, row.registration_number);
  const chassisNumber = pick(row.chassisNumber, row.chassis_number);
  return {
    sourceType,
    companyVehicleId: sourceType === 'COMPANY' ? companyVehicleId : null,
    hiredVehicleId: sourceType === 'HIRED' ? hiredVehicleId : null,
    keyNumber,
    registrationNumber,
    chassisNumber,
    label: `[${sourceType}] ${keyNumber || '-'} | ${registrationNumber || '-'} | ${chassisNumber || '-'}`,
  };
};

export default function VehicleAbnormalDetectionReportPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [metricType, setMetricType] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicleOption, setSelectedVehicleOption] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [rebuildMsg, setRebuildMsg] = useState('');
  const [rebuildSeverity, setRebuildSeverity] = useState('info');

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (metricType) params.metricType = metricType;
      if (selectedVehicleOption?.sourceType === 'COMPANY' && selectedVehicleOption?.companyVehicleId) {
        params.companyVehicleId = selectedVehicleOption.companyVehicleId;
      }
      if (selectedVehicleOption?.sourceType === 'HIRED' && selectedVehicleOption?.hiredVehicleId) {
        params.hiredVehicleId = selectedVehicleOption.hiredVehicleId;
      }
      const payload = await vehicleReportService.abnormalDetections(
        token,
        Object.keys(params).length ? params : undefined
      );
      setRows(Array.isArray(payload) ? payload.map(normalizeRow) : []);
    } catch (e) {
      setError(e?.message || 'Failed to load abnormal detections');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, metricType, selectedVehicleOption]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const [vehicleOptionsPayload, companyPayload, hiredPayload] = await Promise.all([
          vehicleReportService.abnormalDetectionVehicleOptions(token).catch(() => []),
          companyVehicleService.list(token, {}).catch(() => []),
          hiredVehicleService.list(token, {}).catch(() => []),
        ]);
        const endpointOptions = Array.isArray(vehicleOptionsPayload) ? vehicleOptionsPayload : [];
        const companyRows = Array.isArray(companyPayload) ? companyPayload : [];
        const hiredRows = Array.isArray(hiredPayload) ? hiredPayload : [];
        const fallbackOptions = [
          ...companyRows.map((r) => toVehicleOption(r, 'COMPANY')),
          ...hiredRows.map((r) => toVehicleOption(r, 'HIRED')),
        ];
        const map = new Map();
        [...endpointOptions, ...fallbackOptions].forEach((opt) => {
          const key = `${opt?.sourceType || ''}|${opt?.companyVehicleId || ''}|${opt?.hiredVehicleId || ''}`;
          if (!key || key === '||') return;
          if (!map.has(key)) map.set(key, opt);
        });
        const merged = Array.from(map.values())
          .filter((x) => x?.companyVehicleId || x?.hiredVehicleId)
          .sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')));
        if (!ignore) setVehicleOptions(merged);
      } catch {
        if (!ignore) setVehicleOptions([]);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      [
        r?.companyCode,
        r?.keyNumber,
        r?.registrationNumber,
        r?.metricType,
        r?.abnormalReason,
      ]
        .map((x) => String(x || '').toLowerCase())
        .some((x) => x.includes(q))
    );
  }, [rows, search]);

  const openDetail = async (notificationId) => {
    if (!token || !notificationId) return;
    setSelectedId(notificationId);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const payload = await vehicleReportService.abnormalDetectionById(token, notificationId);
      setDetail(payload ? normalizeDetail(payload) : null);
    } catch (e) {
      setDetail({ error: e?.message || 'Failed to load detail' });
    } finally {
      setDetailLoading(false);
    }
  };

  const rebuildPrediction = async () => {
    if (!token) return;
    setRebuildLoading(true);
    setRebuildMsg('');
    setRebuildSeverity('info');
    try {
      const payload = await vehicleReportService.abnormalDetectionRebuild(token);
      const rawMessage = payload?.message || 'Rebuild completed';
      let message = rawMessage;
      let severity = 'info';
      try {
        const parsed = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : null;
        if (parsed && typeof parsed === 'object') {
          const modelCount = Number(parsed.model_count ?? 0);
          const fallbackCount = Number(parsed.fallback_group_count ?? 0);
          if (modelCount <= 0) {
            severity = 'warning';
            message = `Rebuild completed with no trained models (model_count=0). Fallback groups: ${fallbackCount}.`;
          } else {
            message = `Rebuild completed. Models: ${modelCount}, abnormal rows: ${parsed.abnormal_rows ?? '-'}, normal rows: ${parsed.normal_rows ?? '-'}.`;
          }
        }
      } catch (_) {
        // Keep raw message if backend output is not JSON.
      }
      setRebuildSeverity(severity);
      setRebuildMsg(message);
      await loadRows();
    } catch (e) {
      setRebuildSeverity('error');
      setRebuildMsg(e?.message || 'Rebuild failed');
    } finally {
      setRebuildLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, md: 3 }, background: 'linear-gradient(120deg,#0f172a,#1e293b,#334155)', color: '#fff' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PsychologyAltRoundedIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Abnormal Detections</Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>Isolation Forest fuel anomaly predictions</Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={rebuildLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />}
              onClick={rebuildPrediction}
              disabled={rebuildLoading}
              sx={{ background: 'linear-gradient(120deg,#2563eb,#0ea5e9)' }}
            >
              {rebuildLoading ? 'Rebuilding...' : 'Rebuild Prediction'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', md: 360 } }}
            />
            <Autocomplete
              size="small"
              options={vehicleOptions}
              value={selectedVehicleOption}
              onChange={(_, value) => setSelectedVehicleOption(value)}
              getOptionLabel={(option) => option?.label || ''}
              isOptionEqualToValue={(option, value) =>
                String(option?.sourceType || '') === String(value?.sourceType || '') &&
                String(option?.companyVehicleId || option?.hiredVehicleId || '') === String(value?.companyVehicleId || value?.hiredVehicleId || '')
              }
              sx={{ width: { xs: '100%', md: 460 } }}
              renderInput={(params) => <TextField {...params} label="Vehicle (Company / Hired)" />}
            />
            <FormControl size="small" sx={{ width: { xs: '100%', md: 220 } }}>
              <InputLabel>Metric Type</InputLabel>
              <Select value={metricType} label="Metric Type" onChange={(e) => setMetricType(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="KMPL">KMPL</MenuItem>
                <MenuItem value="HPL">HPL</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
          {rebuildMsg ? <Alert severity={rebuildSeverity} sx={{ mb: 2 }}>{rebuildMsg}</Alert> : null}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(120deg,#1e3a8a,#1d4ed8,#0369a1)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Fuel Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Company</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Vehicle Key</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Registration</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Metric</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Value</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Rated</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Deviation %</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      No abnormal detection rows found.
                    </TableCell>
                  </TableRow>
                ) : filteredRows.map((r) => (
                  <TableRow key={String(r.notificationId)} hover>
                    <TableCell>{fmtDate(r.fuelDate)}</TableCell>
                    <TableCell>{r.companyCode || '-'}</TableCell>
                    <TableCell>{r.keyNumber || '-'}</TableCell>
                    <TableCell>{r.registrationNumber || '-'}</TableCell>
                    <TableCell>{r.metricType || '-'}</TableCell>
                    <TableCell>{fmtNum(r.metricValue)}</TableCell>
                    <TableCell>{fmtNum(r.ratedValue)}</TableCell>
                    <TableCell>{fmtNum(r.ratedDeviationPct)}</TableCell>
                    <TableCell>{fmtNum(r.ifScore)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.isAbnormal ? 'Abnormal' : 'Normal'}
                        sx={{
                          fontWeight: 700,
                          color: r.isAbnormal ? '#991b1b' : '#166534',
                          backgroundColor: r.isAbnormal ? '#fee2e2' : '#dcfce7',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => openDetail(r.notificationId)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Abnormal Detection Detail</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography>Loading detail...</Typography></Stack>
          ) : detail?.error ? (
            <Alert severity="error">{detail.error}</Alert>
          ) : detail ? (
            <Stack spacing={1}>
              <Typography><b>Notification ID:</b> {detail.notificationId || selectedId}</Typography>
              <Typography><b>Fuel ID:</b> {detail.fuelId || '-'}</Typography>
              <Typography><b>Vehicle:</b> {detail.keyNumber || '-'} | {detail.registrationNumber || '-'}</Typography>
              <Typography><b>Metric:</b> {detail.metricType || '-'} = {fmtNum(detail.metricValue)}</Typography>
              <Typography><b>Rated:</b> {fmtNum(detail.ratedValue)}</Typography>
              <Typography><b>Deviation %:</b> {fmtNum(detail.ratedDeviationPct)}</Typography>
              <Typography><b>Isolation Score:</b> {fmtNum(detail.ifScore)}</Typography>
              <Typography><b>Fuel Qty:</b> {fmtNum(detail.fuelQty)}</Typography>
              <Typography><b>Current KM / HR:</b> {fmtNum(detail.currentKm)} / {fmtNum(detail.currentHr)}</Typography>
              <Typography><b>Derived KM Diff / HR Diff:</b> {fmtNum(detail.derivedKmDifference)} / {fmtNum(detail.derivedHrDifference)}</Typography>
              <Typography><b>Reason:</b> {detail.abnormalReason || '-'}</Typography>
            </Stack>
          ) : (
            <Typography>No detail found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
