-- Add brand column to payment_method table.
-- The backend model and service already capture card brand from Stripe
-- (PaymentMethod.Card.Brand), but the column was missing from the initial schema.
-- Values are Stripe brand strings: visa, mastercard, amex, discover, etc.
ALTER TABLE payment_method
    ADD COLUMN IF NOT EXISTS brand VARCHAR(50) NOT NULL DEFAULT '';
