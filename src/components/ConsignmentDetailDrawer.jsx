import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Alert,
} from '@mui/material';
import { Close, AttachMoney, Payments, Undo } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  markConsignmentSold,
  recordConsignmentPayout,
  returnConsignmentToCustomer,
} from '../services/consignmentApi';

const fmt = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

const statusChipProps = {
  active: { label: 'Active', color: 'primary' },
  sold: { label: 'Sold', color: 'success' },
  returned: { label: 'Returned', color: 'default' },
};

const customerDisplayName = (item) => {
  if (item.customer) {
    return (
      [item.customer.firstName, item.customer.lastName].filter(Boolean).join(' ').trim() ||
      item.customer.email ||
      `Customer #${item.customer.id}`
    );
  }
  if (item.customerName) return item.customerName;
  return item.customerId ? `Customer #${item.customerId}` : '—';
};

const calcPayout = (salePrice, splitPercent) => {
  const price = Number(salePrice);
  const split = Number(splitPercent);
  const customerAmount = price * (split / 100);
  const storeAmount = price - customerAmount;
  return { customerAmount, storeAmount };
};

const ConsignmentDetailDrawer = ({ item, open, onClose, onItemUpdated, showSnackbar }) => {
  const { getAuthHeaders } = useAuth();

  const [markSoldOpen, setMarkSoldOpen] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [salePriceError, setSalePriceError] = useState('');
  const [markingSold, setMarkingSold] = useState(false);

  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [returning, setReturning] = useState(false);

  const [payoutConfirmOpen, setPayoutConfirmOpen] = useState(false);
  const [recordingPayout, setRecordingPayout] = useState(false);

  if (!item) return null;

  const status = item.status?.toLowerCase();
  const splitPercent = Number(item.splitPercent ?? 0);
  const askingPayout = calcPayout(item.askingPrice, splitPercent);

  const openMarkSold = () => {
    setSalePrice('');
    setSalePriceError('');
    setMarkSoldOpen(true);
  };

  const soldPreview = (() => {
    const price = parseFloat(salePrice);
    if (!salePrice || isNaN(price) || price <= 0) return null;
    return calcPayout(price, splitPercent);
  })();

  const handleMarkSold = async () => {
    const price = parseFloat(salePrice);
    if (!salePrice || isNaN(price) || price <= 0) {
      setSalePriceError('Enter a valid sale price');
      return;
    }
    try {
      setMarkingSold(true);
      const result = await markConsignmentSold(item.id, { salePrice: price }, getAuthHeaders());
      const updatedItem = result.data || { ...item, status: 'sold', salePrice: price };
      setMarkSoldOpen(false);
      onItemUpdated(updatedItem);
      showSnackbar('Item marked as sold');
    } catch (err) {
      showSnackbar(err.message || 'Failed to mark as sold', 'error');
    } finally {
      setMarkingSold(false);
    }
  };

  const handleReturn = async () => {
    try {
      setReturning(true);
      const result = await returnConsignmentToCustomer(item.id, getAuthHeaders());
      const updatedItem = result.data || { ...item, status: 'returned' };
      setReturnConfirmOpen(false);
      onItemUpdated(updatedItem);
      showSnackbar('Item returned to customer');
    } catch (err) {
      showSnackbar(err.message || 'Failed to return item', 'error');
    } finally {
      setReturning(false);
    }
  };

  const handlePayout = async () => {
    try {
      setRecordingPayout(true);
      const result = await recordConsignmentPayout(item.id, getAuthHeaders());
      const updatedItem = result.data || { ...item, payoutRecorded: true };
      setPayoutConfirmOpen(false);
      onItemUpdated(updatedItem);
      showSnackbar('Payout recorded successfully');
    } catch (err) {
      showSnackbar(err.message || 'Failed to record payout', 'error');
    } finally {
      setRecordingPayout(false);
    }
  };

  const chipProps = statusChipProps[status] || { label: item.status || '—', color: 'default' };
  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Consignment Details
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ITEM INFO
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Customer</Typography>
              <Typography variant="body1">{customerDisplayName(item)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body1">{item.description || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Asking Price</Typography>
              <Typography variant="body1">
                {item.askingPrice != null ? fmt(item.askingPrice) : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Split %</Typography>
              <Typography variant="body1">
                {item.splitPercent != null ? `${item.splitPercent}%` : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={chipProps.label} color={chipProps.color} size="small" />
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography variant="body1">{createdDate}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            PAYOUT PREVIEW (AT ASKING PRICE)
          </Typography>
          {item.askingPrice != null ? (
            <Box
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 1,
                p: 2,
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="body2">
                Store keeps: <strong>{fmt(askingPayout.storeAmount)}</strong>
              </Typography>
              <Typography variant="body2">
                Customer gets: <strong>{fmt(askingPayout.customerAmount)}</strong>
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No asking price set.
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ACTIONS
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Tooltip
              title={status !== 'active' ? 'Only active items can be marked as sold' : ''}
              disableHoverListener={status === 'active'}
            >
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AttachMoney />}
                  fullWidth
                  disabled={status !== 'active'}
                  onClick={openMarkSold}
                >
                  Mark Sold
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={
                status !== 'sold'
                  ? 'Only sold items can have a payout recorded'
                  : item.payoutRecorded
                  ? 'Payout already recorded'
                  : ''
              }
              disableHoverListener={status === 'sold' && !item.payoutRecorded}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Payments />}
                  fullWidth
                  disabled={status !== 'sold' || Boolean(item.payoutRecorded)}
                  onClick={() => setPayoutConfirmOpen(true)}
                >
                  Record Payout
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={status !== 'active' ? 'Only active items can be returned' : ''}
              disableHoverListener={status === 'active'}
            >
              <span>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Undo />}
                  fullWidth
                  disabled={status !== 'active'}
                  onClick={() => setReturnConfirmOpen(true)}
                >
                  Return to Customer
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={markSoldOpen} onClose={() => setMarkSoldOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark as Sold</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Actual Sale Price"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={salePrice}
              onChange={(e) => {
                setSalePrice(e.target.value);
                setSalePriceError('');
              }}
              fullWidth
              required
              error={Boolean(salePriceError)}
              helperText={salePriceError}
              autoFocus
            />
            {soldPreview && (
              <Alert severity="info" icon={false}>
                <Typography variant="body2">
                  Store keeps: <strong>{fmt(soldPreview.storeAmount)}</strong>
                </Typography>
                <Typography variant="body2">
                  Customer gets: <strong>{fmt(soldPreview.customerAmount)}</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkSoldOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleMarkSold} disabled={markingSold}>
            {markingSold ? <CircularProgress size={20} /> : 'Confirm Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={payoutConfirmOpen} onClose={() => setPayoutConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payout</DialogTitle>
        <DialogContent>
          <Typography>
            Confirm that you have paid out the customer for this consignment item. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePayout} disabled={recordingPayout}>
            {recordingPayout ? <CircularProgress size={20} /> : 'Record Payout'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={returnConfirmOpen} onClose={() => setReturnConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Return to Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to return this item to the customer? The status will be updated to <strong>Returned</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleReturn} disabled={returning}>
            {returning ? <CircularProgress size={20} /> : 'Return Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsignmentDetailDrawer;
