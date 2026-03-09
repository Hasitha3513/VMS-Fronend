import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../app/AuthContext';
import { useThemeMode } from '../app/ThemeContext';
import { authService } from '../services/authService';
import { appUserService } from '../services/role_permission_system/app_user/appUserService';
import { employeeService } from '../services/employee_hr_management/employee/employeeService';

const USER_PREFS_KEY = 'vms_user_preferences';

const DEFAULT_USER_PREFS = {
  displayName: '',
  phone: '',
  title: '',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'dd-mm-yyyy',
  startPage: '/',
  emailAlerts: true,
  pushAlerts: false,
  weeklyDigest: true,
};

const COLOR_OPTIONS = [
  { key: 'ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #2563eb, #0ea5e9)' },
  { key: 'emerald', label: 'Emerald', gradient: 'linear-gradient(135deg, #059669, #22c55e)' },
  { key: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #ea580c, #f59e0b)' },
  { key: 'rose', label: 'Rose', gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)' },
  { key: 'violet', label: 'Violet', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { key: 'slate', label: 'Slate', gradient: 'linear-gradient(135deg, #334155, #64748b)' },
];

function loadUserPrefs(auth) {
  const authJobTitle = resolveAuthJobTitle(auth);
  const authDisplayName = resolveAuthDisplayName(auth);
  const raw = localStorage.getItem(USER_PREFS_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_USER_PREFS,
      ...parsed,
      displayName: authDisplayName || parsed?.displayName || '',
      title: authJobTitle || parsed?.title || '',
    };
  } catch {
    return { ...DEFAULT_USER_PREFS, displayName: authDisplayName, title: authJobTitle };
  }
}

function resolveAuthDisplayName(auth) {
  const employeeName = typeof auth?.employeeName === 'string' ? auth.employeeName.trim() : '';
  if (employeeName) return employeeName;
  return auth?.username || '';
}

function resolveAuthJobTitle(auth) {
  const candidates = [
    auth?.jobTitle,
    auth?.job_title,
    auth?.designation,
    auth?.position,
    auth?.job,
    auth?.employeeJobTitle,
    auth?.employeeDesignation,
    auth?.employeePosition,
  ];
  const found = candidates.find((value) => typeof value === 'string' && value.trim());
  return found ? found.trim() : '';
}

export default function ProfileSettingsPage() {
  const { auth, token } = useAuth();
  const theme = useTheme();
  const { themePrefs, setMode, updateThemePrefs, resetThemePrefs } = useThemeMode();
  const [activeTab, setActiveTab] = useState(0);
  const [userPrefs, setUserPrefs] = useState(() => loadUserPrefs(auth));
  const [prefsSaved, setPrefsSaved] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  useEffect(() => {
    const authJobTitle = resolveAuthJobTitle(auth);
    if (!authJobTitle) return;
    setUserPrefs((prev) => (prev.title === authJobTitle ? prev : { ...prev, title: authJobTitle }));
  }, [auth]);

  useEffect(() => {
    const authDisplayName = resolveAuthDisplayName(auth);
    if (!authDisplayName) return;
    setUserPrefs((prev) => (prev.displayName === authDisplayName ? prev : { ...prev, displayName: authDisplayName }));
  }, [auth]);

  useEffect(() => {
    let cancelled = false;

    const loadLinkedEmployeeProfile = async () => {
      if (!token || !auth?.userId) return;
      try {
        const appUser = await appUserService.getById(token, auth.userId);
        const employeeId = appUser?.employee_id;
        if (!employeeId) return;

        const employee = await employeeService.getEmployeeById(token, employeeId);
        if (cancelled || !employee) return;

        setUserPrefs((prev) => {
          const nextTitle = typeof employee.jobTitle === 'string' && employee.jobTitle.trim()
            ? employee.jobTitle.trim()
            : prev.title;
          const nextPhone = typeof employee.mobilePhone === 'string' && employee.mobilePhone.trim()
            ? employee.mobilePhone.trim()
            : prev.phone;

          if (prev.title === nextTitle && prev.phone === nextPhone) return prev;
          return { ...prev, title: nextTitle, phone: nextPhone };
        });
      } catch {
        // Profile settings should remain usable even if linked employee lookup fails.
      }
    };

    loadLinkedEmployeeProfile();
    return () => { cancelled = true; };
  }, [auth?.userId, token]);

  const initials = useMemo(() => (auth?.username ? auth.username.slice(0, 2).toUpperCase() : 'U'), [auth?.username]);
  const isDark = themePrefs.mode === 'dark';

  const saveUserPreferences = () => {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(userPrefs));
    setPrefsSaved('Preferences updated.');
    setTimeout(() => setPrefsSaved(''), 1800);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirm password must match.');
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters.');
      return;
    }
    if (!token) {
      setSecurityError('Missing active session. Please login again.');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword(token, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecuritySuccess('Password updated successfully.');
    } catch (err) {
      setSecurityError(err?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Card sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2.5,
            background: isDark
              ? `linear-gradient(120deg, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}26)`
              : `linear-gradient(120deg, ${theme.palette.primary.main}1A, ${theme.palette.secondary.main}14)`,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar sx={{ width: 52, height: 52, fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Profile Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account, security, visual theme, and personal preferences.
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Tabs value={activeTab} onChange={(_, tab) => setActiveTab(tab)} variant="scrollable" scrollButtons="auto" sx={{ px: { xs: 1, md: 2 } }}>
          <Tab icon={<PersonRoundedIcon fontSize="small" />} iconPosition="start" label="Account" />
          <Tab icon={<PaletteRoundedIcon fontSize="small" />} iconPosition="start" label="Appearance" />
          <Tab icon={<TuneRoundedIcon fontSize="small" />} iconPosition="start" label="Preferences" />
          <Tab icon={<SecurityRoundedIcon fontSize="small" />} iconPosition="start" label="Security" />
        </Tabs>
      </Card>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Username" value={auth?.username || ''} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Email" value={auth?.email || ''} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Company Code" value={auth?.companyCode || ''} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Role" value={auth?.superAdmin ? 'Super Admin' : (auth?.companyAdmin ? 'Company Super Admin' : 'User')} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Display Name" value={userPrefs.displayName} fullWidth onChange={(e) => setUserPrefs((p) => ({ ...p, displayName: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Job Title" value={userPrefs.title} fullWidth onChange={(e) => setUserPrefs((p) => ({ ...p, title: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Phone" value={userPrefs.phone} fullWidth onChange={(e) => setUserPrefs((p) => ({ ...p, phone: e.target.value }))} />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={saveUserPreferences}>Save Account Preferences</Button>
              {prefsSaved && <Alert severity="success" sx={{ py: 0 }}>{prefsSaved}</Alert>}
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <FormControl>
                <FormLabel>Theme Mode</FormLabel>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label="Light" color={themePrefs.mode === 'light' ? 'primary' : 'default'} onClick={() => setMode('light')} />
                  <Chip label="Dark" color={themePrefs.mode === 'dark' ? 'primary' : 'default'} onClick={() => setMode('dark')} />
                </Stack>
              </FormControl>

              <Box>
                <FormLabel>Accent Palette</FormLabel>
                <Grid container spacing={1.25} sx={{ mt: 1 }}>
                  {COLOR_OPTIONS.map((color) => (
                    <Grid key={color.key} size={{ xs: 6, sm: 4, md: 2 }}>
                      <Button
                        fullWidth
                        variant={themePrefs.colorPreset === color.key ? 'contained' : 'outlined'}
                        onClick={() => updateThemePrefs({ colorPreset: color.key })}
                        sx={{
                          p: 0.5,
                          minHeight: 52,
                          borderRadius: 2,
                          borderColor: themePrefs.colorPreset === color.key ? 'transparent' : 'divider',
                        }}
                      >
                        <Box sx={{ width: '100%', borderRadius: 1.25, py: 0.8, color: '#fff', fontSize: '0.72rem', fontWeight: 700, background: color.gradient }}>
                          {color.label}
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <FormLabel>Density</FormLabel>
                    <Select value={themePrefs.density} onChange={(e) => updateThemePrefs({ density: e.target.value })} size="small" sx={{ mt: 0.8 }}>
                      <MenuItem value="compact">Compact</MenuItem>
                      <MenuItem value="comfortable">Comfortable</MenuItem>
                      <MenuItem value="spacious">Spacious</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <FormLabel>Corner Style</FormLabel>
                    <Select value={themePrefs.cornerStyle} onChange={(e) => updateThemePrefs({ cornerStyle: e.target.value })} size="small" sx={{ mt: 0.8 }}>
                      <MenuItem value="soft">Soft</MenuItem>
                      <MenuItem value="rounded">Rounded</MenuItem>
                      <MenuItem value="sharp">Sharp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={0.3} sx={{ mt: { xs: 0, md: 2.4 } }}>
                    <FormControlLabel
                      control={<Switch checked={themePrefs.reducedMotion} onChange={(e) => updateThemePrefs({ reducedMotion: e.target.checked })} />}
                      label="Reduced Motion"
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Box>
                <Button variant="text" color="inherit" startIcon={<RestartAltRoundedIcon />} onClick={resetThemePrefs}>
                  Reset Appearance to Default
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <FormLabel>Language</FormLabel>
                  <Select value={userPrefs.language} onChange={(e) => setUserPrefs((p) => ({ ...p, language: e.target.value }))} size="small" sx={{ mt: 0.8 }}>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={userPrefs.timezone} onChange={(e) => setUserPrefs((p) => ({ ...p, timezone: e.target.value }))} size="small" sx={{ mt: 0.8 }}>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York</MenuItem>
                    <MenuItem value="America/Chicago">America/Chicago</MenuItem>
                    <MenuItem value="Asia/Colombo">Asia/Colombo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <FormLabel>Date Format</FormLabel>
                  <Select value={userPrefs.dateFormat} onChange={(e) => setUserPrefs((p) => ({ ...p, dateFormat: e.target.value }))} size="small" sx={{ mt: 0.8 }}>
                    <MenuItem value="dd-mm-yyyy">DD-MM-YYYY</MenuItem>
                    <MenuItem value="mm-dd-yyyy">MM-DD-YYYY</MenuItem>
                    <MenuItem value="yyyy-mm-dd">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={<Switch checked={themePrefs.compactSidebar} onChange={(e) => updateThemePrefs({ compactSidebar: e.target.checked })} />}
                  label="Compact Sidebar by Default"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <FormLabel>Start Page</FormLabel>
                  <Select value={userPrefs.startPage} onChange={(e) => setUserPrefs((p) => ({ ...p, startPage: e.target.value }))} size="small" sx={{ mt: 0.8 }}>
                    <MenuItem value="/">Dashboard</MenuItem>
                    <MenuItem value="/companies">Companies</MenuItem>
                    <MenuItem value="/employees">Employees</MenuItem>
                    <MenuItem value="/vehicles">Vehicles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch checked={userPrefs.emailAlerts} onChange={(e) => setUserPrefs((p) => ({ ...p, emailAlerts: e.target.checked }))} />}
                  label="Email Alerts"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch checked={userPrefs.pushAlerts} onChange={(e) => setUserPrefs((p) => ({ ...p, pushAlerts: e.target.checked }))} />}
                  label="Push Alerts"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch checked={userPrefs.weeklyDigest} onChange={(e) => setUserPrefs((p) => ({ ...p, weeklyDigest: e.target.checked }))} />}
                  label="Weekly Digest"
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={saveUserPreferences}>Save Preferences</Button>
              {prefsSaved && <Alert severity="success" sx={{ py: 0 }}>{prefsSaved}</Alert>}
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.7 }}>Password & Security</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use a strong password and change it periodically to protect your account.
            </Typography>
            <Stack component="form" spacing={2} onSubmit={handlePasswordUpdate}>
              {securityError && <Alert severity="error">{securityError}</Alert>}
              {securitySuccess && <Alert severity="success">{securitySuccess}</Alert>}
              <TextField
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowCurrent((v) => !v)}>
                        {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="New Password"
                type={showNext ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowNext((v) => !v)}>
                        {showNext ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Button type="submit" variant="contained" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
