import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
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
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useAuth } from '../../app/AuthContext';
import { vehicleReportService } from '../../services/vehicle_reports/vehicleReportService';
import { organizationService } from '../../services/organizationService';

const columns = [
  { key: 'companyName', label: 'Company' },
  { key: 'companyVehicleKeyNumber', label: 'Vehicle Key No' },
  { key: 'companyVehicleRegistrationNumber', label: 'Vehicle Reg No' },
  { key: 'registrationDate', label: 'Registration Date' },
  { key: 'registrationExpiry', label: 'Expiry Date' },
  { key: 'registrationCity', label: 'City' },
  { key: 'rcStatus', label: 'RC Status' },
  { key: 'daysRemaining', label: 'Days Remaining' },
];

const formatValue = (value, key) => {
  if (value == null || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'daysRemaining') {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    if (n < 0) return `Expired ${Math.abs(n)} day(s) ago`;
    return `${n} day(s)`;
  }
  if (key === 'createdAt' || key === 'updatedAt') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  return String(value);
};

const toComparable = (value) => {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 1 : 0;
  return String(value).toLowerCase();
};

const getRcStatusColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'valid') return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
  if (s === 'expired') return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
  if (s === 'suspended') return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
  return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
};

const getDaysRemainingStyle = (days) => {
  const n = Number(days);
  if (!Number.isFinite(n) || n < 0) return { color: '#dc2626', bg: '#fee2e2', fontWeight: 700 };
  if (n <= 30) return { color: '#d97706', bg: '#fef3c7', fontWeight: 700 };
  return { color: '#16a34a', bg: '#dcfce7', fontWeight: 600 };
};

export default function VehicleLicenseReportPage() {
  const { token, auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('registrationNumber');
  const [sortDir, setSortDir] = useState('asc');
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await vehicleReportService.vehicleLicense(token);
        if (!ignore) setRows(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load vehicle license report');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const res = await organizationService.listCompanies(token, { page: 0, size: 1 });
        const list = Array.isArray(res) ? res : (res?.content ?? []);
        if (!ignore && list.length > 0) setCompanyInfo(list[0]);
      } catch {
        // company info is optional for the header
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const statusOk = !statusFilter || String(row?.rcStatus || '').toLowerCase() === statusFilter.toLowerCase();
      if (!statusOk) return false;
      if (!q) return true;
      return columns.some((c) => String(row?.[c.key] ?? '').toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const sortedRows = useMemo(() => {
    const next = [...filteredRows];
    next.sort((a, b) => {
      const av = toComparable(a?.[sortBy]);
      const bv = toComparable(b?.[sortBy]);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return next;
  }, [filteredRows, sortBy, sortDir]);

  const onSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('asc');
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const valid = rows.filter((r) => String(r?.rcStatus || '').toLowerCase() === 'valid').length;
    const expired = rows.filter((r) => String(r?.rcStatus || '').toLowerCase() === 'expired').length;
    const expiringSoon = rows.filter((r) => {
      const n = Number(r?.daysRemaining);
      return Number.isFinite(n) && n >= 0 && n <= 30;
    }).length;
    return { total, valid, expired, expiringSoon };
  }, [rows]);

  const exportToExcel = () => {
    const header = columns.map((c) => c.label).join(',');
    const body = sortedRows
      .map((row) => columns.map((c) => `"${String(formatValue(row?.[c.key], c.key)).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const csv = `\uFEFF${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-license-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const buildPrintHtml = (title) => {
    const companyName = companyInfo?.companyName || auth?.companyCode || 'Company';
    const companyCode = companyInfo?.companyCode || auth?.companyCode || '';
    const companyEmail = companyInfo?.email || '';
    const companyPhone = companyInfo?.phonePrimary || '';
    const companyAddress = companyInfo?.address || '';
    const companyReg = companyInfo?.registrationNo || '';
    const generatedAt = new Date().toLocaleString();
    const generatedBy = auth?.employeeName || auth?.username || '';

    const tableHead = columns.map((c) => `<th>${c.label}</th>`).join('');
    const tableRows = sortedRows.map((row, idx) => {
      const rcStatus = String(row?.rcStatus || '');
      const days = Number(row?.daysRemaining);
      let rcBg = '#f0fdf4'; let rcColor = '#166534';
      if (rcStatus.toLowerCase() === 'expired') { rcBg = '#fef2f2'; rcColor = '#991b1b'; }
      if (rcStatus.toLowerCase() === 'suspended') { rcBg = '#fefce8'; rcColor = '#854d0e'; }
      let daysBg = '#f0fdf4'; let daysColor = '#166534';
      if (!Number.isFinite(days) || days < 0) { daysBg = '#fef2f2'; daysColor = '#dc2626'; }
      else if (days <= 30) { daysBg = '#fffbeb'; daysColor = '#d97706'; }

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      return `<tr style="background:${rowBg}">
        ${columns.map((c) => {
          if (c.key === 'rcStatus') {
            return `<td><span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${rcBg};color:${rcColor};font-weight:600;font-size:11px;">${formatValue(row?.[c.key], c.key)}</span></td>`;
          }
          if (c.key === 'daysRemaining') {
            return `<td><span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${daysBg};color:${daysColor};font-weight:700;font-size:11px;">${formatValue(row?.[c.key], c.key)}</span></td>`;
          }
          return `<td>${formatValue(row?.[c.key], c.key)}</td>`;
        }).join('')}
      </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
    .page { max-width: 1100px; margin: 0 auto; padding: 24px; background: #fff; min-height: 100vh; }

    /* Company Header */
    .company-header {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #0ea5e9 100%);
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 20px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .company-logo-circle {
      width: 56px; height: 56px;
      border-radius: 14px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800; color: #fff;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.35);
      letter-spacing: -1px;
    }
    .company-info-left { display: flex; align-items: center; gap: 16px; }
    .company-name { font-size: 22px; font-weight: 800; letter-spacing: -0.4px; }
    .company-sub { font-size: 12.5px; color: rgba(255,255,255,0.8); margin-top: 3px; }
    .company-details-right { text-align: right; font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.7; }
    .company-details-right strong { color: #fff; }

    /* Report Title Bar */
    .report-title-bar {
      background: linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 60%, #f0fdf4 100%);
      border: 1.5px solid #bae6fd;
      border-radius: 10px;
      padding: 14px 20px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-title-left { display: flex; align-items: center; gap: 10px; }
    .report-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #2563eb, #0ea5e9);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #fff;
    }
    .report-name { font-size: 18px; font-weight: 800; color: #1e40af; letter-spacing: -0.3px; }
    .report-sub { font-size: 11.5px; color: #0369a1; margin-top: 2px; }
    .report-meta { text-align: right; font-size: 11.5px; color: #475569; line-height: 1.7; }
    .report-meta strong { color: #1e40af; }

    /* Stats Row */
    .stats-row { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .stat-card {
      flex: 1; min-width: 110px;
      border-radius: 10px;
      padding: 12px 14px;
      border: 1.5px solid;
    }
    .stat-card.total { background: #eff6ff; border-color: #bfdbfe; }
    .stat-card.valid { background: #f0fdf4; border-color: #bbf7d0; }
    .stat-card.expired { background: #fef2f2; border-color: #fecaca; }
    .stat-card.soon { background: #fffbeb; border-color: #fde68a; }
    .stat-label { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .stat-card.total .stat-label { color: #1e40af; }
    .stat-card.valid .stat-label { color: #166534; }
    .stat-card.expired .stat-label { color: #991b1b; }
    .stat-card.soon .stat-label { color: #92400e; }
    .stat-value { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
    .stat-card.total .stat-value { color: #1d4ed8; }
    .stat-card.valid .stat-value { color: #16a34a; }
    .stat-card.expired .stat-value { color: #dc2626; }
    .stat-card.soon .stat-value { color: #d97706; }

    /* Divider */
    .section-divider {
      height: 2px;
      background: linear-gradient(90deg, #2563eb, #0ea5e9, #10b981);
      border-radius: 2px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    /* Table */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr {
      background: linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 50%, #0369a1 100%);
    }
    thead th {
      color: #fff;
      font-weight: 700;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      padding: 10px 12px;
      text-align: left;
      border: none;
    }
    tbody td {
      padding: 9px 12px;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      font-size: 12px;
    }
    tbody tr:last-child td { border-bottom: none; }
    .table-wrapper {
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    /* Footer */
    .report-footer {
      margin-top: 20px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .report-footer strong { color: #334155; }

    @media print {
      body { background: #fff; }
      .page { padding: 12px; }
      .company-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .report-title-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .stat-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Company Header -->
  <div class="company-header">
    <div class="company-info-left">
      <div class="company-logo-circle">${companyName.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="company-name">${companyName}</div>
        ${companyCode ? `<div class="company-sub">Company Code: ${companyCode}</div>` : ''}
        ${companyAddress ? `<div class="company-sub">${companyAddress}</div>` : ''}
      </div>
    </div>
    <div class="company-details-right">
      ${companyEmail ? `<div><strong>Email:</strong> ${companyEmail}</div>` : ''}
      ${companyPhone ? `<div><strong>Phone:</strong> ${companyPhone}</div>` : ''}
      ${companyReg ? `<div><strong>Reg No:</strong> ${companyReg}</div>` : ''}
    </div>
  </div>

  <!-- Report Title Bar -->
  <div class="report-title-bar">
    <div class="report-title-left">
      <div class="report-icon">&#128196;</div>
      <div>
        <div class="report-name">Vehicle License Report</div>
        <div class="report-sub">Registration Certificate (RC) Status &amp; Expiry Tracking</div>
      </div>
    </div>
    <div class="report-meta">
      <div><strong>Generated:</strong> ${generatedAt}</div>
      ${generatedBy ? `<div><strong>By:</strong> ${generatedBy}</div>` : ''}
      <div><strong>Total Records:</strong> ${sortedRows.length}</div>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card total">
      <div class="stat-label">Total Vehicles</div>
      <div class="stat-value">${stats.total}</div>
    </div>
    <div class="stat-card valid">
      <div class="stat-label">Valid RC</div>
      <div class="stat-value">${stats.valid}</div>
    </div>
    <div class="stat-card expired">
      <div class="stat-label">Expired RC</div>
      <div class="stat-value">${stats.expired}</div>
    </div>
    <div class="stat-card soon">
      <div class="stat-label">Expiring Soon (&le;30 days)</div>
      <div class="stat-value">${stats.expiringSoon}</div>
    </div>
  </div>

  <div class="section-divider"></div>

  <!-- Table -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>${tableHead}</tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : `<tr><td colspan="${columns.length}" style="text-align:center;padding:20px;color:#94a3b8;">No records found.</td></tr>`}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <div><strong>Vehicle Management System</strong> &mdash; Vehicle License Report</div>
    <div>Generated on ${generatedAt} &nbsp;|&nbsp; ${sortedRows.length} record(s)</div>
  </div>

</div>
</body>
</html>`;
  };

  const printTable = () => {
    const win = window.open('', '_blank', 'width=1200,height=900');
    if (!win) return;
    win.document.write(buildPrintHtml('Vehicle License Report'));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const statCards = [
    {
      label: 'Total Vehicles',
      value: stats.total,
      icon: <DirectionsCarRoundedIcon sx={{ fontSize: 26 }} />,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1d4ed8',
    },
    {
      label: 'Valid RC',
      value: stats.valid,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 26 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#16a34a',
    },
    {
      label: 'Expired RC',
      value: stats.expired,
      icon: <CancelRoundedIcon sx={{ fontSize: 26 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      bg: '#fef2f2',
      border: '#fecaca',
      color: '#dc2626',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 26 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#d97706',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header Banner */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 2.5,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #0ea5e9 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -20, right: 80,
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <Box sx={{ p: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 52, height: 52, borderRadius: 2.5,
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArticleRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  Vehicle License Report
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
                  Registration Certificate (RC) Status &amp; Expiry Tracking
                </Typography>
              </Box>
            </Stack>
            {/* Company info badge */}
            {(companyInfo?.companyName || auth?.companyCode) && (
              <Stack direction="row" spacing={1} alignItems="center"
                sx={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2, px: 2, py: 1,
                }}
              >
                <BusinessRoundedIcon sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: 1.2 }}>
                    Company
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>
                    {companyInfo?.companyName || auth?.companyCode}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        {statCards.map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 2.5,
              p: 2,
              background: card.bg,
              border: `1.5px solid ${card.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${alpha(card.color, 0.18)}` },
            }}
          >
            <Box sx={{
              width: 44, height: 44, borderRadius: 2,
              background: card.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
              boxShadow: `0 4px 10px ${alpha(card.color, 0.35)}`,
            }}>
              {card.icon}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: card.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.7rem' }}>
                {card.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: card.color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {card.value}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Main Content Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => theme.palette.background.paper,
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <Box sx={{
          px: { xs: 2, md: 3 }, py: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => alpha(theme.palette.primary.main, 0.03),
        }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search vehicles, companies, cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 300 } }}
              />
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
                <InputLabel>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FilterListRoundedIcon sx={{ fontSize: 15 }} />
                    <span>RC Status</span>
                  </Stack>
                </InputLabel>
                <Select
                  value={statusFilter}
                  label="RC Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Valid">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                      <span>Valid</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Expired">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                      <span>Expired</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Suspended">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                      <span>Suspended</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={exportToExcel}
                sx={{ borderColor: '#10b981', color: '#059669', '&:hover': { borderColor: '#059669', background: alpha('#10b981', 0.06) } }}
              >
                Excel
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PictureAsPdfRoundedIcon />}
                onClick={printTable}
                sx={{ borderColor: '#ef4444', color: '#dc2626', '&:hover': { borderColor: '#dc2626', background: alpha('#ef4444', 0.06) } }}
              >
                PDF
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityRoundedIcon />}
                onClick={() => setPrintPreviewOpen(true)}
                sx={{ borderColor: '#8b5cf6', color: '#7c3aed', '&:hover': { borderColor: '#7c3aed', background: alpha('#8b5cf6', 0.06) } }}
              >
                Preview
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<PrintRoundedIcon />}
                onClick={printTable}
                sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)', boxShadow: `0 2px 8px ${alpha('#2563eb', 0.3)}` }}
              >
                Print
              </Button>
            </Stack>
          </Stack>
        </Box>

        {error ? <Alert severity="error" sx={{ m: 2 }}>{error}</Alert> : null}

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 60%, #0369a1 100%)',
                  '& .MuiTableCell-root': {
                    color: '#fff !important',
                    fontWeight: '700 !important',
                    fontSize: '0.72rem !important',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: 'none',
                    py: 1.5,
                    '& .MuiTableSortLabel-root': { color: '#fff' },
                    '& .MuiTableSortLabel-root:hover': { color: 'rgba(255,255,255,0.85)' },
                    '& .MuiTableSortLabel-root.Mui-active': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: 'rgba(255,255,255,0.7) !important' },
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} sortDirection={sortBy === col.key ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir : 'asc'}
                      onClick={() => onSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} thickness={4} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loading report data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <DirectionsCarRoundedIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="body2">No vehicle registration records found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, idx) => {
                  const rcColors = getRcStatusColor(row?.rcStatus);
                  const daysStyle = getDaysRemainingStyle(row?.daysRemaining);
                  return (
                    <TableRow
                      key={String(row?.registrationId || idx)}
                      hover
                      sx={{
                        background: idx % 2 === 0
                          ? 'transparent'
                          : (theme) => alpha(theme.palette.primary.main, 0.02),
                        '&:hover': { background: (theme) => `${alpha(theme.palette.primary.main, 0.05)} !important` },
                      }}
                    >
                      {columns.map((col) => {
                        if (col.key === 'rcStatus') {
                          return (
                            <TableCell key={col.key}>
                              <Chip
                                label={formatValue(row?.[col.key], col.key)}
                                size="small"
                                sx={{
                                  background: rcColors.bg,
                                  color: rcColors.color,
                                  border: `1px solid ${rcColors.border}`,
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  height: 22,
                                }}
                              />
                            </TableCell>
                          );
                        }
                        if (col.key === 'daysRemaining') {
                          return (
                            <TableCell key={col.key}>
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  px: 1, py: 0.3,
                                  borderRadius: 1.5,
                                  background: daysStyle.bg,
                                  color: daysStyle.color,
                                  fontWeight: daysStyle.fontWeight,
                                  fontSize: '0.78rem',
                                }}
                              >
                                {formatValue(row?.[col.key], col.key)}
                              </Box>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={col.key}>
                            {formatValue(row?.[col.key], col.key)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer */}
        {!loading && sortedRows.length > 0 && (
          <Box sx={{
            px: 3, py: 1.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) => alpha(theme.palette.primary.main, 0.02),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Typography variant="caption" color="text.secondary">
              Showing <strong>{sortedRows.length}</strong> of <strong>{rows.length}</strong> records
              {statusFilter ? ` · Filtered by: ${statusFilter}` : ''}
              {search ? ` · Search: "${search}"` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Generated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Print Preview Dialog */}
      <Dialog open={printPreviewOpen} onClose={() => setPrintPreviewOpen(false)} fullWidth maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)',
          color: '#fff', py: 2, px: 3,
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <VisibilityRoundedIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                Print Preview
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Vehicle License Report — {sortedRows.length} record(s)
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* Company + Report header inside preview */}
          <Box sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #0ea5e9 100%)',
            px: 3, py: 2.5,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2,
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 48, height: 48, borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: '#fff', fontSize: 18,
              }}>
                {(companyInfo?.companyName || auth?.companyCode || 'VM').slice(0, 2).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  {companyInfo?.companyName || auth?.companyCode || 'Company'}
                </Typography>
                {companyInfo?.address && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    {companyInfo.address}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              {companyInfo?.email && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                  {companyInfo.email}
                </Typography>
              )}
              {companyInfo?.phonePrimary && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                  {companyInfo.phonePrimary}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Report name strip */}
          <Box sx={{
            px: 3, py: 1.5,
            background: (theme) => alpha(theme.palette.primary.main, 0.06),
            borderBottom: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ArticleRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Vehicle License Report
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {new Date().toLocaleDateString()} &nbsp;|&nbsp; {sortedRows.length} records
            </Typography>
          </Box>

          {/* Stats strip in preview */}
          <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem />}
            sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
          >
            {statCards.map((card) => (
              <Box key={card.label} sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center', background: card.bg }}>
                <Typography variant="caption" sx={{ color: card.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', display: 'block' }}>
                  {card.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: card.color, lineHeight: 1.1 }}>
                  {card.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Table in preview */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 60%, #0369a1 100%)',
                  '& .MuiTableCell-root': { color: '#fff !important', fontWeight: '700 !important', fontSize: '0.7rem !important', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none' },
                }}>
                  {columns.map((col) => <TableCell key={col.key}>{col.label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((row, idx) => {
                  const rcColors = getRcStatusColor(row?.rcStatus);
                  const daysStyle = getDaysRemainingStyle(row?.daysRemaining);
                  return (
                    <TableRow key={`preview-${String(row?.registrationId || idx)}`}
                      sx={{ background: idx % 2 === 0 ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.02) }}
                    >
                      {columns.map((col) => {
                        if (col.key === 'rcStatus') {
                          return (
                            <TableCell key={col.key}>
                              <Chip label={formatValue(row?.[col.key], col.key)} size="small"
                                sx={{ background: rcColors.bg, color: rcColors.color, border: `1px solid ${rcColors.border}`, fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                              />
                            </TableCell>
                          );
                        }
                        if (col.key === 'daysRemaining') {
                          return (
                            <TableCell key={col.key}>
                              <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.2, borderRadius: 1, background: daysStyle.bg, color: daysStyle.color, fontWeight: daysStyle.fontWeight, fontSize: '0.75rem' }}>
                                {formatValue(row?.[col.key], col.key)}
                              </Box>
                            </TableCell>
                          );
                        }
                        return <TableCell key={col.key}>{formatValue(row?.[col.key], col.key)}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setPrintPreviewOpen(false)} variant="outlined" color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={() => { setPrintPreviewOpen(false); printTable(); }}
            sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
          >
            Print / Save PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
