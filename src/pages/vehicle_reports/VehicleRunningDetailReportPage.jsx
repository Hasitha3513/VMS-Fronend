import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useAuth } from '../../app/AuthContext';
import { vehicleReportService } from '../../services/vehicle_reports/vehicleReportService';
import { vehicleRunningLogService } from '../../services/vehicle_management/vehicle_running_log/vehicleRunningLogService';
import { organizationService } from '../../services/organizationService';
import { rowsFrom } from '../employee_hr_management/shared/hrCrudCommon';

const fmt = (value) => (value == null || value === '' ? '-' : String(value));
const fmtNum = (value) => (value == null ? '-' : Number(value).toLocaleString());
const fmtDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10);
};

const toMonthInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const monthBounds = (monthValue) => {
  const [y, m] = String(monthValue || '').split('-').map(Number);
  if (!y || !m) return null;
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const toIso = (dt) => dt.toISOString().slice(0, 10);
  return { from: toIso(start), to: toIso(end) };
};

const aggregateMonthlyFromRows = (rows, monthValue) => {
  const bounds = monthBounds(monthValue);
  if (!bounds) return [];
  const [y, m] = monthValue.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  const byDay = new Map();
  for (const row of rows || []) {
    const day = String(row?.startLogDate || '');
    if (!day || day < bounds.from || day > bounds.to) continue;
    const cur = byDay.get(day) || { day, worked: true, startMeter: null, endMeter: null, totalDistance: 0, engineHours: 0, tripsCount: 0 };
    const startMeter = row?.startOdometer ?? row?.startHourmeter ?? null;
    const endMeter = row?.endOdometer ?? row?.endHourmeter ?? null;
    if (cur.startMeter == null && startMeter != null) cur.startMeter = startMeter;
    if (endMeter != null) cur.endMeter = endMeter;
    cur.totalDistance += Number(row?.totalDistance || 0);
    cur.engineHours += Number(row?.engineHours || 0);
    cur.tripsCount += 1;
    byDay.set(day, cur);
  }
  const out = [];
  for (let d = 1; d <= days; d += 1) {
    const date = `${monthValue}-${String(d).padStart(2, '0')}`;
    const hit = byDay.get(date);
    out.push(hit || { day: date, worked: false, startMeter: null, endMeter: null, totalDistance: null, engineHours: null, tripsCount: 0 });
  }
  return out;
};

const pickMeter = (row, start = true) => {
  if (!row) return null;
  return start
    ? (row.startOdometer ?? row.startHourmeter ?? null)
    : (row.endOdometer ?? row.endHourmeter ?? null);
};

function buildVehicleLabel(item) {
  const key = item.identificationCode || '-';
  const reg = item.registrationNumber || '-';
  const chassis = item.chassisNumber || '-';
  return `${key} | ${reg} | ${chassis}`;
}

export default function VehicleRunningDetailReportPage() {
  const { token, auth } = useAuth();

  const [tab, setTab] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [dashboardRows, setDashboardRows] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dayWiseRows, setDayWiseRows] = useState([]);
  const [dayWiseLoading, setDayWiseLoading] = useState(false);
  const [dayWiseError, setDayWiseError] = useState('');

  const today = useMemo(() => new Date(), []);
  const firstDayOfMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

  const [monthValue, setMonthValue] = useState(toMonthInput(new Date()));
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState('');
  const [runningLogRows, setRunningLogRows] = useState([]);
  const [runningLogLoading, setRunningLogLoading] = useState(false);
  const [runningLogError, setRunningLogError] = useState('');

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
        const merged = rowsFrom(vehiclesRaw).map((v) => ({
          vehicleId: String(v.vehicleId || ''),
          runningVehicleId: String(v.runningVehicleId || v.vehicleId || ''),
          vehicleSource: v.vehicleSource || 'Vehicle',
          identificationCode: v.identificationCode || '',
          registrationNumber: v.registrationNumber || '',
          chassisNumber: v.chassisNumber || '',
          raw: v || null,
          label: v.label || buildVehicleLabel({
            identificationCode: v.identificationCode || '',
            registrationNumber: v.registrationNumber || '',
            chassisNumber: v.chassisNumber || '',
          }),
        })).filter((v) => v.vehicleId);
        const sorted = merged.sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')));
        if (!ignore) {
          setVehicleOptions(sorted);
          if (!selectedVehicleId || !sorted.some((x) => x.vehicleId === selectedVehicleId)) {
            setSelectedVehicleId(sorted[0]?.vehicleId || '');
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
    () => selectedVehicle?.runningVehicleId || selectedVehicleId,
    [selectedVehicle?.runningVehicleId, selectedVehicleId]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !queryVehicleId) {
        setDashboardRows([]);
        return;
      }
      setDashboardLoading(true);
      setDashboardError('');
      try {
        const params = {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId,
          startLogDate_from: dateFrom || undefined,
          startLogDate_to: dateTo || undefined,
          sortBy: 'startLogDate',
          sortDir: 'asc',
        };
        const res = await vehicleReportService.runningDetail(token, params);
        if (!ignore) setDashboardRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) setDashboardError(e?.message || 'Failed to load vehicle running details');
      } finally {
        if (!ignore) setDashboardLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, dateFrom, dateTo]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !queryVehicleId) {
        setDayWiseRows([]);
        return;
      }
      setDayWiseLoading(true);
      setDayWiseError('');
      try {
        const res = await vehicleReportService.runningDetailDayWise(token, {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId,
          fromDate: dateFrom || undefined,
          toDate: dateTo || undefined,
        });
        if (!ignore) setDayWiseRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) setDayWiseError(e?.message || 'Failed to load day-wise chart data');
      } finally {
        if (!ignore) setDayWiseLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, dateFrom, dateTo]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !queryVehicleId) {
        setMonthlyRows([]);
        return;
      }
      setMonthlyLoading(true);
      setMonthlyError('');
      try {
        const params = {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId,
          month: monthValue,
        };
        const res = await vehicleReportService.runningDetailMonthly(token, params);
        const parsed = Array.isArray(res) ? res : [];
        if (parsed.length > 0) {
          if (!ignore) setMonthlyRows(parsed);
        } else {
          // Fallback: aggregate from running-details endpoint (source: vehicle_running_log).
          const bounds = monthBounds(monthValue);
          const dailyRes = await vehicleReportService.runningDetail(token, {
            companyId: companyId || undefined,
            vehicleId: queryVehicleId,
            startLogDate_from: bounds?.from,
            startLogDate_to: bounds?.to,
            sortBy: 'startLogDate',
            sortDir: 'asc',
          });
          if (!ignore) setMonthlyRows(aggregateMonthlyFromRows(Array.isArray(dailyRes) ? dailyRes : [], monthValue));
        }
      } catch (e) {
        try {
          const bounds = monthBounds(monthValue);
          const dailyRes = await vehicleReportService.runningDetail(token, {
            companyId: companyId || undefined,
            vehicleId: queryVehicleId,
            startLogDate_from: bounds?.from,
            startLogDate_to: bounds?.to,
            sortBy: 'startLogDate',
            sortDir: 'asc',
          });
          if (!ignore) {
            setMonthlyRows(aggregateMonthlyFromRows(Array.isArray(dailyRes) ? dailyRes : [], monthValue));
            setMonthlyError('');
          }
        } catch {
          if (!ignore) setMonthlyError(e?.message || 'Failed to load monthly running details');
        }
      } finally {
        if (!ignore) setMonthlyLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, monthValue]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !queryVehicleId) {
        setRunningLogRows([]);
        return;
      }
      setRunningLogLoading(true);
      setRunningLogError('');
      try {
        const res = await vehicleRunningLogService.list(token, {
          companyId: companyId || undefined,
          vehicleId: queryVehicleId,
          startLogDate_from: dateFrom || undefined,
          startLogDate_to: dateTo || undefined,
          sortBy: 'startLogDate',
          sortDir: 'desc',
        });
        if (!ignore) setRunningLogRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) setRunningLogError(e?.message || 'Failed to load vehicle running logs');
      } finally {
        if (!ignore) setRunningLogLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, companyId, queryVehicleId, dateFrom, dateTo]);

  const dashboardSummary = useMemo(() => {
    const tripCount = dashboardRows.length;
    const totalDistance = dashboardRows
      .map((r) => Number(r.totalDistance || 0))
      .reduce((a, b) => a + b, 0);
    const totalHours = dashboardRows
      .map((r) => Number(r.engineHours || 0))
      .reduce((a, b) => a + b, 0);
    const firstRow = dashboardRows[0];
    const lastRow = dashboardRows[dashboardRows.length - 1];
    return {
      tripCount,
      totalDistance,
      totalHours,
      startMeter: pickMeter(firstRow, true),
      endMeter: pickMeter(lastRow, false),
    };
  }, [dashboardRows]);

  const chartModel = useMemo(() => {
    const rows = Array.isArray(dayWiseRows) ? dayWiseRows : [];
    if (rows.length === 0) return null;
    const width = 900;
    const height = 300;
    const padLeft = 44;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 34;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;
    const maxY = Math.max(
      ...rows.map((r) => Math.max(Number(r.totalDistance || 0), Number(r.engineHours || 0))),
      1
    );
    const xForIndex = (i) => (rows.length <= 1 ? padLeft : padLeft + (i / (rows.length - 1)) * innerW);
    const yForValue = (v) => padTop + ((maxY - Number(v || 0)) / maxY) * innerH;
    const distancePoints = rows.map((r, i) => ({ x: xForIndex(i), y: yForValue(r.totalDistance), day: r.day, value: Number(r.totalDistance || 0) }));
    const hourPoints = rows.map((r, i) => ({ x: xForIndex(i), y: yForValue(r.engineHours), day: r.day, value: Number(r.engineHours || 0) }));
    const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    return {
      width,
      height,
      padLeft,
      padTop,
      innerH,
      maxY,
      distancePoints,
      hourPoints,
      distancePath: toPath(distancePoints),
      hourPath: toPath(hourPoints),
      xLabels: rows.map((r, i) => ({ day: r.day, x: xForIndex(i) })),
    };
  }, [dayWiseRows]);

  const printSummary = () => {
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) return;
    const rowsHtml = dashboardRows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${fmtDate(r.startLogDate)}</td>
        <td>${fmt(pickMeter(r, true))}</td>
        <td>${fmt(pickMeter(r, false))}</td>
        <td>${fmtNum(r.totalDistance)}</td>
        <td>${fmtNum(r.engineHours)}</td>
        <td>${fmt(r.projectName)}</td>
        <td>${fmt(r.supervisorName)}</td>
        <td>${fmt(r.workDescription)}</td>
      </tr>
    `).join('');
    popup.document.write(`
      <html>
      <head>
        <title>Vehicle Running Summary Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          h1 { margin: 0 0 8px; }
          .meta { margin-bottom: 16px; font-size: 14px; }
          .cards { display: flex; gap: 12px; margin-bottom: 16px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; min-width: 160px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Vehicle Running Summary Report</h1>
        <div class="meta">
          <div><strong>Vehicle:</strong> ${fmt(selectedVehicle?.label)}</div>
          <div><strong>Source:</strong> ${fmt(selectedVehicle?.vehicleSource)}</div>
          <div><strong>Date Range:</strong> ${fmt(dateFrom)} to ${fmt(dateTo)}</div>
        </div>
        <div class="cards">
          <div class="card"><strong>Total Trips</strong><div>${fmtNum(dashboardSummary.tripCount)}</div></div>
          <div class="card"><strong>Total Distance</strong><div>${fmtNum(dashboardSummary.totalDistance)}</div></div>
          <div class="card"><strong>Total Engine Hours</strong><div>${fmtNum(dashboardSummary.totalHours)}</div></div>
          <div class="card"><strong>Start / End Meter</strong><div>${fmt(dashboardSummary.startMeter)} / ${fmt(dashboardSummary.endMeter)}</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Start Meter</th><th>End Meter</th><th>Total Odometer/Distance</th><th>Engine Hours</th><th>Project</th><th>Supervisor</th><th>Work Description</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="9">No records found.</td></tr>'}</tbody>
        </table>
      </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ p: 2.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Vehicle Running Details</Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard and monthly day-wise running analysis.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2.5, pt: 1 }}>
          <Tab label="Dashboard" />
          <Tab label="Monthly Day-Wise Table" />
          <Tab label="Vehicle Running Logs" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Autocomplete
                options={vehicleOptions}
                value={selectedVehicle}
                onChange={(_, v) => setSelectedVehicleId(v?.vehicleId || '')}
                size="small"
                sx={{ minWidth: 420, flex: 1 }}
                getOptionLabel={(o) => o?.label || ''}
                isOptionEqualToValue={(o, v) => String(o?.vehicleId) === String(v?.vehicleId)}
                renderInput={(params) => <TextField {...params} label="Vehicle Dropdown (Searchable)" placeholder="Search by identification / registration / chassis" />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack spacing={0.2}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.vehicleSource}</Typography>
                    </Stack>
                  </li>
                )}
              />
              <TextField size="small" label="Date From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Date To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={printSummary}>Print Summary</Button>
            </Stack>

            {dashboardError ? <Alert severity="error">{dashboardError}</Alert> : null}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Vehicle Source</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{fmt(selectedVehicle?.vehicleSource)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Identification / Registration / Chassis</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{fmt(selectedVehicle?.label)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Total Trips</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{fmtNum(dashboardSummary.tripCount)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Total Odometer/Distance</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{fmtNum(dashboardSummary.totalDistance)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Total Hourmeter/Engine Hours</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{fmtNum(dashboardSummary.totalHours)}</Typography>
              </Paper>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.2 }}>Day-Wise Running Data (Single Chart View)</Typography>
              {dayWiseError ? <Alert severity="error" sx={{ mb: 1.5 }}>{dayWiseError}</Alert> : null}
              {dayWiseLoading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={26} /></Box>
              ) : !chartModel ? (
                <Typography color="text.secondary">No day-wise running data found.</Typography>
              ) : (
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label="Distance" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} />
                    <Chip size="small" label="Engine Hours" variant="outlined" sx={{ borderColor: 'success.main', color: 'success.main' }} />
                  </Stack>
                  <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 720 }}>
                      <svg viewBox={`0 0 ${chartModel.width} ${chartModel.height}`} width="100%" height="300" role="img" aria-label="Day-wise line chart">
                        <line x1={chartModel.padLeft} y1={chartModel.padTop} x2={chartModel.padLeft} y2={chartModel.padTop + chartModel.innerH} stroke="#bdbdbd" strokeWidth="1" />
                        <line x1={chartModel.padLeft} y1={chartModel.padTop + chartModel.innerH} x2={chartModel.width - 16} y2={chartModel.padTop + chartModel.innerH} stroke="#bdbdbd" strokeWidth="1" />
                        <line x1={chartModel.padLeft} y1={chartModel.padTop} x2={chartModel.width - 16} y2={chartModel.padTop} stroke="#eeeeee" strokeWidth="1" />
                        <line x1={chartModel.padLeft} y1={chartModel.padTop + (chartModel.innerH / 2)} x2={chartModel.width - 16} y2={chartModel.padTop + (chartModel.innerH / 2)} stroke="#eeeeee" strokeWidth="1" />
                        <path d={chartModel.distancePath} fill="none" stroke="#1976d2" strokeWidth="2.5" />
                        <path d={chartModel.hourPath} fill="none" stroke="#2e7d32" strokeWidth="2" strokeDasharray="6 4" />
                        {chartModel.distancePoints.map((p) => (
                          <g key={`dist-${p.day}`}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#1976d2" />
                            <title>{`${p.day} Distance: ${p.value}`}</title>
                          </g>
                        ))}
                        {chartModel.hourPoints.map((p) => (
                          <g key={`hr-${p.day}`}>
                            <circle cx={p.x} cy={p.y} r="2.8" fill="#2e7d32" />
                            <title>{`${p.day} Hours: ${p.value}`}</title>
                          </g>
                        ))}
                        <text x="8" y={chartModel.padTop + 8} fontSize="11" fill="#616161">{fmtNum(chartModel.maxY)}</text>
                        <text x="8" y={chartModel.padTop + chartModel.innerH + 2} fontSize="11" fill="#616161">0</text>
                        {chartModel.xLabels
                          .filter((_, i) => i % Math.max(1, Math.ceil(chartModel.xLabels.length / 8)) === 0 || i === chartModel.xLabels.length - 1)
                          .map((l) => (
                            <text key={`x-${l.day}`} x={l.x} y={chartModel.height - 10} textAnchor="middle" fontSize="10" fill="#616161">
                              {String(l.day).slice(5)}
                            </text>
                          ))}
                      </svg>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Paper>

            <Paper variant="outlined">
              <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Date Range Wise Vehicle Running Detail Table
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Start Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>End Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Odometer/Distance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Engine Hours</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Supervisor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Work Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={26} />
                        </TableCell>
                      </TableRow>
                    ) : dashboardRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No running details found for selected filters.
                        </TableCell>
                      </TableRow>
                    ) : dashboardRows.map((row, idx) => (
                      <TableRow key={String(row.logId || idx)} hover>
                        <TableCell>{fmtDate(row.startLogDate)}</TableCell>
                        <TableCell>{fmtNum(pickMeter(row, true))}</TableCell>
                        <TableCell>{fmtNum(pickMeter(row, false))}</TableCell>
                        <TableCell>{fmtNum(row.totalDistance)}</TableCell>
                        <TableCell>{fmtNum(row.engineHours)}</TableCell>
                        <TableCell>{fmt(row.projectName)}</TableCell>
                        <TableCell>{fmt(row.supervisorName)}</TableCell>
                        <TableCell>{fmt(row.workDescription)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Autocomplete
                options={vehicleOptions}
                value={selectedVehicle}
                onChange={(_, v) => setSelectedVehicleId(v?.vehicleId || '')}
                size="small"
                sx={{ minWidth: 420, flex: 1 }}
                getOptionLabel={(o) => o?.label || ''}
                isOptionEqualToValue={(o, v) => String(o?.vehicleId) === String(v?.vehicleId)}
                renderInput={(params) => <TextField {...params} label="Vehicle Dropdown (Searchable)" placeholder="Search by identification / registration / chassis" />}
              />
              <TextField
                size="small"
                label="Month"
                type="month"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 220 }}
              />
            </Stack>

            {monthlyError ? <Alert severity="error">{monthlyError}</Alert> : null}

            <Paper variant="outlined">
              <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Monthly Day Wise Worked Total Odometer/Hourmeter Table
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Worked</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Start Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>End Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Odometer/Distance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Hourmeter/Engine Hours</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Trips</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={26} />
                        </TableCell>
                      </TableRow>
                    ) : monthlyRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No monthly day-wise records found.
                        </TableCell>
                      </TableRow>
                    ) : monthlyRows.map((row, idx) => (
                      <TableRow key={`${row.day || idx}`} hover>
                        <TableCell>{fmtDate(row.day)}</TableCell>
                        <TableCell>{row.worked ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{fmtNum(row.startMeter)}</TableCell>
                        <TableCell>{fmtNum(row.endMeter)}</TableCell>
                        <TableCell>{fmtNum(row.totalDistance)}</TableCell>
                        <TableCell>{fmtNum(row.engineHours)}</TableCell>
                        <TableCell>{fmtNum(row.tripsCount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <Autocomplete
                options={vehicleOptions}
                value={selectedVehicle}
                onChange={(_, v) => setSelectedVehicleId(v?.vehicleId || '')}
                size="small"
                sx={{ minWidth: 420, flex: 1 }}
                getOptionLabel={(o) => o?.label || ''}
                isOptionEqualToValue={(o, v) => String(o?.vehicleId) === String(v?.vehicleId)}
                renderInput={(params) => <TextField {...params} label="Vehicle Dropdown (Searchable)" placeholder="Search by identification / registration / chassis" />}
              />
              <TextField size="small" label="Date From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Date To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Stack>

            {runningLogError ? <Alert severity="error">{runningLogError}</Alert> : null}

            <Paper variant="outlined">
              <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Vehicle Running Logs
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Start Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>End Meter</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Distance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Engine Hours</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Work Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {runningLogLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={26} />
                        </TableCell>
                      </TableRow>
                    ) : runningLogRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No vehicle running logs found.
                        </TableCell>
                      </TableRow>
                    ) : runningLogRows.map((row, idx) => (
                      <TableRow key={String(row.logId || idx)} hover>
                        <TableCell>{fmtDate(row.startLogDate)}</TableCell>
                        <TableCell>{fmtDate(row.endLogDate)}</TableCell>
                        <TableCell>{fmtNum(pickMeter(row, true))}</TableCell>
                        <TableCell>{fmtNum(pickMeter(row, false))}</TableCell>
                        <TableCell>{fmtNum(row.totalDistance)}</TableCell>
                        <TableCell>{fmtNum(row.engineHours)}</TableCell>
                        <TableCell>{fmt(row.workDescription)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
