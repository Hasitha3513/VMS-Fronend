import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import RuleFolderRoundedIcon from '@mui/icons-material/RuleFolderRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';

const GROUPS = [
  {
    key: 'all',
    label: 'All Modules',
    blurb: 'Maintenance master data, planning, scheduling, and execution',
    color: 'primary',
  },
  {
    key: 'masters',
    label: 'Master Data',
    blurb: 'Strategies, standards, programs, and templates',
    color: 'secondary',
  },
  {
    key: 'vehicle_programs',
    label: 'Vehicle Programs',
    blurb: 'Vehicle-level maintenance program links and assignments',
    color: 'info',
  },
  {
    key: 'planning',
    label: 'Planning & Schedule',
    blurb: 'Plans, plan items, and maintenance schedule execution windows',
    color: 'warning',
  },
  {
    key: 'execution',
    label: 'Breakdown & Repair',
    blurb: 'Breakdowns, repair jobs, maintenance records, and assignments',
    color: 'success',
  },
];

const MODULES = [
  { group: 'masters', label: 'Maintenance Strategies', path: '/maintenance-strategies', icon: <SettingsSuggestRoundedIcon />, desc: 'Define high-level maintenance approaches and strategy types.' },
  { group: 'masters', label: 'Maintenance Standards', path: '/maintenance-standards', icon: <RuleFolderRoundedIcon />, desc: 'Interval/checklist standards by vehicle type and strategy.' },
  { group: 'masters', label: 'Maintenance Programs', path: '/maintenance-programs', icon: <PlaylistAddCheckRoundedIcon />, desc: 'Reusable maintenance programs and program types.' },
  { group: 'masters', label: 'Maintenance Program Templates', path: '/maintenance-program-templates', icon: <FactCheckRoundedIcon />, desc: 'Template-driven intervals, checklists, duration, and cost.' },
  { group: 'masters', label: 'Vehicle Filter Types', path: '/vehicle-filter-types', icon: <RuleFolderRoundedIcon />, desc: 'Company-level filter type master with normal replacement life.' },

  { group: 'vehicle_programs', label: 'Vehicle Maintenance Programs', path: '/vehicle-maintenance-programs', icon: <DirectionsCarFilledRoundedIcon />, desc: 'Assign a maintenance program to a vehicle over a date range.' },
  { group: 'vehicle_programs', label: 'Vehicle Program Assignments', path: '/vehicle-maintenance-program-assignments', icon: <ChecklistRoundedIcon />, desc: 'Vehicle-to-template assignment with next service counters.' },
  { group: 'vehicle_programs', label: 'Vehicle Filters', path: '/vehicle-filters', icon: <BuildCircleRoundedIcon />, desc: 'Track installed/replaced filters, counters, and filter status by vehicle.' },

  { group: 'planning', label: 'Maintenance Plans', path: '/maintenance-plans', icon: <CalendarMonthRoundedIcon />, desc: 'Planned maintenance windows, budget, and status.' },
  { group: 'planning', label: 'Maintenance Plan Items', path: '/maintenance-plan-items', icon: <ChecklistRoundedIcon />, desc: 'Line items under plans with scheduled dates and costs.' },
  { group: 'planning', label: 'Maintenance Schedules', path: '/maintenance-schedules', icon: <RouteRoundedIcon />, desc: 'Actual schedules per vehicle/standard with reminders and predictions.' },

  { group: 'execution', label: 'Breakdown Records', path: '/breakdown-records', icon: <ConstructionRoundedIcon />, desc: 'Capture breakdown events, severity, and repair routing.' },
  { group: 'execution', label: 'Repair Jobs', path: '/repair-jobs', icon: <HandymanRoundedIcon />, desc: 'Repair diagnosis, solution, cost, and completion status.' },
  { group: 'execution', label: 'Maintenance Records', path: '/maintenance-records', icon: <BuildCircleRoundedIcon />, desc: 'Maintenance execution records, costs, and approvals.' },
  { group: 'execution', label: 'Maintenance Assignments', path: '/maintenance-assignments', icon: <FactCheckRoundedIcon />, desc: 'Technician assignments linked to breakdowns/maintenance work.' },
];

function ModuleCard({ item, onOpen }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.92)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
      }}
    >
      <CardActionArea sx={{ height: '100%' }} onClick={() => onOpen(item.path)}>
        <CardContent sx={{ p: 2.25, height: '100%' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                {item.icon}
              </Box>
              <Chip size="small" label={item.groupLabel} variant="outlined" />
            </Stack>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: 'block' }}>
                {item.desc}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
              Open module
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function MaintenanceManagementPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [tab, setTab] = useState('all');

  const modules = useMemo(() => {
    const groupLabelByKey = Object.fromEntries(GROUPS.map((g) => [g.key, g.label]));
    return MODULES.map((m) => ({ ...m, groupLabel: groupLabelByKey[m.group] || m.group }));
  }, []);

  const visibleModules = useMemo(
    () => (tab === 'all' ? modules : modules.filter((m) => m.group === tab)),
    [modules, tab]
  );

  const groupCounts = useMemo(() => {
    const counts = {};
    modules.forEach((m) => { counts[m.group] = (counts[m.group] || 0) + 1; });
    return counts;
  }, [modules]);

  return (
    <Stack spacing={2.5}>
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.18),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 55%, ${alpha(theme.palette.success.main, 0.06)} 100%)`,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <BuildCircleRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Maintenance Management
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Central navigation for maintenance master data, planning, schedules, breakdowns, and repair execution
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip label={`Modules: ${modules.length}`} color="primary" variant="outlined" />
              <Chip label={`Company: ${auth?.companyCode || 'All'}`} variant="outlined" />
              <Chip label="Vehicle Management" variant="outlined" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={1.5}>
        {GROUPS.filter((g) => g.key !== 'all').map((g) => (
          <Grid key={g.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                  {g.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.4 }}>
                  {groupCounts[g.key] || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {g.blurb}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 54 },
            }}
          >
            {GROUPS.map((g) => (
              <Tab key={g.key} value={g.key} label={`${g.label}${g.key === 'all' ? ` (${modules.length})` : ` (${groupCounts[g.key] || 0})`}`} />
            ))}
          </Tabs>

          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {GROUPS.find((g) => g.key === tab)?.blurb}
            </Typography>
            <Grid container spacing={1.75}>
              {visibleModules.map((item) => (
                <Grid key={item.path} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ModuleCard item={item} onOpen={navigate} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
