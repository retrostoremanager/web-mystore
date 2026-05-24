import { describe, it, expect } from 'vitest';
import { validateLogoFile } from './CompanyProfilePage';

const makeFile = (name, type, size = 100) =>
  new File(['x'.repeat(size)], name, { type });

describe('validateLogoFile', () => {
  it('returns invalid when no file provided', () => {
    const result = validateLogoFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts image/jpeg', () => {
    const result = validateLogoFile(makeFile('logo.jpg', 'image/jpeg'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/jpg', () => {
    const result = validateLogoFile(makeFile('logo.jpg', 'image/jpg'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/png', () => {
    const result = validateLogoFile(makeFile('logo.png', 'image/png'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/webp', () => {
    const result = validateLogoFile(makeFile('logo.webp', 'image/webp'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('rejects image/svg+xml', () => {
    const result = validateLogoFile(makeFile('logo.svg', 'image/svg+xml'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects image/gif', () => {
    const result = validateLogoFile(makeFile('logo.gif', 'image/gif'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects application/pdf', () => {
    const result = validateLogoFile(makeFile('doc.pdf', 'application/pdf'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects files over 5MB', () => {
    const over5MB = 5 * 1024 * 1024 + 1;
    const result = validateLogoFile(makeFile('logo.png', 'image/png', over5MB));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it('accepts files exactly at 5MB', () => {
    const exactly5MB = 5 * 1024 * 1024;
    const result = validateLogoFile(makeFile('logo.png', 'image/png', exactly5MB));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts small valid files', () => {
    const result = validateLogoFile(makeFile('tiny.png', 'image/png', 1024));
    expect(result.valid).toBe(true);
  });
});
