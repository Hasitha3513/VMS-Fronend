import {
  Alert, Box, Button, Card, CardContent, Chip, FormControlLabel, IconButton,
  Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { dashboardService } from '../services/dashboardService';

const createPayload = { company_id: null, company_code: '', user_id: null, role_id: null, widget_name: '', widget_type: '', widget_title: '', position_x: 0, position_y: 0, width: 4, height: 4, is_visible: true, refresh_interval: 300, config_data: '' };

export default function DashboardConfigPage() {
  const theme = useTheme();
  const { token, auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ...createPayload, company_code: auth?.companyCode || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    dashboardService.listAll(token).then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setError('');
    try {
      await dashboardService.create(token, form);
      setForm({ ...createPayload, company_code: auth?.companyCode || '' });
      load();
    } catch (e) { setError(e.message); }
  };

  const toggle = async (r) => {
    try {
      await dashboardService.update(token, r.config_id, { is_visible: !r.is_visible, company_code: r.company_code });
      load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (r) => {
    try { await dashboardService.remove(token, r.config_id); load(); }
    catch (e) { setError(e.message); }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TuneRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5">Dashboard Config</Typography>
            <Typography variant="caption" color="text.secondary">Admin: manage dashboard widgets</Typography>
          </Box>
        </Stack>
        <Tooltip title="Refresh"><IconButton onClick={load} size="small"><RefreshRoundedIcon /></IconButton></Tooltip>
      </Stack>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AddRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">Add New Widget</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
            <TextField label="Company Code" value={form.company_code} onChange={f('company_code')} size="small" sx={{ minWidth: 140 }} />
            <TextField label="User ID (optional)" value={form.user_id || ''} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value || null }))} size="small" sx={{ minWidth: 140 }} />
            <TextField label="Role ID (optional)" value={form.role_id || ''} onChange={(e) => setForm((p) => ({ ...p, role_id: e.target.value || null }))} size="small" sx={{ minWidth: 140 }} />
            <TextField label="Widget Name" value={form.widget_name} onChange={f('widget_name')} size="small" sx={{ minWidth: 160 }} />
            <TextField label="Widget Title" value={form.widget_title} onChange={f('widget_title')} size="small" sx={{ minWidth: 160 }} />
            <Button variant="contained" onClick={create} startIcon={<AddRoundedIcon />} size="small" sx={{ alignSelf: 'flex-end', height: 40 }}>Add Widget</Button>
          </Stack>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Widget</TableCell><TableCell>Type</TableCell><TableCell>Company</TableCell>
                <TableCell>User</TableCell><TableCell>Role</TableCell><TableCell>Visible</TableCell><TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  <TuneRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                  No widgets configured
                </TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.config_id}>
                  <TableCell sx={{ fontWeight: 500 }}>{r.widget_title || r.widget_name}</TableCell>
                  <TableCell><Chip label={r.widget_type || 'WIDGET'} size="small" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontFamily: 'monospace', fontWeight: 600 }} /></TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.company_code}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.user_id || '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.role_id || '—'}</TableCell>
                  <TableCell><Switch size="small" checked={!!r.is_visible} onChange={() => toggle(r)} color="primary" /></TableCell>
                  <TableCell>
                    <Tooltip title="Delete widget">
                      <IconButton size="small" onClick={() => remove(r)} sx={{ color: 'error.main' }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
