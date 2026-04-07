import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';

const domain = import.meta.env.VITE_APP_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_APP_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_APP_AUTH0_API_AUDIENCE;

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f4057',
      light: '#3a617f',
      dark: '#132737',
      contrastText: '#fffaf4',
    },
    secondary: {
      main: '#d9674d',
      light: '#f18867',
      dark: '#b44f38',
      contrastText: '#fffaf4',
    },
    success: {
      main: '#3f8a69',
    },
    warning: {
      main: '#d8a43d',
    },
    error: {
      main: '#ba5348',
    },
    background: {
      default: '#f6efe4',
      paper: 'rgba(255, 250, 244, 0.88)',
    },
    text: {
      primary: '#193042',
      secondary: '#5d6d78',
    },
    divider: 'rgba(31, 64, 87, 0.14)',
  },
  shape: {
    borderRadius: 22,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI Variable Text", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(circle at top left, rgba(245, 177, 87, 0.22), transparent 26%),
            radial-gradient(circle at 86% 18%, rgba(217, 103, 77, 0.18), transparent 22%),
            linear-gradient(180deg, #fbf5ea 0%, #f6efe4 48%, #f2ece2 100%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience,
          scope: "profile read:todos create:todos delete:todos update:todos"
        }}
      >
        <App />
      </Auth0Provider>
    </ThemeProvider>
  </React.StrictMode>
)
