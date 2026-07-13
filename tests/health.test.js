import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/health/route';

describe('health route', () => {
  it('checks the deterministic scoring engine', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.scoring).toBe(true);
    expect(body.libraryVersion).toMatch(/^\d{4}\.\d{2}\.\d+$/);
  });
});
