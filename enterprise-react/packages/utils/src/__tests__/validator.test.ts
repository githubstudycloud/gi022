import { describe, expect, it } from 'vitest';

import {
  createValidator,
  isEmpty,
  isEmail,
  isPhone,
  isURL,
  passwordStrength,
} from '../validator';

describe('isEmail', () => {
  it('validates correct emails', () => {
    expect(isEmail('user@example.com')).toBe(true);
    expect(isEmail('user+tag@sub.domain.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isEmail('not-an-email')).toBe(false);
    expect(isEmail('@missing-user.com')).toBe(false);
    expect(isEmail('missing-at-sign.com')).toBe(false);
  });
});

describe('isPhone', () => {
  it('validates Chinese mobile numbers', () => {
    expect(isPhone('13800138000')).toBe(true);
    expect(isPhone('19912345678')).toBe(true);
  });

  it('rejects invalid numbers', () => {
    expect(isPhone('12345678901')).toBe(false);
    expect(isPhone('1380013800')).toBe(false);
  });
});

describe('isURL', () => {
  it('validates URLs', () => {
    expect(isURL('https://example.com')).toBe(true);
    expect(isURL('http://localhost:3000/path?q=1')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isURL('not-a-url')).toBe(false);
    expect(isURL('ftp://')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('returns true for empty values', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('  ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
  });
});

describe('passwordStrength', () => {
  it('returns 0 for empty', () => {
    expect(passwordStrength('')).toBe(0);
  });

  it('returns 4 for strong password', () => {
    expect(passwordStrength('MyP@ssw0rd!')).toBe(4);
  });
});

describe('createValidator', () => {
  it('validates required', () => {
    const { valid, errors } = createValidator('').required().validate();
    expect(valid).toBe(false);
    expect(errors).toHaveLength(1);
  });

  it('validates email format', () => {
    const { valid } = createValidator('bad-email').required().email().validate();
    expect(valid).toBe(false);
  });

  it('passes all rules', () => {
    const { valid } = createValidator('user@example.com').required().email().validate();
    expect(valid).toBe(true);
  });
});
