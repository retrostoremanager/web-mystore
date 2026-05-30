import { Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Alert } from '@mui/material';

function formatUsd(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const ReceiptView = ({ receipt, loading, error }) => {
  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="text" width="30%" height={24} sx={{ ml: 'auto' }} />
        <Skeleton variant="text" width="25%" height={24} sx={{ ml: 'auto' }} />
        <Skeleton variant="text" width="35%" height={32} sx={{ ml: 'auto' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!receipt) return null;

  const storeName = receipt.storeName || receipt.companyName || '';
  const storeAddress = receipt.storeAddress || receipt.addressLine || '';
  const storePhone = receipt.storePhone || receipt.phone || '';
  const saleDate = (receipt.date || receipt.saleDate) ? new Date(receipt.date || receipt.saleDate).toLocaleString() : '—';
  const items = receipt.items || [];
  const subtotal = Number(receipt.subtotal ?? 0);
  const taxAmount = Number(receipt.taxAmount ?? receipt.tax ?? 0);
  const taxLabel = receipt.taxLabel || 'Tax';
  const taxEnabled = receipt.taxEnabled !== false && (receipt.taxRate > 0 || taxAmount > 0);
  const total = Number(receipt.total ?? 0);
  const customerName = receipt.customerName || receipt.customer?.name || [receipt.customer?.firstName, receipt.customer?.lastName].filter(Boolean).join(' ').trim() || '';
  const customerEmail = receipt.customerEmail || receipt.customer?.email || '';

  return (
    <Box id="receipt-print-area">
      <style>{`
        @media print {
          body > *:not(#receipt-print-root) { display: none !important; }
          #receipt-print-area { display: block !important; max-width: 480px; margin: 0 auto; }
          .no-print { display: none !important; }
          header, nav, aside, .MuiAppBar-root, .MuiDrawer-root { display: none !important; }
        }
      `}</style>

      {storeName && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>{storeName}</Typography>
          {storeAddress && <Typography variant="body2" color="text.secondary">{storeAddress}</Typography>}
          {storePhone && <Typography variant="body2" color="text.secondary">{storePhone}</Typography>}
        </Box>
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
        Sale #{receipt.id}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Date: {saleDate}
      </Typography>
      {customerName && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Customer: {customerName}{customerEmail ? ` (${customerEmail})` : ''}
        </Typography>
      )}
      {receipt.paymentMethod && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Payment: {receipt.paymentMethod}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 320 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                  No line items
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => {
                const name = item.name || item.inventoryItem?.name || `Item #${item.inventoryItemId || idx + 1}`;
                const qty = Number(item.quantity ?? 1);
                const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                const lineTotal = Number(item.totalPrice ?? item.lineTotal ?? (unitPrice * qty));
                return (
                  <TableRow key={idx}>
                    <TableCell>{name}</TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell align="right">{formatUsd(unitPrice)}</TableCell>
                    <TableCell align="right">{formatUsd(lineTotal)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
          <Typography variant="body2">{formatUsd(subtotal)}</Typography>
        </Box>
        {taxEnabled && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">{taxLabel}:</Typography>
            <Typography variant="body2">{formatUsd(taxAmount)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="subtitle1" fontWeight={700}>Total:</Typography>
          <Typography variant="subtitle1" fontWeight={700}>{formatUsd(total)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ReceiptView;
