import { describe, expect, it } from 'vitest';

describe('benchmark publication rule', () => {
  it('uses a thirty-result minimum', () => {
    const publish = (count) => count >= 30;
    expect(publish(29)).toBe(false);
    expect(publish(30)).toBe(true);
  });
});
