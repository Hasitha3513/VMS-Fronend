import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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
import { userServiceAccessService } from '../../../services/role_permission_system/user_service_acces/userServiceAccessService';
import { useAuth } from '../../../app/AuthContext';

export default function UserServiceAccessPage() {
  const { token } = useAuth();
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      setLoadingUsers(true);
      setError('');
      try {
        const data = await userServiceAccessService.users(token);
        const list = Array.isArray(data) ? data : [];
        if (!ignore) {
          setUserOptions(list);
          setSelectedUser((prev) => {
            if (prev && list.some((u) => String(u.user_id) === String(prev.user_id))) return prev;
            return list[0] || null;
          });
        }
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load users');
      } finally {
        if (!ignore) setLoadingUsers(false);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token || !selectedUser?.user_id) {
        setRows([]);
        return;
      }
      setLoadingMatrix(true);
      setError('');
      setSuccess('');
      try {
        const data = await userServiceAccessService.matrix(token, { userId: selectedUser.user_id });
        if (!ignore) {
          setRows((Array.isArray(data) ? data : []).map((r) => ({
            ...r,
            can_access: Boolean(r?.can_access),
          })));
        }
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load service matrix');
      } finally {
        if (!ignore) setLoadingMatrix(false);
      }
    })();
    return () => { ignore = true; };
  }, [token, selectedUser?.user_id]);

  const filteredRows = useMemo(() => {
    const q = String(serviceSearch || '').trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (
      String(r?.service_name || '').toLowerCase().includes(q)
      || String(r?.service_code || '').toLowerCase().includes(q)
      || String(r?.service_path || '').toLowerCase().includes(q)
    ));
  }, [rows, serviceSearch]);

  const selectedCount = useMemo(() => rows.filter((r) => r.can_access).length, [rows]);

  const toggleAccess = (serviceId, checked) => {
    setRows((prev) => prev.map((r) => (
      String(r.service_id) === String(serviceId) ? { ...r, can_access: checked } : r
    )));
  };

  const onSave = async () => {
    if (!token || !selectedUser?.user_id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const serviceIds = rows.filter((r) => r.can_access).map((r) => r.service_id);
      await userServiceAccessService.replaceMatrix(token, {
        user_id: selectedUser.user_id,
        service_ids: serviceIds,
      });
      setSuccess('User service access updated');
    } catch (e) {
      setError(e?.message || 'Failed to save service access');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>User Service Access</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box sx={{ minWidth: 360, flex: 1 }}>
            <Autocomplete
              options={userOptions}
              loading={loadingUsers}
              value={selectedUser}
              onChange={(_, next) => setSelectedUser(next)}
              getOptionLabel={(u) => {
                if (!u) return '';
                const user = u.username || '-';
                const company = u.company_code || '-';
                const email = u.email ? ` | ${u.email}` : '';
                return `${user} (${company})${email}`;
              }}
              isOptionEqualToValue={(a, b) => String(a?.user_id || '') === String(b?.user_id || '')}
              renderInput={(params) => <TextField {...params} size="small" label="Select User" />}
            />
          </Box>
          <TextField
            size="small"
            label="Filter Services"
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            sx={{ minWidth: 260 }}
          />
          <Button variant="contained" onClick={onSave} disabled={!selectedUser || saving}>
            {saving ? 'Saving...' : 'Save Access'}
          </Button>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Services</Typography>
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedCount} / {rows.length}
          </Typography>
        </Stack>
        {loadingMatrix ? <CircularProgress size={22} /> : null}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Access</TableCell>
                <TableCell>Service Name</TableCell>
                <TableCell>Service Code</TableCell>
                <TableCell>Path</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.service_id}>
                  <TableCell>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={Boolean(row.can_access)}
                          onChange={(e) => toggleAccess(row.service_id, e.target.checked)}
                        />
                      )}
                      label=""
                    />
                  </TableCell>
                  <TableCell>{row.service_name || '-'}</TableCell>
                  <TableCell>{row.service_code || '-'}</TableCell>
                  <TableCell>{row.service_path || '-'}</TableCell>
                </TableRow>
              ))}
              {!loadingMatrix && filteredRows.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No services found</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
