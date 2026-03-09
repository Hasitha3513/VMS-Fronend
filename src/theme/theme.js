import { alpha, createTheme } from '@mui/material/styles';

const COLOR_PRESETS = {
  ocean: { primary: '#2563eb', secondary: '#0ea5e9' },
  emerald: { primary: '#059669', secondary: '#22c55e' },
  sunset: { primary: '#ea580c', secondary: '#f59e0b' },
  rose: { primary: '#e11d48', secondary: '#f43f5e' },
  violet: { primary: '#7c3aed', secondary: '#a855f7' },
  slate: { primary: '#334155', secondary: '#64748b' },
};

const RADIUS_MAP = {
  soft: 8,
  rounded: 6,
  sharp: 4,
};

const DENSITY_MAP = {
  compact: { buttonY: 5, buttonX: 14, tableY: 9, tableX: 14 },
  comfortable: { buttonY: 7, buttonX: 18, tableY: 12, tableX: 16 },
  spacious: { buttonY: 9, buttonX: 20, tableY: 14, tableX: 18 },
};

function resolveInput(input) {
  if (typeof input === 'string') {
    return {
      mode: input,
      colorPreset: 'ocean',
      density: 'comfortable',
      cornerStyle: 'rounded',
      reducedMotion: false,
    };
  }
  return {
    mode: input?.mode === 'dark' ? 'dark' : 'light',
    colorPreset: input?.colorPreset || 'ocean',
    density: input?.density || 'comfortable',
    cornerStyle: input?.cornerStyle || 'rounded',
    reducedMotion: !!input?.reducedMotion,
  };
}

export function buildTheme(input) {
  const prefs = resolveInput(input);
  const isLight = prefs.mode === 'light';
  const preset = COLOR_PRESETS[prefs.colorPreset] || COLOR_PRESETS.ocean;
  const density = DENSITY_MAP[prefs.density] || DENSITY_MAP.comfortable;
  const borderRadius = RADIUS_MAP[prefs.cornerStyle] || RADIUS_MAP.rounded;
  const transition = prefs.reducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

  const primary = preset.primary;
  const secondary = preset.secondary;

  return createTheme({
    palette: {
      mode: prefs.mode,
      primary: {
        main: primary,
        light: isLight ? alpha(primary, 0.8) : alpha(primary, 0.9),
        dark: isLight ? alpha(primary, 1) : alpha(primary, 0.7),
        contrastText: '#ffffff'
      },
      secondary: {
        main: secondary,
        contrastText: '#ffffff'
      },
      success: { main: '#10b981', light: alpha('#10b981', 0.1) },
      warning: { main: '#f59e0b', light: alpha('#f59e0b', 0.1) },
      error: { main: '#ef4444', light: alpha('#ef4444', 0.1) },
      info: { main: '#06b6d4', light: alpha('#06b6d4', 0.1) },
      background: {
        default: isLight ? '#f8fafc' : '#0a0f1e',
        paper: isLight ? '#ffffff' : '#1a1f2e',
      },
      text: {
        primary: isLight ? '#0f172a' : '#f1f5f9',
        secondary: isLight ? '#475569' : '#94a3b8',
      },
      divider: isLight ? alpha('#cbd5e1', 0.5) : alpha('#334155', 0.6),
      action: {
        hover: alpha(primary, isLight ? 0.04 : 0.08),
        selected: alpha(primary, isLight ? 0.08 : 0.16),
        focus: alpha(primary, isLight ? 0.12 : 0.24),
      },
    },
    shape: { borderRadius },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h5: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
      h6: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: '0.938rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: isLight ? '#cbd5e1' : '#334155', borderRadius: '3px' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: isLight ? `1px solid ${alpha('#cbd5e1', 0.4)}` : `1px solid ${alpha('#334155', 0.6)}`,
            boxShadow: isLight
              ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)'
              : '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
            transition,
            backdropFilter: isLight ? 'none' : 'blur(20px) saturate(180%)',
            '&:hover': {
              boxShadow: isLight
                ? '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)'
                : '0 8px 12px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.25)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: Math.max(8, borderRadius - 4),
            padding: `${density.buttonY}px ${density.buttonX}px`,
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            boxShadow: isLight
              ? `0 2px 8px ${alpha(primary, 0.25)}, 0 1px 3px ${alpha(primary, 0.15)}`
              : `0 4px 12px ${alpha(primary, 0.35)}, 0 2px 6px ${alpha(primary, 0.2)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              boxShadow: isLight
                ? `0 4px 12px ${alpha(primary, 0.3)}, 0 2px 6px ${alpha(primary, 0.2)}`
                : `0 6px 16px ${alpha(primary, 0.4)}, 0 3px 8px ${alpha(primary, 0.25)}`,
              transform: 'translateY(-2px)',
              filter: 'brightness(1.05)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: alpha(primary, 0.04),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: Math.max(8, borderRadius - 4),
              backgroundColor: isLight ? alpha('#f8fafc', 0.5) : alpha('#1e293b', 0.3),
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: isLight ? alpha('#cbd5e1', 0.5) : alpha('#334155', 0.6),
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: isLight ? alpha(primary, 0.4) : alpha(primary, 0.5),
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? '#ffffff' : alpha('#1e293b', 0.5),
                '& fieldset': {
                  borderWidth: '2px',
                  borderColor: primary,
                },
              },
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isLight ? '#64748b' : '#94a3b8',
              backgroundColor: isLight ? '#f8fafc' : '#0f172a',
              borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155',
              padding: `${density.tableY + 1}px ${density.tableX + 2}px`,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition,
              '&:hover': { backgroundColor: isLight ? '#f8fafc' : '#162032' },
              '& .MuiTableCell-root': {
                borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b',
                padding: `${density.tableY + 2}px ${density.tableX + 2}px`,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: Math.max(6, borderRadius - 6),
            border: `1px solid ${alpha(isLight ? '#000' : '#fff', 0.1)}`,
            transition,
          },
          filled: {
            boxShadow: `0 1px 3px ${alpha('#000', 0.1)}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: Math.max(8, borderRadius - 4),
            margin: '2px 8px',
            padding: '8px 12px',
            '&.Mui-selected': {
              backgroundColor: alpha(primary, isLight ? 0.1 : 0.2),
              color: isLight ? primary : alpha(primary, 0.85),
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isLight ? alpha('#ffffff', 0.8) : alpha('#1a1f2e', 0.8),
            borderBottom: isLight ? `1px solid ${alpha('#cbd5e1', 0.4)}` : `1px solid ${alpha('#334155', 0.5)}`,
            boxShadow: isLight
              ? '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
              : '0 2px 4px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px) saturate(180%)',
            color: isLight ? '#0f172a' : '#f1f5f9',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: isLight ? '#ffffff' : alpha('#1a1f2e', 0.95),
            borderRight: isLight ? `1px solid ${alpha('#cbd5e1', 0.4)}` : `1px solid ${alpha('#334155', 0.5)}`,
            backdropFilter: isLight ? 'none' : 'blur(20px) saturate(180%)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: Math.max(8, borderRadius - 2),
            fontWeight: 500,
            border: `1px solid ${alpha(isLight ? '#000' : '#fff', 0.1)}`,
            boxShadow: `0 2px 8px ${alpha('#000', isLight ? 0.06 : 0.15)}`,
          },
          standardSuccess: {
            backgroundColor: isLight ? alpha('#10b981', 0.1) : alpha('#10b981', 0.15),
            color: isLight ? '#047857' : '#34d399',
          },
          standardError: {
            backgroundColor: isLight ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.15),
            color: isLight ? '#dc2626' : '#f87171',
          },
          standardWarning: {
            backgroundColor: isLight ? alpha('#f59e0b', 0.1) : alpha('#f59e0b', 0.15),
            color: isLight ? '#d97706' : '#fbbf24',
          },
          standardInfo: {
            backgroundColor: isLight ? alpha('#06b6d4', 0.1) : alpha('#06b6d4', 0.15),
            color: isLight ? '#0891b2' : '#22d3ee',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            border: isLight ? `1px solid ${alpha('#cbd5e1', 0.4)}` : `1px solid ${alpha('#334155', 0.6)}`,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)'
              : '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: isLight
              ? '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)'
              : '0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
            backdropFilter: isLight ? 'none' : 'blur(20px) saturate(180%)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isLight ? alpha('#0f172a', 0.92) : alpha('#1e293b', 0.95),
            backdropFilter: 'blur(8px)',
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: Math.max(6, borderRadius - 6),
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  });
}

export default buildTheme('light');
