import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useAuth } from '../../app/AuthContext';
import { organizationService } from '../../services/organizationService';
import { vehicleReportService } from '../../services/vehicle_reports/vehicleReportService';

const STATUS_OPTIONS = [
  { value: '', label: 'All', color: '#64748b' },
  { value: 'Valid', label: 'Valid', color: '#16a34a' },
  { value: 'Expired', label: 'Expired', color: '#dc2626' },
  { value: 'Suspended', label: 'Suspended', color: '#d97706' },
];

const columns = [
  { key: 'companyName', label: 'Company' },
  { key: 'companyVehicleKeyNumber', label: 'Vehicle Key No' },
  { key: 'companyVehicleRegistrationNumber', label: 'Vehicle Reg No' },
  { key: 'insuranceCompany', label: 'Insurance Company' },
  { key: 'policyNumber', label: 'Policy Number' },
  { key: 'policyStartDate', label: 'Policy Start Date' },
  { key: 'policyExpiryDate', label: 'Policy Expiry Date' },
  { key: 'premiumAmount', label: 'Premium Amount' },
  { key: 'rcStatus', label: 'RC Status' },
  { key: 'daysRemaining', label: 'Days Remaining' },
];

const statusFromRow = (r) => {
  const s = String(r?.insuranceStatus || '').toLowerCase();
  if (s === 'expired') return 'Expired';
  if (s === 'cancelled') return 'Suspended';
  return 'Valid';
};
const statusChipStyle = (s) => s === 'Expired'
  ? { color: '#991b1b', backgroundColor: '#fee2e2', borderColor: '#fca5a5' }
  : s === 'Suspended'
    ? { color: '#92400e', backgroundColor: '#fef3c7', borderColor: '#fcd34d' }
    : { color: '#166534', backgroundColor: '#dcfce7', borderColor: '#86efac' };
const dayBadgeStyle = (d) => {
  const n = Number(d);
  if (!Number.isFinite(n)) return { c: '#334155', b: '#e2e8f0' };
  if (n < 0) return { c: '#991b1b', b: '#fee2e2' };
  if (n <= 30) return { c: '#92400e', b: '#fef3c7' };
  return { c: '#166534', b: '#dcfce7' };
};
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '-');
const fmtDT = (v) => (v ? new Date(v).toLocaleString() : '-');
const fmt = (r, k) => {
  if (k === 'rcStatus') return statusFromRow(r);
  if (k === 'daysRemaining') {
    const n = Number(r?.[k]); if (!Number.isFinite(n)) return '-'; if (n < 0) return `Expired ${Math.abs(n)} day(s) ago`; return `${n} day(s)`;
  }
  if (k === 'policyStartDate' || k === 'policyExpiryDate') return fmtDate(r?.[k]);
  if (k === 'premiumAmount') { const n = Number(r?.[k]); return Number.isFinite(n) ? n.toFixed(2) : '-'; }
  return r?.[k] == null || r?.[k] === '' ? '-' : String(r[k]);
};

export default function VehicleInsuranceReportPage() {
  const { token, auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('policyNumber');
  const [sortDir, setSortDir] = useState('asc');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const res = await organizationService.listCompanies(token, { activeOnly: false, companyCode_like: auth?.companyCode || '' });
        const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
        const selected = list.find((x) => String(x?.companyCode || '').toLowerCase() === String(auth?.companyCode || '').toLowerCase()) || list[0] || null;
        if (!ignore) setCompany(selected);
      } catch { if (!ignore) setCompany(null); }
    })();
    return () => { ignore = true; };
  }, [token, auth?.companyCode]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setLoading(true); setError('');
      try { const res = await vehicleReportService.vehicleInsurance(token); if (!ignore) setRows(Array.isArray(res) ? res : []); }
      catch (e) { if (!ignore) setError(e?.message || 'Failed to load vehicle insurance report'); }
      finally { if (!ignore) setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [token]);

  const filteredRows = useMemo(() => rows.filter((r) => {
    const status = statusFromRow(r);
    if (statusFilter && status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return columns.some((c) => String(fmt(r, c.key)).toLowerCase().includes(q));
  }), [rows, statusFilter, search]);

  const sortedRows = useMemo(() => [...filteredRows].sort((a, b) => {
    const av = String(sortBy === 'rcStatus' ? statusFromRow(a) : (a?.[sortBy] ?? '')).toLowerCase();
    const bv = String(sortBy === 'rcStatus' ? statusFromRow(b) : (b?.[sortBy] ?? '')).toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  }), [filteredRows, sortBy, sortDir]);

  const stats = useMemo(() => {
    const total = sortedRows.length;
    const valid = sortedRows.filter((r) => statusFromRow(r) === 'Valid').length;
    const expired = sortedRows.filter((r) => statusFromRow(r) === 'Expired' || Number(r?.daysRemaining) < 0).length;
    const expiringSoon = sortedRows.filter((r) => { const n = Number(r?.daysRemaining); return Number.isFinite(n) && n >= 0 && n <= 30; }).length;
    return { total, valid, expired, expiringSoon };
  }, [sortedRows]);

  const companyName = company?.companyName || auth?.companyCode || 'Company';
  const companyCode = company?.companyCode || auth?.companyCode || '-';
  const initials = String(companyName).slice(0, 2).toUpperCase();
  const activeFiltersText = [search ? `Search: "${search}"` : '', statusFilter ? `RC Status: ${statusFilter}` : ''].filter(Boolean).join(' | ') || 'No filters';

  const exportToExcel = () => {
    const header = columns.map((c) => c.label).join(',');
    const body = sortedRows.map((r) => columns.map((c) => `"${String(fmt(r, c.key)).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `vehicle-license-report-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const win = window.open('', '_blank', 'width=1400,height=900'); if (!win) return;
    const th = columns.map((c) => `<th>${c.label}</th>`).join('');
    const tr = sortedRows.map((r, i) => `<tr class="${i % 2 ? 'b' : 'a'}">${columns.map((c) => {
      if (c.key === 'rcStatus') { const s = statusFromRow(r); return `<td><span class="p ${s === 'Expired' ? 're' : s === 'Suspended' ? 'am' : 'gr'}">${s}</span></td>`; }
      if (c.key === 'daysRemaining') { const d = dayBadgeStyle(r?.daysRemaining); return `<td><span class="p" style="color:${d.c};background:${d.b}">${fmt(r, c.key)}</span></td>`; }
      return `<td>${fmt(r, c.key)}</td>`;
    }).join('')}</tr>`).join('');
    win.document.write(`<html><head><title>Vehicle License Report</title><style>
      *{box-sizing:border-box} body{font-family:Arial,sans-serif;margin:0;background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .pge{padding:16px}.hdr{background:linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9);color:#fff;border-radius:12px;padding:12px;display:flex;justify-content:space-between}
      .t2{margin-top:8px;background:linear-gradient(120deg,#dbeafe,#bfdbfe);border-radius:10px;padding:10px;display:flex;justify-content:space-between}
      .st{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0}.bx{padding:8px;border-radius:10px;border:1px solid}
      .d{height:4px;border-radius:99px;background:linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#0ea5e9,#8b5cf6);margin:10px 0}
      table{width:100%;border-collapse:collapse;font-size:11px} th{color:#fff;text-transform:uppercase;background:linear-gradient(120deg,#1e3a8a,#1d4ed8,#0369a1)}
      th,td{border:1px solid #cbd5e1;padding:6px}.a{background:#fff}.b{background:#f8fafc}.p{padding:2px 8px;border-radius:999px;font-weight:700}.gr{color:#166534;background:#dcfce7}.re{color:#991b1b;background:#fee2e2}.am{color:#92400e;background:#fef3c7}
      .f{margin-top:8px;padding-top:8px;border-top:1px solid #cbd5e1;font-size:11px;color:#475569;display:flex;justify-content:space-between}
      </style></head><body><div class="pge">
      <div class="hdr"><div><div style="font-size:18px;font-weight:700">${companyName}</div><div>Code: ${companyCode}</div>${company?.address ? `<div>${company.address}</div>` : ''}</div><div>${company?.email ? `<div>Email: ${company.email}</div>` : ''}${company?.phonePrimary ? `<div>Phone: ${company.phonePrimary}</div>` : ''}${company?.registrationNo ? `<div>Registration: ${company.registrationNo}</div>` : ''}</div></div>
      <div class="t2"><div><div style="font-size:16px;font-weight:700">Vehicle License Report</div><div>Registration Certificate (RC) Status & Expiry Tracking</div></div><div>Generated: ${fmtDT(new Date())}<br/>By: ${auth?.employeeName || auth?.username || 'User'}<br/>Records: ${sortedRows.length}</div></div>
      <div class="st"><div class="bx" style="background:#dbeafe;border-color:#93c5fd"><b>TOTAL</b><div style="font-size:20px;font-weight:800">${stats.total}</div></div><div class="bx" style="background:#dcfce7;border-color:#86efac"><b>VALID</b><div style="font-size:20px;font-weight:800">${stats.valid}</div></div><div class="bx" style="background:#fee2e2;border-color:#fca5a5"><b>EXPIRED</b><div style="font-size:20px;font-weight:800">${stats.expired}</div></div><div class="bx" style="background:#fef3c7;border-color:#fcd34d"><b>EXPIRING SOON</b><div style="font-size:20px;font-weight:800">${stats.expiringSoon}</div></div></div>
      <div class="d"></div><table><thead><tr>${th}</tr></thead><tbody>${tr || `<tr><td colspan="${columns.length}" style="text-align:center;padding:20px">No records found.</td></tr>`}</tbody></table>
      <div class="f"><div>Vehicle Management System</div><div>${fmtDT(new Date())}</div></div></div></body></html>`);
    win.document.close(); win.focus(); win.print();
  };

  const StatCard = ({ label, value, icon, p }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${p.bd}`, background: alpha(p.bg, 0.08), transition: 'transform .2s ease', '&:hover': { transform: 'translateY(-3px)' } }}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg,${p.g1},${p.g2})` }}>{icon}</Box>
        <Box><Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: p.tx, fontWeight: 700 }}>{label}</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography></Box>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', p: { xs: 2, md: 3 }, background: 'linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9)', color: '#fff' }}>
          <Box sx={{ position: 'absolute', top: -24, right: -24, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
          <Box sx={{ position: 'absolute', bottom: -32, right: 160, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 54, height: 54, borderRadius: 2.5, border: '1px solid rgba(255,255,255,.4)', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArticleRoundedIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Vehicle License Report</Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>Registration Certificate (RC) Status & Expiry Tracking</Typography>
              </Box>
            </Stack>
            <Chip icon={<BusinessRoundedIcon sx={{ color: '#fff !important' }} />} label={companyName} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.2)', '& .MuiChip-label': { fontWeight: 700 } }} />
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Total Vehicles" value={stats.total} icon={<Inventory2RoundedIcon />} p={{ bg: '#2563eb', bd: '#93c5fd', tx: '#1d4ed8', g1: '#1d4ed8', g2: '#0ea5e9' }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Valid RC" value={stats.valid} icon={<CheckCircleRoundedIcon />} p={{ bg: '#16a34a', bd: '#86efac', tx: '#15803d', g1: '#16a34a', g2: '#22c55e' }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Expired RC" value={stats.expired} icon={<GppBadRoundedIcon />} p={{ bg: '#dc2626', bd: '#fca5a5', tx: '#b91c1c', g1: '#dc2626', g2: '#ef4444' }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Expiring Soon" value={stats.expiringSoon} icon={<WarningAmberRoundedIcon />} p={{ bg: '#d97706', bd: '#fcd34d', tx: '#b45309', g1: '#d97706', g2: '#f59e0b' }} /></Grid>
          </Grid>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
            <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', md: 340 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#64748b' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ width: { xs: '100%', md: 240 } }}>
              <InputLabel>RC Status</InputLabel>
              <Select value={statusFilter} label="RC Status" onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((o) => <MenuItem key={o.value || 'all'} value={o.value}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: o.color }} /><span>{o.label}</span></Stack></MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={exportToExcel} sx={{ borderColor: '#16a34a', color: '#166534' }}>Excel</Button>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdfRoundedIcon />} onClick={printReport} sx={{ borderColor: '#dc2626', color: '#b91c1c' }}>PDF</Button>
              <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setPreviewOpen(true)} sx={{ borderColor: '#7c3aed', color: '#6d28d9' }}>Preview</Button>
              <Button size="small" variant="contained" startIcon={<PrintRoundedIcon />} onClick={printReport} sx={{ background: 'linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9)' }}>Print</Button>
            </Stack>
          </Stack>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(120deg,#1e3a8a,#1d4ed8,#0369a1)' }}>
                  {columns.map((c) => (
                    <TableCell key={c.key} sortDirection={sortBy === c.key ? sortDir : false} sx={{ color: '#fff', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                      <TableSortLabel active={sortBy === c.key} direction={sortBy === c.key ? sortDir : 'asc'} onClick={() => { if (sortBy === c.key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(c.key); setSortDir('asc'); } }} sx={{ color: '#fff !important', '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}>{c.label}</TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow> : sortedRows.length === 0 ? (
                  <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 7 }}><Stack spacing={1} alignItems="center"><DirectionsCarFilledRoundedIcon sx={{ fontSize: 36, color: '#94a3b8' }} /><Typography sx={{ color: '#64748b' }}>No vehicle insurance records found.</Typography></Stack></TableCell></TableRow>
                ) : sortedRows.map((r, i) => {
                  const st = statusFromRow(r); const sc = statusChipStyle(st); const ds = dayBadgeStyle(r?.daysRemaining);
                  return (
                    <TableRow key={String(r?.insuranceId || i)} hover sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc', '&:hover': { backgroundColor: '#e0f2fe !important' } }}>
                      {columns.map((c) => c.key === 'rcStatus' ? <TableCell key={c.key}><Chip label={st} size="small" sx={{ ...sc, borderWidth: 1, borderStyle: 'solid', fontWeight: 700 }} /></TableCell> : c.key === 'daysRemaining' ? <TableCell key={c.key}><Box component="span" sx={{ px: 1.1, py: 0.35, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, color: ds.c, backgroundColor: ds.b }}>{fmt(r, c.key)}</Box></TableCell> : <TableCell key={c.key}>{fmt(r, c.key)}</TableCell>)}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.8rem', color: '#475569' }}>
            <span>Records: {sortedRows.length}</span><span>Filters: {activeFiltersText}</span><span>Generated: {fmtDT(new Date())}</span>
          </Box>
        </Box>
      </Paper>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="xl">
        <DialogTitle sx={{ background: 'linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9)', color: '#fff', fontWeight: 700 }}>Vehicle License Report - Print Preview</DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Paper variant="outlined" sx={{ mb: 1.5, overflow: 'hidden' }}>
            <Box sx={{ p: 1.5, background: 'linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9)', color: '#fff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Stack direction="row" spacing={1.25} alignItems="center"><Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }}>{initials}</Avatar><Box><Typography sx={{ fontWeight: 700 }}>{companyName}</Typography><Typography variant="caption">Code: {companyCode}</Typography>{company?.address ? <Typography variant="caption" sx={{ display: 'block' }}>{company.address}</Typography> : null}</Box></Stack><Box sx={{ textAlign: 'right' }}>{company?.email ? <Typography variant="caption" sx={{ display: 'block' }}>{company.email}</Typography> : null}{company?.phonePrimary ? <Typography variant="caption" sx={{ display: 'block' }}>{company.phonePrimary}</Typography> : null}</Box></Stack>
            </Box>
            <Box sx={{ p: 1.25, background: 'linear-gradient(120deg,#dbeafe,#bfdbfe)' }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" spacing={1} alignItems="center"><ArticleRoundedIcon sx={{ color: '#1e3a8a' }} /><Box><Typography sx={{ fontWeight: 700, color: '#1e3a8a' }}>Vehicle License Report</Typography><Typography variant="caption" sx={{ color: '#334155' }}>Registration Certificate (RC) Status & Expiry Tracking</Typography></Box></Stack><Typography variant="caption">{fmtDT(new Date())} | Records: {sortedRows.length}</Typography></Stack></Box>
          </Paper>
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={6} md={3}><Paper sx={{ p: 1, border: '1px solid #93c5fd', bgcolor: '#dbeafe' }}><Typography variant="caption">Total</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{stats.total}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 1, border: '1px solid #86efac', bgcolor: '#dcfce7' }}><Typography variant="caption">Valid</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{stats.valid}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 1, border: '1px solid #fca5a5', bgcolor: '#fee2e2' }}><Typography variant="caption">Expired</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{stats.expired}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 1, border: '1px solid #fcd34d', bgcolor: '#fef3c7' }}><Typography variant="caption">Expiring Soon</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{stats.expiringSoon}</Typography></Paper></Grid>
          </Grid>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small"><TableHead><TableRow sx={{ background: 'linear-gradient(120deg,#1e3a8a,#1d4ed8,#0369a1)' }}>{columns.map((c) => <TableCell key={c.key} sx={{ color: '#fff', textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</TableCell>)}</TableRow></TableHead><TableBody>{sortedRows.map((r, i) => { const st = statusFromRow(r); const sc = statusChipStyle(st); const ds = dayBadgeStyle(r?.daysRemaining); return <TableRow key={`pr-${String(r?.insuranceId || i)}`} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>{columns.map((c) => c.key === 'rcStatus' ? <TableCell key={c.key}><Chip label={st} size="small" sx={{ ...sc, borderWidth: 1, borderStyle: 'solid', fontWeight: 700 }} /></TableCell> : c.key === 'daysRemaining' ? <TableCell key={c.key}><Box component="span" sx={{ px: 1.1, py: 0.35, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, color: ds.c, backgroundColor: ds.b }}>{fmt(r, c.key)}</Box></TableCell> : <TableCell key={c.key}>{fmt(r, c.key)}</TableCell>)}</TableRow>; })}</TableBody></Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={printReport} sx={{ background: 'linear-gradient(120deg,#1e40af,#2563eb,#0ea5e9)' }}>Print / Save PDF</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
