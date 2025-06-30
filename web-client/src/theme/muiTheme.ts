import { createTheme } from '@mui/material/styles';

// 三国主题色彩
const threeKingdomsColors = {
  shu: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#991b1b',
    contrastText: '#ffffff',
  },
  wei: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  wu: {
    main: '#16a34a',
    light: '#22c55e',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  gold: {
    main: '#ffd700',
    light: '#ffed4e',
    dark: '#ca8a04',
    contrastText: '#000000',
  },
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35', // 橙色主色调
      light: '#ff8a50',
      dark: '#e55100',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700', // 金色次要色
      light: '#ffed4e',
      dark: '#ca8a04',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a', // 深蓝背景
      paper: '#1e293b',
    },
    surface: {
      main: '#334155',
      light: '#475569',
      dark: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    // 三国特色色彩
    ...threeKingdomsColors,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#ffd700',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#ff6b35',
    },
    h3: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(22, 163, 74, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, #1e293b 0%, #0f172a 100%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, #1f2937, #111827)',
          border: '1px solid #374151',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(to right, #f97316, #ea580c)',
          '&:hover': {
            background: 'linear-gradient(to right, #ea580c, #c2410c)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(to right, #ffd700, #f59e0b)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(to right, #f59e0b, #d97706)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#ff6b35',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#ffd700',
          color: '#000000',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          height: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: '#374151',
        },
        barColorPrimary: {
          background: 'linear-gradient(to right, #ef4444, #f87171)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #1f2937, #111827)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #374151',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(to bottom, #1f2937, #111827)',
          borderRight: '1px solid #374151',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(to bottom right, #1f2937, #111827)',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#374151',
            '& fieldset': {
              borderColor: '#4b5563',
            },
            '&:hover fieldset': {
              borderColor: '#ff6b35',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

// 声明扩展的主题类型
declare module '@mui/material/styles' {
  interface Palette {
    shu: Palette['primary'];
    wei: Palette['primary'];
    wu: Palette['primary'];
    gold: Palette['primary'];
    surface: Palette['primary'];
  }

  interface PaletteOptions {
    shu?: PaletteOptions['primary'];
    wei?: PaletteOptions['primary'];
    wu?: PaletteOptions['primary'];
    gold?: PaletteOptions['primary'];
    surface?: PaletteOptions['primary'];
  }
}

export default theme;
export { threeKingdomsColors };