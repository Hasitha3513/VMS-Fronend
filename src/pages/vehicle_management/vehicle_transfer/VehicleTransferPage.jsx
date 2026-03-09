import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext';
import { vehicleTransferService } from '../../../services/vehicle_management/vehicle_transfer/vehicleTransferService';

export default function VehicleTransferPage() {
  const { token, auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [commentById, setCommentById] = useState({});
  const [savingId, setSavingId] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const payload = await vehicleTransferService.list(token, { status: statusFilter });
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, [token, statusFilter]);

  const pendingCount = useMemo(
    () => rows.filter((x) => String(x?.status || '').toUpperCase() === 'PENDING').length,
    [rows]
  );

  const printTransferDocument = (row) => {
    const companyHeader = row?.companyName || 'Company';
    const content = `
      <html>
      <head>
        <title>Vehicle Transfer Document</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin: 0; text-align: center; font-size: 22px; }
          h2 { margin: 8px 0 8px; text-align: center; font-size: 18px; }
          .meta { color: #4b5563; margin-bottom: 14px; font-size: 13px; }
          .section { margin-top: 14px; font-size: 14px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; }
          .label { width: 220px; font-weight: 700; background: #f9fafb; }
        </style>
      </head>
      <body>
        <h1>${companyHeader}</h1>
        <h2>Vehicle Transfer Document</h2>
        <div class="meta">Generated at: ${new Date().toLocaleString()}</div>
        <div class="section">Transfer Summary</div>
        <table>
          <tr><td class="label">Status</td><td>${row?.status || '-'}</td></tr>
          <tr><td class="label">Vehicle</td><td>${row?.identifyCode || '-'} | ${row?.registrationNumber || '-'} | ${row?.chassisNumber || '-'}</td></tr>
          <tr><td class="label">Current Location</td><td>${row?.currentLocationName || '-'}</td></tr>
          <tr><td class="label">Requested Base Type</td><td>${row?.requestedBaseLocationType || '-'}</td></tr>
          <tr><td class="label">Requested Location Type</td><td>${row?.requestedLocationType || '-'}</td></tr>
          <tr><td class="label">Requested Location</td><td>${row?.requestedLocationName || '-'}</td></tr>
          <tr><td class="label">Requested At</td><td>${row?.requestedAt || '-'}</td></tr>
          <tr><td class="label">Requested By</td><td>${row?.requestedByUsername || '-'}</td></tr>
          <tr><td class="label">Approved At</td><td>${row?.approvedAt || '-'}</td></tr>
          <tr><td class="label">Approved By</td><td>${row?.approvedByUsername || '-'}</td></tr>
          <tr><td class="label">Manager Comment</td><td>${row?.managerComment || '-'}</td></tr>
        </table>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.open();
    win.document.write(content);
    win.document.close();
    win.focus();
    win.print();
  };

  const onApprove = async (transferId) => {
    if (!token || !transferId) return;
    setSavingId(transferId);
    try {
      await vehicleTransferService.approve(token, transferId, {
        managerUserId: auth?.userId || null,
        managerComment: commentById[transferId] || null,
      });
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Approve failed');
    } finally {
      setSavingId('');
    }
  };

  const onReject = async (transferId) => {
    if (!token || !transferId) return;
    setSavingId(transferId);
    try {
      await vehicleTransferService.reject(token, transferId, {
        managerUserId: auth?.userId || null,
        managerComment: commentById[transferId] || null,
      });
      await loadRows();
    } catch (e) {
      setError(e?.message || 'Reject failed');
    } finally {
      setSavingId('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
          <SwapHorizRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Vehicle Transfer</Typography>
          <Chip label={`Pending ${pendingCount}`} color="warning" size="small" />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography>Loading...</Typography></Stack>
        ) : null}

        {!loading && !rows.length ? <Alert severity="info">No transfer requests found.</Alert> : null}

        {rows.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Current Location</TableCell>
                  <TableCell>Requested Base Type</TableCell>
                      <TableCell>Requested Location</TableCell>
                      <TableCell>Requested At</TableCell>
                      <TableCell>Requested By</TableCell>
                      <TableCell>Manager Comment</TableCell>
                      <TableCell>Approved By</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((x, idx) => {
                  const transferId = String(x?.transferId || x?.transfer_id || `transfer-${idx}`);
                  const vehicleLabel = `${x?.identifyCode || '-'} | ${x?.registrationNumber || '-'} | ${x?.chassisNumber || '-'}`;
                  return (
                    <TableRow key={transferId}>
                      <TableCell>{vehicleLabel}</TableCell>
                      <TableCell>{x?.currentLocationName || '-'}</TableCell>
                      <TableCell>{x?.requestedBaseLocationType || '-'}</TableCell>
                      <TableCell>{x?.requestedLocationName || '-'}</TableCell>
                      <TableCell>{x?.requestedAt || '-'}</TableCell>
                      <TableCell>{x?.requestedByUsername || '-'}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Manager comment"
                          value={commentById[transferId] || x?.managerComment || ''}
                          onChange={(e) => setCommentById((prev) => ({ ...prev, [transferId]: e.target.value }))}
                          disabled={String(x?.status || '').toUpperCase() !== 'PENDING'}
                        />
                      </TableCell>
                      <TableCell>{x?.approvedByUsername || '-'}</TableCell>
                      <TableCell>{x?.status || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {String(x?.status || '').toUpperCase() === 'PENDING' ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => onApprove(transferId)}
                                disabled={savingId === transferId}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => onReject(transferId)}
                                disabled={savingId === transferId}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                          {String(x?.status || '').toUpperCase() === 'APPROVED' ? (
                            <Button size="small" variant="outlined" onClick={() => printTransferDocument(x)}>
                              Print
                            </Button>
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Paper>
    </Box>
  );
}
