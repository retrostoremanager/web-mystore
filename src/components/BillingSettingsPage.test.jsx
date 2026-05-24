import { describe, it, expect } from 'vitest';
import { getSubscriptionChipProps } from './BillingSettingsPage';

describe('getSubscriptionChipProps', () => {
  it('returns success color for active status', () => {
    const result = getSubscriptionChipProps('active');
    expect(result.color).toBe('success');
    expect(result.label).toBe('Active');
  });

  it('returns success color for ACTIVE (case-insensitive)', () => {
    const result = getSubscriptionChipProps('ACTIVE');
    expect(result.color).toBe('success');
  });

  it('returns warning color for trial status', () => {
    const result = getSubscriptionChipProps('trial');
    expect(result.color).toBe('warning');
    expect(result.label).toBe('Trial');
  });

  it('returns warning color for trialing status', () => {
    const result = getSubscriptionChipProps('trialing');
    expect(result.color).toBe('warning');
    expect(result.label).toBe('Trial');
  });

  it('returns error color for cancelled status', () => {
    const result = getSubscriptionChipProps('cancelled');
    expect(result.color).toBe('error');
    expect(result.label).toBe('Cancelled');
  });

  it('returns error color for canceled (US spelling)', () => {
    const result = getSubscriptionChipProps('canceled');
    expect(result.color).toBe('error');
    expect(result.label).toBe('Cancelled');
  });

  it('returns error color for past_due status', () => {
    const result = getSubscriptionChipProps('past_due');
    expect(result.color).toBe('error');
    expect(result.label).toBe('Past Due');
  });

  it('returns default color for paused status', () => {
    const result = getSubscriptionChipProps('paused');
    expect(result.color).toBe('default');
    expect(result.label).toBe('Paused');
  });

  it('returns default color and Unknown label for null', () => {
    const result = getSubscriptionChipProps(null);
    expect(result.color).toBe('default');
    expect(result.label).toBe('Unknown');
  });

  it('returns default color and Unknown label for undefined', () => {
    const result = getSubscriptionChipProps(undefined);
    expect(result.color).toBe('default');
    expect(result.label).toBe('Unknown');
  });

  it('returns default color and original label for unknown status', () => {
    const result = getSubscriptionChipProps('suspended');
    expect(result.color).toBe('default');
    expect(result.label).toBe('suspended');
  });
});
