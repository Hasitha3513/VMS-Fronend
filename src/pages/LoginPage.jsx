import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import { authService } from '../services/authService';
import { useAuth } from '../app/AuthContext';
import { useThemeMode } from '../app/ThemeContext';
const USER_PREFS_KEY = 'vms_user_preferences';

function resolveStartPage() {
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.startPage || '/';
  } catch {
    return '/';
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth, login } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  useEffect(() => {
    if (auth?.sessionToken) {
      navigate(resolveStartPage(), { replace: true });
    }
  }, [auth, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const principal = username.trim();
    const isBootstrap = principal.toLowerCase() === 'superadmin' || principal.toLowerCase() === 'superadmin@vms.local';
    if (!isBootstrap && !principal.includes('.')) {
      setError('Invalid credentials. Please check username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ username: principal, password, userAgent: navigator.userAgent });
      login(data);
      navigate(resolveStartPage());
    } catch (err) {
      const message = err?.message || 'Login failed';
      if (message.includes('Failed to fetch')) {
        setError('Backend service is not reachable. Start VMS-Backend and try again.');
      } else if (message.includes('500')) {
        setError('Login failed due to server error. Please check backend logs.');
      } else if (message.toLowerCase().includes('invalid credentials')) {
        setError('Invalid credentials. Please check username and password.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = isDark
    ? `radial-gradient(ellipse at 20% 50%, ${alpha(primary, 0.2)} 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, ${alpha(secondary, 0.18)} 0%, transparent 60%), #0f172a`
    : `radial-gradient(ellipse at 20% 50%, ${alpha(primary, 0.12)} 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, ${alpha(secondary, 0.1)} 0%, transparent 60%), #f1f5f9`;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: bgGradient, p: 2, position: 'relative' }}>
      <IconButton
        onClick={toggleTheme}
        sx={{ position: 'absolute', top: 16, right: 16, color: isDark ? theme.palette.warning.main : 'text.secondary', bgcolor: isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.05), '&:hover': { bgcolor: isDark ? alpha('#ffffff', 0.12) : alpha('#000000', 0.1) } }}
      >
        {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 3, background: `linear-gradient(135deg, ${primary}, ${secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalShippingRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Vehicle Management</Typography>
              <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
            </Box>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField
              label="Username.CompanyCode"
              placeholder="hasitha342.scel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoFocus
              autoComplete="username"
              helperText="Enter your company username and code."
            />
            <TextField
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required fullWidth autoComplete="current-password"
              InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end">
                    {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )}}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 1, py: 1.2 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Divider sx={{ my: 0.5 }}>
              <Typography variant="caption" color="text.secondary">or</Typography>
            </Divider>
            <Button type="button" variant="outlined" fullWidth
              onClick={() => { setUsername('superadmin'); setPassword('SuperAdmin@123'); }}
              sx={{ color: 'text.secondary', borderColor: 'divider' }}>
              Use Default Super Admin
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5, textAlign: 'center', lineHeight: 1.6 }}>
            Enter your assigned login credentials.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
