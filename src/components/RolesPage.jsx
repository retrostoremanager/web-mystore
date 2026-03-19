import { useState, useEffect, useCallback } from 'react';
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import { Security, ArrowBack, Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { getRoles, getAvailablePermissions, createRole, updateRole, deleteRole } from '../services/rolesApi';

const emptyRoleForm = { name: '', description: '', permissions: [] };

const RolesPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleDialog, setRoleDialog] = useState(null);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canManageRoles = hasPermission('users.manage');

  const loadRoles = useCallback(async () => {
    if (!getAuthHeaders().Authorization) return;
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
  }, [getAuthHeaders]);

  const loadPermissions = useCallback(async () => {
    if (!canManageRoles || !getAuthHeaders().Authorization) return;
    try {
      const result = await getAvailablePermissions(getAuthHeaders());
      setPermissions(result.data || []);
    } catch {
      setPermissions([]);
    }
  }, [canManageRoles, getAuthHeaders]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (roleDialog) loadPermissions();
  }, [roleDialog, loadPermissions]);

  const openAddDialog = () => {
    setRoleForm(emptyRoleForm);
    setRoleDialog({ mode: 'add' });
  };

  const openEditDialog = (role) => {
    setRoleForm({
      name: role.name || '',
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setRoleDialog({ mode: 'edit', role });
  };

  const handlePermissionChange = (permName, checked) => {
    setRoleForm((f) => ({
      ...f,
      permissions: checked
        ? [...(f.permissions || []), permName]
        : (f.permissions || []).filter((p) => p !== permName),
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.name?.trim()) {
      setError('Role name is required');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const headers = getAuthHeaders();
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description?.trim() || undefined,
        permissions: roleForm.permissions || [],
      };
      if (roleDialog.mode === 'add') {
        await createRole(payload, headers);
      } else {
        await updateRole(roleDialog.role.id, payload, headers);
      }
      setRoleDialog(null);
      await loadRoles();
    } catch (err) {
      setError(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirm) return;
    try {
      setSubmitting(true);
      setError(null);
      await deleteRole(deleteConfirm.id, getAuthHeaders());
      setDeleteConfirm(null);
      await loadRoles();
    } catch (err) {
      setError(err.message || 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, p) => {
    const prefix = p.name?.split('.')[0] || 'other';
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(p);
    return acc;
  }, {});

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
          {canManageRoles && (
            <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
              Create Role
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Role List
                </Typography>
              </Box>
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
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      {canManageRoles && (
                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canManageRoles ? 5 : 4} align="center" sx={{ py: 4 }}>
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
                          <TableCell>
                            <Chip
                              label={role.isSystemRole ? 'System' : 'Custom'}
                              size="small"
                              color={role.isSystemRole ? 'info' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          {canManageRoles && (
                            <TableCell align="right">
                              {!role.isSystemRole && (
                                <>
                                  <Tooltip title="Edit role">
                                    <IconButton size="small" onClick={() => openEditDialog(role)} aria-label="Edit role">
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete role">
                                    <IconButton size="small" onClick={() => setDeleteConfirm(role)} aria-label="Delete role" color="error">
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Role Dialog */}
        <Dialog open={!!roleDialog} onClose={() => setRoleDialog(null)} maxWidth="md" fullWidth>
          <DialogTitle>{roleDialog?.mode === 'add' ? 'Create Custom Role' : 'Edit Role'}</DialogTitle>
          <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Name"
                value={roleForm.name}
                onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Select the permissions that determine access to different pages and features.
              </Typography>
              <FormGroup>
                {Object.keys(groupedPermissions).length === 0 && roleDialog && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Loading permissions...
                  </Typography>
                )}
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <Box key={group} sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', display: 'block', mb: 0.5 }}>
                      {group}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {perms.map((p) => (
                        <FormControlLabel
                          key={p.id}
                          control={
                            <Checkbox
                              checked={(roleForm.permissions || []).includes(p.name)}
                              onChange={(e) => handlePermissionChange(p.name, e.target.checked)}
                            />
                          }
                          label={
                            <Tooltip title={p.description || p.name} placement="top">
                              <span>{p.name}</span>
                            </Tooltip>
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialog(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveRole} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogContent>
            {deleteConfirm && (
              <Typography>
                Are you sure you want to delete the role <strong>{deleteConfirm.name}</strong>? Users with this role will need to be assigned a different role first.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteRole} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default RolesPage;
