import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, IconButton,
  MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useMemo, useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { useThemeMode } from '../app/ThemeContext';
import { apiFetch } from '../services/apiClient';

const resources = [
  { key: 'companyBranch', label: 'Organization - Branches', path: '/api/v1/organizations/branches', idField: 'branchId' },
  { key: 'department', label: 'Organization - Departments', path: '/api/v1/organizations/departments', idField: 'departmentId' },
  { key: 'project', label: 'Organization - Projects', path: '/api/v1/organizations/projects', idField: 'projectId' },
  { key: 'workshop', label: 'Organization - Workshops', path: '/api/v1/organizations/workshops', idField: 'workshopId' },
  { key: 'jobPosition', label: 'Organization - Job Positions', path: '/api/v1/organizations/job-positions', idField: 'positionId' },
  { key: 'employeeGrade', label: 'HR - Employee Grades', path: '/api/v1/hr/employee-grades', idField: 'gradeId' },
  { key: 'employeeSkill', label: 'HR - Employee Skills', path: '/api/v1/hr/employee-skills', idField: 'skillId' },
  { key: 'employeeTraining', label: 'HR - Employee Trainings', path: '/api/v1/hr/employee-trainings', idField: 'trainingId' },
  { key: 'appUser', label: 'Access - App Users', path: '/api/v1/access/app-users', idField: 'user_id' },
  { key: 'role', label: 'Access - Roles', path: '/api/v1/access/roles', idField: 'role_id' },
  { key: 'systemService', label: 'Access - System Services', path: '/api/v1/access/system-services', idField: 'service_id' },
  { key: 'vehicles', label: 'Fleet - Vehicles', path: '/api/v1/fleet/vehicles', idField: 'vehicleId' },
];

function parseJsonOrThrow(text, label) {
  if (!text.trim()) return {};
  try { return JSON.parse(text); }
  catch { throw new Error(label + ' must be valid JSON'); }
}

export default function AdminApiConsolePage() {
  const theme = useTheme();
  const { token } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [resourceKey, setResourceKey] = useState(resources[0].key);
  const [id, setId] = useState('');
  const [queryJson, setQueryJson] = useState('{}');
  const [bodyJson, setBodyJson] = useState('{}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [copied, setCopied] = useState(false);

  const resource = useMemo(() => resources.find((r) => r.key === resourceKey) || resources[0], [resourceKey]);

  const run = async (action) => {
    setError(''); setOutput(''); setLoading(true); setLastAction(action);
    try {
      const params = parseJsonOrThrow(queryJson, 'Query JSON');
      const body = parseJsonOrThrow(bodyJson, 'Body JSON');
      let result;
      if (action === 'LIST') result = await apiFetch(resource.path, { token, params });
      if (action === 'GET') {
        if (!id.trim()) throw new Error('ID required for GET');
        result = await apiFetch(resource.path + '/' + id, { token });
      }
      if (action === 'CREATE') result = await apiFetch(resource.path, { method: 'POST', token, body });
      if (action === 'UPDATE') {
        if (!id.trim()) throw new Error('ID required for UPDATE');
        result = await apiFetch(resource.path + '/' + id, { method: 'PUT', token, body });
      }
      if (action === 'DELETE') {
        if (!id.trim()) throw new Error('ID required for DELETE');
        result = await apiFetch(resource.path + '/' + id, { method: 'DELETE', token });
      }
      setOutput(JSON.stringify(result ?? { ok: true }, null, 2));
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally { setLoading(false); }
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actions = [
    { key: 'LIST',   label: 'List' },
    { key: 'GET',    label: 'Get' },
    { key: 'CREATE', label: 'Create' },
    { key: 'UPDATE', label: 'Update' },
    { key: 'DELETE', label: 'Delete' },
  ];
  const methodMeta = {
    LIST:   { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.14), label: 'GET' },
    GET:    { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.14), label: 'GET' },
    CREATE: { color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.14), label: 'POST' },
    UPDATE: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14), label: 'PUT' },
    DELETE: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.14), label: 'DELETE' },
  };

  const terminalBg = isDark ? alpha(theme.palette.common.black, 0.35) : '#0f172a';

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CodeRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5">Admin API Console</Typography>
            <Typography variant="caption" color="text.secondary">Direct access to VMS backend API endpoints</Typography>
          </Box>
        </Stack>
        {lastAction && (
          <Chip
            size="small"
            label={methodMeta[lastAction]?.label + ' ' + lastAction}
            sx={{ bgcolor: methodMeta[lastAction]?.bg, color: methodMeta[lastAction]?.color, fontWeight: 700, fontFamily: 'monospace' }}
          />
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              select fullWidth label="Resource" value={resourceKey}
              onChange={(e) => setResourceKey(e.target.value)} size="small"
            >
              {resources.map((r) => <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>)}
            </TextField>

            <TextField
              fullWidth size="small"
              label={'Record ID (' + resource.idField + ')'}
              value={id} onChange={(e) => setId(e.target.value)}
              placeholder="Required for GET, UPDATE, DELETE"
              helperText="Leave empty for LIST and CREATE operations"
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth multiline minRows={3} size="small" label="Query Parameters (JSON)"
                value={queryJson} onChange={(e) => setQueryJson(e.target.value)}
              />
              <TextField
                fullWidth multiline minRows={3} size="small" label="Request Body (JSON)"
                value={bodyJson} onChange={(e) => setBodyJson(e.target.value)}
              />
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {actions.map(({ key, label }) => {
                const meta = methodMeta[key];
                return (
                  <Tooltip key={key} title={meta.label + ' ' + resource.path}>
                    <Button
                      variant="outlined"
                      disabled={loading}
                      onClick={() => run(key)}
                      startIcon={<PlayArrowRoundedIcon />}
                      sx={{
                        borderColor: meta.color,
                        color: meta.color,
                        '&:hover': { bgcolor: meta.bg, borderColor: meta.color },
                        fontWeight: 600,
                        minWidth: 100,
                      }}
                    >
                      {loading && lastAction === key ? 'Running...' : label}
                    </Button>
                  </Tooltip>
                );
              })}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5, borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="caption" sx={{ ml: 1, fontFamily: 'monospace', color: 'text.secondary' }}>response.json</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={copied ? 'Copied!' : 'Copy output'}>
                <IconButton size="small" onClick={copyOutput} disabled={!output}>
                  <ContentCopyRoundedIcon fontSize="small" sx={{ color: copied ? 'success.main' : 'text.secondary' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear">
                <IconButton size="small" onClick={() => { setOutput(''); setError(''); setLastAction(''); }}>
                  <ClearRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Box
            component="pre"
            sx={{
              m: 0, p: 2.5,
              bgcolor: terminalBg,
              color: output ? alpha(theme.palette.info.light, 0.95) : 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.7,
              overflow: 'auto',
              maxHeight: 440,
              minHeight: 120,
            }}
          >
            {loading ? (
              <Box component="span" sx={{ color: 'warning.main' }}>Running request...</Box>
            ) : (
              output || '// Response will appear here'
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
