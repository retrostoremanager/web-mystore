import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Chip,
  IconButton,
  Skeleton,
  Snackbar,
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
  ListItemText,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Badge, ArrowBack, Add, Edit, Block, PersonAdd, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, createUser, updateUser, resendInvite } from '../services/usersApi';
import { getRoles } from '../services/rolesApi';

const emptyInviteForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: null,
};

const emptyEditForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: null,
};

const UsersPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(null);

  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const [editDialog, setEditDialog] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deactivateConfirm, setDeactivateConfirm] = useState(null);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  const [resendingId, setResendingId] = useState(null);

  const loadData = useCallback(async () => {
    if (!getAuthHeaders().Authorization) return;
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        getUsers(getAuthHeaders()),
        getRoles(getAuthHeaders()),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.message || 'Failed to load users' });
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'pending_invitation') return 'warning';
    if (status === 'invitation_expired') return 'error';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (status === 'pending_invitation') return 'Pending invitation';
    if (status === 'invitation_expired') return 'Invitation expired';
    if (status === 'removed') return 'Disabled';
    return status === 'active' ? 'Active' : status || 'Active';
  };

  const validateInviteForm = () => {
    const errors = {};
    if (!inviteForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!inviteForm.lastName.trim()) errors.lastName = 'Last name is required';
    if (!inviteForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    return errors;
  };

  const openInviteDialog = () => {
    setInviteForm(emptyInviteForm);
    setInviteErrors({});
    setInviteDialog(true);
  };

  const handleInviteUser = async () => {
    const errors = validateInviteForm();
    if (Object.keys(errors).length > 0) {
      setInviteErrors(errors);
      return;
    }
    try {
      setInviteSubmitting(true);
      await createUser(
        {
          firstName: inviteForm.firstName.trim(),
          lastName: inviteForm.lastName.trim(),
          email: inviteForm.email.trim().toLowerCase(),
          phone: inviteForm.phone?.trim() || undefined,
          roleIds: inviteForm.roleId ? [inviteForm.roleId] : [],
        },
        getAuthHeaders()
      );
      setInviteDialog(false);
      setSnackbar({ severity: 'success', message: 'Invitation sent successfully' });
      await loadData();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.message || 'Failed to invite user' });
    } finally {
      setInviteSubmitting(false);
    }
  };

  const openEditDialog = (user) => {
    const roleNames = (user.roles || []).map((r) => r.toLowerCase());
    const matchedRole = roles.find((r) => roleNames.includes(r.name?.toLowerCase()));
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      roleId: matchedRole?.id ?? null,
    });
    setEditDialog(user);
  };

  const handleEditUser = async () => {
    if (!editForm.firstName?.trim() || !editForm.lastName?.trim() || !editForm.email?.trim()) {
      setSnackbar({ severity: 'error', message: 'First name, last name, and email are required' });
      return;
    }
    try {
      setEditSubmitting(true);
      await updateUser(
        editDialog.id,
        {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim().toLowerCase(),
          phone: editForm.phone?.trim() || undefined,
          roleIds: editForm.roleId ? [editForm.roleId] : [],
        },
        getAuthHeaders()
      );
      setEditDialog(null);
      setSnackbar({ severity: 'success', message: 'User updated successfully' });
      await loadData();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.message || 'Failed to update user' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeactivateOrReactivate = async () => {
    if (!deactivateConfirm) return;
    const isReactivating = deactivateConfirm.action === 'reactivate';
    try {
      setDeactivateSubmitting(true);
      await updateUser(deactivateConfirm.user.id, { isActive: isReactivating }, getAuthHeaders());
      setDeactivateConfirm(null);
      setSnackbar({
        severity: 'success',
        message: isReactivating ? 'User reactivated successfully' : 'User deactivated successfully',
      });
      await loadData();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.message || `Failed to ${isReactivating ? 'reactivate' : 'deactivate'} user` });
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  const handleResendInvite = async (user) => {
    try {
      setResendingId(user.id);
      await resendInvite(user.id, getAuthHeaders());
      setSnackbar({ severity: 'success', message: 'Invite resent successfully' });
      await loadData();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.message || 'Failed to resend invite' });
    } finally {
      setResendingId(null);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => [params.row.firstName, params.row.lastName].filter(Boolean).join(' ') || '—',
      renderCell: ({ row }) => (
        <span>{[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}</span>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.email || '—',
      renderCell: ({ row }) => <span>{row.email || '—'}</span>,
    },
    {
      field: 'roles',
      headerName: 'Role',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: ({ row }) =>
        row.roles?.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
            {row.roles.map((r) => (
              <Chip key={r} label={r} size="small" />
            ))}
          </Box>
        ) : (
          '—'
        ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: ({ row }) => (
        <Chip
          label={getStatusLabel(row.status)}
          size="small"
          color={getStatusColor(row.status)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {(row.status === 'pending_invitation' || row.status === 'invitation_expired') && (
            <Tooltip title={row.status === 'invitation_expired' ? 'Resend invite (link expired)' : 'Resend invite email'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleResendInvite(row)}
                  disabled={resendingId === row.id}
                  aria-label="Resend invite"
                >
                  <Email fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Edit user">
            <IconButton size="small" onClick={() => openEditDialog(row)} aria-label="Edit user">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'removed' ? (
            <Tooltip title="Reactivate user">
              <IconButton
                size="small"
                onClick={() => setDeactivateConfirm({ user: row, action: 'reactivate' })}
                aria-label="Reactivate user"
                color="success"
              >
                <PersonAdd fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Deactivate user">
              <IconButton
                size="small"
                onClick={() => setDeactivateConfirm({ user: row, action: 'deactivate' })}
                aria-label="Deactivate user"
                color="warning"
              >
                <Block fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: `skel-${i}` }));

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
              <Button variant="contained" startIcon={<Add />} onClick={openInviteDialog} aria-label="Invite user">
                Invite User
              </Button>
            </Box>

            {loading ? (
              <Box>
                {skeletonRows.map((r) => (
                  <Skeleton key={r.id} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  autoHeight
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  getRowId={(row) => row.id}
                  slots={{
                    noRowsOverlay: () => (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                        <Typography color="text.secondary">No users found</Typography>
                      </Box>
                    ),
                  }}
                  sx={{ border: 'none' }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="First Name"
              value={inviteForm.firstName}
              onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
              error={!!inviteErrors.firstName}
              helperText={inviteErrors.firstName}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={inviteForm.lastName}
              onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
              error={!!inviteErrors.lastName}
              helperText={inviteErrors.lastName}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              error={!!inviteErrors.email}
              helperText={inviteErrors.email}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={inviteForm.phone}
              onChange={(e) => setInviteForm((f) => ({ ...f, phone: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.roleId ?? ''}
                onChange={(e) => setInviteForm((f) => ({ ...f, roleId: e.target.value || null }))}
                label="Role"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <ListItemText primary={role.name} secondary={role.description} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInviteUser} disabled={inviteSubmitting}>
            {inviteSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="First Name"
              value={editForm.firstName}
              onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editForm.lastName}
              onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.roleId ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, roleId: e.target.value || null }))}
                label="Role"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <ListItemText primary={role.name} secondary={role.description} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditUser} disabled={editSubmitting}>
            {editSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate/Reactivate Confirmation Dialog */}
      <Dialog open={!!deactivateConfirm} onClose={() => setDeactivateConfirm(null)}>
        <DialogTitle>
          {deactivateConfirm?.action === 'reactivate' ? 'Reactivate User' : 'Deactivate User'}
        </DialogTitle>
        <DialogContent>
          {deactivateConfirm && (
            <Typography>
              {deactivateConfirm.action === 'reactivate' ? (
                <>
                  Are you sure you want to reactivate{' '}
                  <strong>
                    {[deactivateConfirm.user.firstName, deactivateConfirm.user.lastName].filter(Boolean).join(' ') || deactivateConfirm.user.email}
                  </strong>
                  ? They will regain access to the system.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate{' '}
                  <strong>
                    {[deactivateConfirm.user.firstName, deactivateConfirm.user.lastName].filter(Boolean).join(' ') || deactivateConfirm.user.email}
                  </strong>
                  ? They will lose access to the system.
                </>
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={deactivateConfirm?.action === 'reactivate' ? 'success' : 'warning'}
            onClick={handleDeactivateOrReactivate}
            disabled={deactivateSubmitting}
          >
            {deactivateSubmitting
              ? deactivateConfirm?.action === 'reactivate' ? 'Reactivating...' : 'Deactivating...'
              : deactivateConfirm?.action === 'reactivate' ? 'Reactivate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity || 'info'} onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
