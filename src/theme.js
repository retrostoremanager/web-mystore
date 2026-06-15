import { createTheme } from '@mui/material/styles'

const brand = {
  primary: {
    light: '#4e6070',
    main: '#2c3e50',
    dark: '#1a252f',
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#1dc9a4',
    main: '#16a085',
    dark: '#138d75',
    contrastText: '#ffffff',
  },
}

const theme = createTheme({
  palette: {
    primary: brand.primary,
    secondary: brand.secondary,
    error: {
      light: '#ef5350',
      main: '#d32f2f',
      dark: '#b71c1c',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#ffd700',
      main: '#ed6c02',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
  },
  custom: {
    gradient: {
      brand: `linear-gradient(135deg, ${brand.primary.main} 0%, ${brand.secondary.main} 100%)`,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: brand.primary.dark,
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: brand.secondary.dark,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(0,0,0,0.04)',
            fontWeight: 600,
          },
        },
      },
    },
  },
})

export default theme
