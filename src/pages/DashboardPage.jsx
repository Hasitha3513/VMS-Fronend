import {
  Alert, Box, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { dashboardService } from '../services/dashboardService';

function StatCard({ stat }) {
  return (
    <Card sx={{
      borderRadius: 1.5,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
        opacity: 0,
        transition: 'opacity 0.3s',
      },
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        '&::before': {
          opacity: 1,
        },
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.7rem' }}>
              {stat.label}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 1.5, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>{stat.value}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <TrendingUpRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>Live</Typography>
            </Stack>
          </Box>
          <Box sx={{
            width: 52,
            height: 52,
            borderRadius: 1.5,
            background: stat.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: stat.color,
            boxShadow: `0 4px 12px ${alpha(stat.color, 0.25)}`,
            transition: 'all 0.3s',
          }}>
            {stat.icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function WidgetCard({ w, isDark, primary }) {
  return (
    <Card sx={{
      borderRadius: 1.5,
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{w.widget_title || w.widget_name}</Typography>
          <Chip
            size="small"
            label={w.widget_type || 'WIDGET'}
            sx={{
              background: alpha(primary, isDark ? 0.28 : 0.12),
              color: isDark ? '#e2e8f0' : primary,
              fontWeight: 700,
              fontSize: '0.7rem',
              border: `1.5px solid ${alpha(primary, 0.2)}`,
            }}
          />
        </Stack>
        {w.config_data && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontWeight: 500 }}>{w.config_data}</Typography>}
        {w.refresh_interval && (
          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Refresh</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{w.refresh_interval}s</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={70}
              sx={{
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  background: `linear-gradient(90deg, ${primary}, ${alpha(primary, 0.7)})`,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const theme = useTheme();
  const [widgets, setWidgets] = useState([]);
  const [error, setError] = useState('');
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const statCards = [
    { label: 'Total Vehicles', value: '—', icon: <DirectionsCarRoundedIcon />, color: primary, bg: alpha(primary, 0.14) },
    { label: 'Employees', value: '—', icon: <PeopleRoundedIcon />, color: secondary, bg: alpha(secondary, 0.14) },
    { label: 'Active Projects', value: '—', icon: <FolderRoundedIcon />, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.14) },
    { label: 'Companies', value: '—', icon: <BusinessRoundedIcon />, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14) },
  ];

  useEffect(() => {
    dashboardService.effectiveMe(token).then(setWidgets).catch((e) => setError(e.message));
  }, [token]);

  return (
    <Stack spacing={3.5}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? `0 6px 20px ${alpha(primary, 0.4)}, 0 3px 10px ${alpha(primary, 0.2)}`
              : `0 6px 20px ${alpha(primary, 0.25)}, 0 3px 10px ${alpha(primary, 0.15)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05) rotate(-2deg)',
            },
          }}>
            <DashboardRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Vehicle Management System Overview</Typography>
          </Box>
        </Stack>
      </Box>
      {error && <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>}
      <Grid container spacing={2.5}>
        {statCards.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard stat={s} />
          </Grid>
        ))}
      </Grid>
      {widgets.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Configured Widgets</Typography>
          <Grid container spacing={2.5}>
            {widgets.map((w) => (
              <Grid key={w.config_id} size={{ xs: 12, md: 6, lg: 4 }}>
                <WidgetCard w={w} isDark={isDark} primary={primary} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {widgets.length === 0 && !error && (
        <Card sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <DashboardRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="subtitle1" color="text.secondary">No dashboard widgets configured</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Go to Dashboard Config (admin) to add widgets.</Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
