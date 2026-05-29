import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import { CameraAlt, UploadFile } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { parseTradeInImage } from '../../services/tradeInApi';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AiScanDialog({ open, onClose, onItemsParsed, onError }) {
  const { getAuthHeaders } = useAuth();
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleClose = useCallback(() => {
    if (loading) return;
    setPreview(null);
    setPendingFile(null);
    setValidationError(null);
    onClose();
  }, [loading, onClose]);

  const handleFileSelected = useCallback((file) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setValidationError('Image is too large. Maximum size is 5 MB.');
      return;
    }
    setValidationError(null);
    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  }, []);

  const handleCameraChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
      e.target.value = '';
    },
    [handleFileSelected]
  );

  const handleUploadChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
      e.target.value = '';
    },
    [handleFileSelected]
  );

  const handleConfirm = useCallback(async () => {
    if (!pendingFile) return;
    setLoading(true);
    try {
      const imageBase64 = await readFileAsBase64(pendingFile);
      const result = await parseTradeInImage(imageBase64, pendingFile.type, getAuthHeaders());
      const parsedItems = result.data?.items || result.items || [];
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setPendingFile(null);
      setValidationError(null);
      onClose();
      onItemsParsed(parsedItems);
    } catch (err) {
      onError(err.message || 'Failed to identify games from image');
    } finally {
      setLoading(false);
    }
  }, [pendingFile, preview, getAuthHeaders, onClose, onItemsParsed, onError]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Games</DialogTitle>
      <DialogContent>
        {!pendingFile && !loading && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {validationError && (
              <Typography color="error" variant="body2">
                {validationError}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Take a photo of a pile of games or upload an image. The AI will identify the titles for
              you.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CameraAlt />}
                fullWidth
                onClick={() => cameraInputRef.current?.click()}
              >
                Use Camera
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                fullWidth
                onClick={() => uploadInputRef.current?.click()}
              >
                Upload Image
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Max file size: 5 MB
            </Typography>
          </Stack>
        )}

        {(pendingFile || loading) && (
          <Box sx={{ mt: 1 }}>
            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Selected image preview"
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'block',
                  mb: 2,
                }}
              />
            )}
            {loading && (
              <Stack direction="row" alignItems="center" spacing={2} justifyContent="center" sx={{ py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Identifying games…
                </Typography>
              </Stack>
            )}
          </Box>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          hidden
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
        />
        <input
          ref={uploadInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleUploadChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {pendingFile && (
          <Button onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setPendingFile(null); setValidationError(null); }} disabled={loading}>
            Choose Different Image
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!pendingFile || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Identifying…' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
