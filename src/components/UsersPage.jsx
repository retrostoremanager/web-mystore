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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Badge, ArrowBack, Add, Edit, Block, PersonAdd, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, createUser, updateUser, resendInvite } from '../services/usersApi';
import { getRoles } from '../services/rolesApi';

const emptyUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleIds: [],
};

const UsersPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDialog, setUserDialog] = useState(null); // { mode: 'add' | 'edit', user?: {} }
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [submitting, setSubmitting] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(null); // { user, action: 'disable' | 'enable' }
  const [resendingId, setResendingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, rolesRes] = await Promise.all([
        getUsers(getAuthHeaders()),
        getRoles(getAuthHeaders()),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAuthHeaders().Authorization) return;
    loadUsers();
  }, [getAuthHeaders]);

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'pending_invitation') return 'warning';
    return 'default';
  };

  const openAddDialog = () => {
    setUserForm(emptyUserForm);
    setUserDialog({ mode: 'add' });
  };

  const openEditDialog = (user) => {
    const roleNames = (user.roles || []).map((r) => r.toLowerCase());
    const roleIds = roles
      .filter((r) => roleNames.includes(r.name?.toLowerCase()))
      .map((r) => r.id);
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      roleIds,
      isActive: user.status === 'active',
    });
    setUserDialog({ mode: 'edit', user });
  };

  const handleSaveUser = async () => {
    if (!userForm.firstName?.trim() || !userForm.lastName?.trim() || !userForm.email?.trim()) {
      setError('First name, last name, and email are required');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const headers = getAuthHeaders();
      if (userDialog.mode === 'add') {
        await createUser(
          {
            firstName: userForm.firstName.trim(),
            lastName: userForm.lastName.trim(),
            email: userForm.email.trim().toLowerCase(),
            phone: userForm.phone?.trim() || undefined,
            roleIds: userForm.roleIds || [],
          },
          headers
        );
      } else {
        await updateUser(
          userDialog.user.id,
          {
            firstName: userForm.firstName.trim(),
            lastName: userForm.lastName.trim(),
            email: userForm.email.trim().toLowerCase(),
            phone: userForm.phone?.trim() || undefined,
            roleIds: userForm.roleIds || [],
            isActive: userForm.isActive,
          },
          headers
        );
      }
      setUserDialog(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (user) => {
    try {
      setResendingId(user.id);
      setError(null);
      await resendInvite(user.id, getAuthHeaders());
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to resend invite');
    } finally {
      setResendingId(null);
    }
  };

  const handleDisableOrEnable = async () => {
    if (!disableConfirm) return;
    const isEnabling = disableConfirm.action === 'enable';
    try {
      setSubmitting(true);
      setError(null);
      await updateUser(disableConfirm.user.id, { isActive: isEnabling }, getAuthHeaders());
      setDisableConfirm(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || `Failed to ${isEnabling ? 'enable' : 'disable'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Users
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  User List
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
                Add User
              </Button>
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
                      <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                          </TableCell>
                          <TableCell>
                            {user.roles?.length ? (
                              user.roles.map((r) => (
                                <Chip key={r} label={r} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>{user.email || '—'}</TableCell>
                          <TableCell>{user.userType || 'employee'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.status || 'active'}
                              size="small"
                              color={getStatusColor(user.status)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {user.status === 'pending_invitation' && (
                              <Tooltip title="Resend invite email">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResendInvite(user)}
                                    disabled={resendingId === user.id}
                                    aria-label="Resend invite"
                                  >
                                    <Email fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            <IconButton size="small" onClick={() => openEditDialog(user)} aria-label="Edit user">
                              <Edit fontSize="small" />
                            </IconButton>
                            {user.status === 'removed' ? (
                              <Tooltip title="Enable user">
                                <IconButton
                                  size="small"
                                  onClick={() => setDisableConfirm({ user, action: 'enable' })}
                                  aria-label="Enable user"
                                  color="success"
                                >
                                  <PersonAdd fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Disable user">
                                <IconButton
                                  size="small"
                                  onClick={() => setDisableConfirm({ user, action: 'disable' })}
                                  aria-label="Disable user"
                                  color="warning"
                                >
                                  <Block fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
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

      {/* Add/Edit User Dialog */}
      <Dialog open={!!userDialog} onClose={() => setUserDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog?.mode === 'add' ? 'Add User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm((f) => ({ ...f, lastName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={userForm.phone}
              onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={userForm.roleIds || []}
                onChange={(e) => setUserForm((f) => ({ ...f, roleIds: e.target.value }))}
                renderValue={(selected) =>
                  roles
                    .filter((r) => selected.includes(r.id))
                    .map((r) => r.name)
                    .join(', ')
                }
                label="Roles"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox checked={(userForm.roleIds || []).indexOf(role.id) > -1} />
                    <ListItemText primary={role.name} secondary={role.description} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {userDialog?.mode === 'edit' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userForm.isActive ?? true}
                    onChange={(e) => setUserForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disable/Enable Confirmation Dialog */}
      <Dialog open={!!disableConfirm} onClose={() => setDisableConfirm(null)}>
        <DialogTitle>{disableConfirm?.action === 'enable' ? 'Enable User' : 'Disable User'}</DialogTitle>
        <DialogContent>
          {disableConfirm && (
            <Typography>
              {disableConfirm.action === 'enable' ? (
                <>
                  Are you sure you want to enable{' '}
                  <strong>
                    {[disableConfirm.user.firstName, disableConfirm.user.lastName].filter(Boolean).join(' ') || disableConfirm.user.email}
                  </strong>
                  ? They will regain access to the system.
                </>
              ) : (
                <>
                  Are you sure you want to disable{' '}
                  <strong>
                    {[disableConfirm.user.firstName, disableConfirm.user.lastName].filter(Boolean).join(' ') || disableConfirm.user.email}
                  </strong>
                  ? They will lose access to the system.
                </>
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={disableConfirm?.action === 'enable' ? 'success' : 'warning'}
            onClick={handleDisableOrEnable}
            disabled={submitting}
          >
            {submitting ? (disableConfirm?.action === 'enable' ? 'Enabling...' : 'Disabling...') : disableConfirm?.action === 'enable' ? 'Enable' : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
