import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Security, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoles } from '../services/rolesApi';

const RolesPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!getAuthHeaders().Authorization) return;
    const loadRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getRoles(getAuthHeaders());
        setRoles(result.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load roles');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, [getAuthHeaders]);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Roles
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Role List
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No roles found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((role) => (
                        <TableRow key={role.id} hover>
                          <TableCell>{role.name}</TableCell>
                          <TableCell>{role.description || '—'}</TableCell>
                          <TableCell>
                            {role.permissions?.length ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {role.permissions.slice(0, 5).map((p) => (
                                  <Chip key={p} label={p} size="small" variant="outlined" />
                                ))}
                                {role.permissions.length > 5 && (
                                  <Chip
                                    label={`+${role.permissions.length - 5} more`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={role.isSystemRole ? 'System' : 'Custom'}
                              size="small"
                              color={role.isSystemRole ? 'info' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RolesPage;
