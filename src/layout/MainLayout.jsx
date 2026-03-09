import {
  AppBar, Avatar, Badge, Box, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Tooltip, Typography, useMediaQuery, Collapse, Checkbox, FormControlLabel,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useThemeMode } from '../app/ThemeContext';
import { authService } from '../services/authService';
import { uiPreferenceService } from '../services/uiPreferenceService';
import { alpha, useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 68;

const NAV_SECTIONS = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> },
    ],
  },
  {
    key: 'organization',
    title: 'Organization',
    items: [
      { label: 'Companies', path: '/companies', icon: <BusinessRoundedIcon /> },
      { label: 'Branches', path: '/branches', icon: <AccountTreeRoundedIcon /> },
      { label: 'Departments', path: '/departments', icon: <CorporateFareRoundedIcon /> },
      { label: 'Projects', path: '/projects', icon: <FolderRoundedIcon /> },
      { label: 'Workshops', path: '/workshops', icon: <EngineeringRoundedIcon /> },
    ],
  },
  {
    key: 'hr_management',
    title: 'HR Management',
    items: [
      { label: 'Employee', path: '/employee-view-details', icon: <PeopleRoundedIcon /> },
      { label: 'Employee Details', path: '/employees', icon: <ManageAccountsRoundedIcon /> },
      { label: 'Employee Grades', path: '/employee-grades', icon: <WorkspacePremiumRoundedIcon /> },
      { label: 'Employee Skills', path: '/employee-skills', icon: <AssignmentIndRoundedIcon /> },
      { label: 'Employee Trainings', path: '/employee-trainings', icon: <SchoolRoundedIcon /> },
    ],
  },
  {
    key: 'payroll_management',
    title: 'Payroll Management',
    items: [
      { label: 'Attendance', path: '/attendances', icon: <AssessmentRoundedIcon /> },
      { label: 'Overtime Requests', path: '/overtime-requests', icon: <TuneRoundedIcon /> },
      { label: 'Leave Types', path: '/leave-types', icon: <DescriptionRoundedIcon /> },
      { label: 'Leave Applications', path: '/leave-applications', icon: <AssignmentIndRoundedIcon /> },
      { label: 'Ration Policies', path: '/ration-policies', icon: <DescriptionRoundedIcon /> },
      { label: 'Ration Distributions', path: '/ration-distributions', icon: <LocalShippingRoundedIcon /> },
      { label: 'Employee Advances', path: '/employee-advances', icon: <AssessmentRoundedIcon /> },
      { label: 'Payroll', path: '/payrolls', icon: <DescriptionRoundedIcon /> },
      { label: 'Payroll Deductions', path: '/payroll-deductions', icon: <AssessmentRoundedIcon /> },
    ],
  },
  {
    key: 'fleet',
    title: 'Vehicle Management',
    items: [
      { label: 'Company Vehicle Details', path: '/company-vehicles', icon: <BusinessRoundedIcon /> },
      { label: 'Hired Vehicle Details', path: '/hired-vehicles', icon: <DirectionsCarRoundedIcon /> },
      { label: 'Hired Vehicle Types', path: '/hired-vehicle-types', icon: <CodeRoundedIcon /> },
      { label: 'Company Vehicle Types', path: '/company-vehicle-types', icon: <CodeRoundedIcon /> },
      { label: 'Vehicle Details', path: '/vehicles', icon: <DirectionsCarRoundedIcon /> },
      { label: 'Vehicle Categories', path: '/vehicle-categories', icon: <FolderRoundedIcon /> },
      { label: 'Vehicle Types', path: '/vehicle-types', icon: <AccountTreeRoundedIcon /> },
      { label: 'Vehicle Manufacturers', path: '/vehicle-manufacturers', icon: <BusinessRoundedIcon /> },
      { label: 'Distributors', path: '/distributors', icon: <LocalShippingRoundedIcon /> },
      { label: 'Manufacturer Categories', path: '/manufacturer-categories', icon: <AccountTreeRoundedIcon /> },
      { label: 'Vehicle Models', path: '/vehicle-models', icon: <DirectionsCarRoundedIcon /> },
      { label: 'Model Variants', path: '/vehicle-model-variants', icon: <TuneRoundedIcon /> },
      { label: 'Daily Activities', path: '/vehicle-daily-activities', icon: <AssessmentRoundedIcon /> },
      { label: 'Vehicle Running Details', path: '/vehicle-reports/running-details', icon: <DescriptionRoundedIcon /> },
      { label: 'Daily Summaries', path: '/vehicle-daily-summaries', icon: <DescriptionRoundedIcon /> },
      { label: 'Operating Costs', path: '/vehicle-operating-costs', icon: <AssessmentRoundedIcon /> },
      { label: 'Vehicle Transfer', path: '/vehicle-transfers', icon: <SwapHorizRoundedIcon /> },
      { label: 'QRpopup', path: '/vehicle-qr-details', icon: <QrCode2RoundedIcon /> },
    ],
  },
  {
    key: 'vehicle_reports',
    title: 'Vehicle Reports',
    items: [
      { label: 'Dashboard', path: '/vehicle-reports/dashboard', icon: <DashboardRoundedIcon /> },
      { label: 'Vehicle License', path: '/vehicle-reports/license', icon: <DescriptionRoundedIcon /> },
      { label: 'Vehicle Insurance', path: '/vehicle-reports/insurance', icon: <DescriptionRoundedIcon /> },
      { label: 'Vehicle Fitness', path: '/vehicle-reports/fitness', icon: <DescriptionRoundedIcon /> },
      { label: 'Vehicle Emission Details', path: '/vehicle-reports/emission', icon: <DescriptionRoundedIcon /> },
      { label: 'Company Wise Vehicle Report', path: '/vehicle-reports/company-wise', icon: <BusinessRoundedIcon /> },
      { label: 'Location Wise Vehicle Report', path: '/vehicle-reports/location-wise', icon: <FolderRoundedIcon /> },
      { label: 'Abnormal Detections', path: '/vehicle-reports/abnormal-detections', icon: <ReportProblemRoundedIcon /> },
    ],
  },
  {
    key: 'maintenance_management',
    title: 'Maintenance Management',
    items: [
      { label: 'Maintenance Management', path: '/maintenance-management', icon: <BuildCircleRoundedIcon />, badge: 'NEW' },
      { label: 'Maintenance Strategies', path: '/maintenance-strategies', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Standards', path: '/maintenance-standards', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Programs', path: '/maintenance-programs', icon: <BuildCircleRoundedIcon /> },
      { label: 'Vehicle Maintenance Programs', path: '/vehicle-maintenance-programs', icon: <BuildCircleRoundedIcon /> },
      { label: 'Vehicle Filter Types', path: '/vehicle-filter-types', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Program Templates', path: '/maintenance-program-templates', icon: <BuildCircleRoundedIcon /> },
      { label: 'Vehicle Maintenance Program Assignments', path: '/vehicle-maintenance-program-assignments', icon: <BuildCircleRoundedIcon /> },
      { label: 'Vehicle Filters', path: '/vehicle-filters', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Plans', path: '/maintenance-plans', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Plan Items', path: '/maintenance-plan-items', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Schedules', path: '/maintenance-schedules', icon: <BuildCircleRoundedIcon /> },
      { label: 'Breakdown Records', path: '/breakdown-records', icon: <BuildCircleRoundedIcon /> },
      { label: 'Repair Jobs', path: '/repair-jobs', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Records', path: '/maintenance-records', icon: <BuildCircleRoundedIcon /> },
      { label: 'Maintenance Assignments', path: '/maintenance-assignments', icon: <BuildCircleRoundedIcon /> },
    ],
  },
  {
    key: 'supplier_management',
    title: 'Supplier Management',
    items: [
      { label: 'Supplier Overview', path: '/suppliers', icon: <StorefrontRoundedIcon /> },
      { label: 'Supplier Details', path: '/suppliers/details', icon: <DescriptionRoundedIcon /> },
    ],
  },
  {
    key: 'role_permission_system',
    title: 'Role & Permission',
    adminOnly: true,
    items: [
      { label: 'System Modules', path: '/system-modules', icon: <FolderRoundedIcon /> },
      { label: 'System Services', path: '/system-services', icon: <CodeRoundedIcon /> },
      { label: 'Permissions', path: '/permissions', icon: <AssignmentIndRoundedIcon /> },
      { label: 'Roles', path: '/roles', icon: <PeopleRoundedIcon /> },
      { label: 'Role Permissions', path: '/role-permissions', icon: <AssessmentRoundedIcon /> },
      { label: 'Role Service Permissions', path: '/role-service-permissions', icon: <AssessmentRoundedIcon /> },
      { label: 'Role Hierarchies', path: '/role-hierarchies', icon: <AccountTreeRoundedIcon /> },
      { label: 'User Roles', path: '/user-roles', icon: <PeopleRoundedIcon /> },
      { label: 'User Permissions', path: '/user-permissions', icon: <DescriptionRoundedIcon /> },
      { label: 'User Service Access', path: '/user-service-access', icon: <DescriptionRoundedIcon /> },
      { label: 'User Data Scopes', path: '/user-data-scopes', icon: <TuneRoundedIcon /> },
    ],
  },
  {
    key: 'admin',
    title: 'Administration',
    adminOnly: true,
    items: [
      { label: 'Dashboard Config', path: '/dashboard-config', icon: <TuneRoundedIcon /> },
      { label: 'App Users', path: '/app-users', icon: <PeopleRoundedIcon /> },
      { label: 'User Sessions', path: '/user-sessions', icon: <AssignmentIndRoundedIcon /> },
      { label: 'Login Histories', path: '/login-histories', icon: <AssessmentRoundedIcon /> },
      { label: 'User Histories', path: '/user-histories', icon: <DescriptionRoundedIcon /> },
      { label: 'Enum / Lookup Tables', path: '/enum-lookup-tables', icon: <ManageAccountsRoundedIcon /> },
      { label: 'Admin Console', path: '/admin-console', icon: <CodeRoundedIcon /> },
    ],
  },
];

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [openSectionKey, setOpenSectionKey] = useState(null);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const { auth, token, logout } = useAuth();
  const { mode, themePrefs, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = !!(auth?.superAdmin || auth?.companyAdmin);
  const isDark = mode === 'dark';
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const drawerBaseBg = isDark ? '#0f172a' : '#ffffff';
  const drawerGradient = `linear-gradient(180deg, ${alpha(primary, isDark ? 0.22 : 0.08)} 0%, ${alpha(secondary, isDark ? 0.16 : 0.05)} 100%)`;
  const mainBg = isDark
    ? `radial-gradient(1200px 600px at 0% 0%, ${alpha(primary, 0.16)} 0%, transparent 50%), radial-gradient(900px 500px at 100% 0%, ${alpha(secondary, 0.12)} 0%, transparent 50%), #0f172a`
    : `radial-gradient(1200px 600px at 0% 0%, ${alpha(primary, 0.08)} 0%, transparent 52%), radial-gradient(900px 500px at 100% 0%, ${alpha(secondary, 0.06)} 0%, transparent 52%), #f1f5f9`;
  const drawerW = isMobile ? 0 : (open ? DRAWER_WIDTH : DRAWER_COLLAPSED);
  const navExpanded = isMobile ? true : open;
  const visibleSections = useMemo(
    () => NAV_SECTIONS.filter((section) => (section.adminOnly ? isAdmin : true)),
    [isAdmin]
  );
  const allVisibleItems = useMemo(
    () => visibleSections.flatMap((section) => section.items),
    [visibleSections]
  );

  useEffect(() => {
    if (isMobile) setOpen(false);
    else setOpen(!themePrefs?.compactSidebar);
  }, [isMobile, themePrefs?.compactSidebar]);

  useEffect(() => {
    const matchedSection = visibleSections.find((section) =>
      section.items.some((item) => item.path === location.pathname)
    );
    if (!matchedSection) return;
    setOpenSectionKey((prev) => (prev === matchedSection.key ? prev : matchedSection.key));
  }, [location.pathname, visibleSections]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) {
        setOpenInNewTab(false);
        return;
      }
      try {
        const pref = await uiPreferenceService.getOpenInNewTab(token);
        if (!ignore) setOpenInNewTab(Boolean(pref?.openInNewTab));
      } catch {
        if (!ignore) setOpenInNewTab(false);
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const onLogout = async () => {
    try { if (token) await authService.logout(token, 'USER_LOGOUT'); } catch {}
    logout();
    navigate('/login');
  };
  const openProfileSettings = () => {
    if (openInNewTab) {
      window.open('/profile-settings', '_blank', 'noopener,noreferrer');
    } else {
      navigate('/profile-settings');
    }
    if (isMobile) setOpen(false);
  };

  const initials = auth?.username ? auth.username.slice(0, 2).toUpperCase() : 'U';
  const profileName = auth?.employeeName || auth?.username || 'User';
  const roleLabel = auth?.superAdmin ? 'Super Admin' : (auth?.companyAdmin ? 'Company Super Admin' : 'User');
  const loginIdentifier = auth?.username
    ? `${auth.username}${auth?.companyCode ? `.${auth.companyCode}` : ''}`
    : '';
  const isSectionExpanded = (key) => openSectionKey === key;
  const toggleSection = (key) => setOpenSectionKey((prev) => (prev === key ? null : key));

  const sidebarItem = (item, isAdminItem) => {
    const active = location.pathname === item.path;
    const activeColor = isAdminItem
      ? secondary
      : primary;
    const activeBg = isAdminItem
      ? (isDark ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.08)')
      : (isDark
        ? `linear-gradient(135deg, ${primary}33, ${secondary}26)`
        : `linear-gradient(135deg, ${primary}17, ${secondary}14)`);
    return (
      <Tooltip key={item.path} title={open ? '' : item.label} placement="right">
        <ListItemButton
          selected={active}
          onClick={() => {
            if (openInNewTab) {
              window.open(item.path, '_blank', 'noopener,noreferrer');
            } else {
              navigate(item.path);
            }
            if (isMobile) setOpen(false);
          }}
          sx={{
            mx: 1, mb: 0.5, borderRadius: 2, minHeight: 44,
            px: navExpanded ? 1.5 : 1.2,
            justifyContent: navExpanded ? 'flex-start' : 'center',
            '&.Mui-selected': { background: activeBg },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: navExpanded ? 1.5 : 0, color: active ? activeColor : (isDark ? '#94a3b8' : '#64748b'), '& svg': { fontSize: 20 } }}>
            {item.icon}
          </ListItemIcon>
          {navExpanded && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500, color: active ? activeColor : (isDark ? '#cbd5e1' : '#374151') }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? DRAWER_WIDTH : drawerW, flexShrink: 0, transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: isMobile ? '86vw' : drawerW, maxWidth: 320, overflowX: 'hidden', transition: 'width 0.25s ease',
            background: `${drawerGradient}, ${drawerBaseBg}`,
            borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: navExpanded ? 2.5 : 1.5, py: 2, minHeight: 64, overflow: 'hidden' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `linear-gradient(135deg, ${primary}, ${secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LocalShippingRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          {navExpanded && (
            <Box>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2, color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 700 }}>VMS</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Vehicle Management</Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', mx: 2 }} />
        <List sx={{ px: 0, pt: 1, flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarGutter: 'stable' }}>
          {visibleSections.map((section) => (
            <Box key={section.key}>
              {navExpanded ? (
                <ListItemButton
                  onClick={() => toggleSection(section.key)}
                  sx={{
                    mx: 1,
                    mt: 1,
                    mb: 0.25,
                    borderRadius: 2,
                    minHeight: 34,
                    px: 1.25,
                  }}
                >
                  <ListItemText
                    primary={section.title}
                    primaryTypographyProps={{
                      variant: 'caption',
                      sx: {
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: isDark ? alpha(theme.palette.common.white, 0.45) : '#94a3b8',
                        fontWeight: 700,
                      },
                    }}
                  />
                  <ExpandMoreRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: isDark ? '#64748b' : '#94a3b8',
                      transform: isSectionExpanded(section.key) ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </ListItemButton>
              ) : (
                <Divider sx={{ mx: 1, my: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }} />
              )}
              <Collapse in={!navExpanded || isSectionExpanded(section.key)} timeout="auto" unmountOnExit={navExpanded}>
                {section.items.map((item) => sidebarItem(item, !!section.adminOnly))}
              </Collapse>
            </Box>
          ))}
        </List>
        <Divider sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', mx: 2 }} />
        <Box sx={{ p: 1.25, pt: 1 }}>
          <Tooltip title="Profile Settings" placement={navExpanded ? 'top' : 'right'}>
            <ListItemButton
              onClick={openProfileSettings}
              sx={{
                px: navExpanded ? 1.25 : 1.2,
                minHeight: 48,
                borderRadius: 2,
                justifyContent: navExpanded ? 'flex-start' : 'center',
                background: location.pathname === '/profile-settings'
                  ? (isDark ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.12)')
                  : 'transparent',
              }}
            >
              <Avatar sx={{ width: 34, height: 34, background: `linear-gradient(135deg, ${primary}, ${secondary})`, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </Avatar>
              {navExpanded && (
                <>
                  <Box sx={{ flex: 1, overflow: 'hidden', ml: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2, color: isDark ? '#f1f5f9' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profileName}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.15, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {roleLabel}
                    </Typography>
                    {!!loginIdentifier && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.1, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {loginIdentifier}
                      </Typography>
                    )}
                  </Box>
                  <ManageAccountsRoundedIcon sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 20 }} />
                 </>
               )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: isMobile ? 0 : drawerW,
          width: isMobile ? '100%' : `calc(100% - ${drawerW}px)`,
          transition: 'left 0.25s ease, width 0.25s ease',
          zIndex: (t) => t.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
          <IconButton onClick={() => setOpen(!open)} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            {open ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" noWrap sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, maxWidth: { xs: 140, sm: 280, md: '100%' } }}>
              {allVisibleItems.find((m) => m.path === location.pathname)?.label || (location.pathname === '/profile-settings' ? 'Profile Settings' : 'VMS')}
            </Typography>
          </Box>
          <FormControlLabel
            sx={{ mr: 0.5, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#475569' } }}
            control={(
              <Checkbox
                size="small"
                checked={openInNewTab}
                onChange={async (e) => {
                  const next = e.target.checked;
                  setOpenInNewTab(next);
                  try {
                    if (token) await uiPreferenceService.setOpenInNewTab(token, next);
                  } catch {
                    setOpenInNewTab((prev) => !prev);
                  }
                }}
              />
            )}
            label="Open in new tab"
          />
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                <Badge badgeContent={0} color="error">
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
              <IconButton size="small" onClick={toggleTheme} sx={{ color: isDark ? '#fbbf24' : '#64748b' }}>
                {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={onLogout} sx={{ color: isDark ? '#f87171' : '#dc2626' }}>
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1, p: { xs: 1.25, sm: 2, md: 3 }, pt: { xs: 9.5, sm: 10, md: 11 }, minHeight: '100vh',
          background: mainBg,
          transition: 'background 0.2s ease',
          width: isMobile ? '100%' : `calc(100% - ${drawerW}px)`,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
