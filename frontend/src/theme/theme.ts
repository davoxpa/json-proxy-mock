import { createTheme, ThemeOptions } from '@mui/material';

const commonThemeOptions: Partial<ThemeOptions> = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'all 0.3s ease-in-out !important',
        },
        '*': {
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, border-color 0.3s ease-in-out !important',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
  },
};

const lightThemeOptions: ThemeOptions = {
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions); 