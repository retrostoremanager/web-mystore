import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Box, Button, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import config from '../config';

const STRIPE_ELEMENT_COLORS = {
  text: '#424770',
  placeholder: '#aab7c4',
  error: '#9e2146',
};

/**
 * PaymentMethodForm - Stripe Elements integration for secure card collection
 *
 * Collects payment method information (credit card) via Stripe Elements.
 * Card data is sent directly to Stripe—never through our servers (PCI compliance).
 * On success, returns the Stripe payment method ID to the parent for backend storage.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSuccess - Called with { paymentMethodId } when card is successfully tokenized
 * @param {Function} props.onCancel - Called when user cancels
 * @param {boolean} [props.disabled] - Disable the form
 */
function PaymentMethodFormInner({ onSuccess, onCancel, disabled = false }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

      if (stripeError) {
        setError(stripeError.message || 'Your card could not be verified. Please check your details and try again.');
        setLoading(false);
        return;
      }

      if (paymentMethod) {
        onSuccess({ paymentMethodId: paymentMethod.id });
      }
    } catch (err) {
      const isNetwork = err?.message?.toLowerCase?.().includes('fetch') || err?.name === 'TypeError';
      setError(isNetwork
        ? "We couldn't connect. Please check your internet connection and try again."
        : (err.message || 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '1rem',
        color: STRIPE_ELEMENT_COLORS.text,
        '::placeholder': {
          color: STRIPE_ELEMENT_COLORS.placeholder,
        },
      },
      invalid: {
        color: STRIPE_ELEMENT_COLORS.error,
      },
    },
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Add payment method
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Your card information is securely processed by Stripe. We never store your full card number.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 2,
            minHeight: 50,
            width: '100%',
          }}
        >
          <CardElement options={cardElementOptions} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={!stripe || loading || disabled}
          >
            {loading ? <CircularProgress size={24} /> : 'Add card'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

/**
 * PaymentMethodForm - Wrapper that provides Stripe Elements context
 *
 * Requires VITE_STRIPE_PUBLISHABLE_KEY to be set. If not configured,
 * renders a message asking the user to configure Stripe.
 */
export default function PaymentMethodForm(props) {
  const publishableKey = config.stripePublishableKey;

  if (!publishableKey) {
    return (
      <Paper sx={{ p: 3, maxWidth: 400 }}>
        <Alert severity="info">
          Payment method collection is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY
          to your environment to enable this feature.
        </Alert>
      </Paper>
    );
  }

  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodFormInner {...props} />
    </Elements>
  );
}
