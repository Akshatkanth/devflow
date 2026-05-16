import request from 'supertest';

// Ensure test env overrides are applied before importing the app
process.env.RATE_LIMIT_MAX = '2';

import { createApp } from '../app';

const app = createApp();

describe('Error shape consistency', () => {
  test('Validation errors return consistent JSON shape', async () => {
    // Use public auth register route which uses `validate` and is not protected
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.any(String),
        code: 'VALIDATION_ERROR',
        details: expect.any(Array),
      })
    );
    // details should contain objects with field and message
    expect(res.body.details[0]).toEqual(
      expect.objectContaining({ field: expect.any(String), message: expect.any(String) })
    );
  });

  test('Rate limiter returns consistent JSON shape (429)', async () => {
    // Send three login attempts to exceed the default small limit (2)
    const payload = { email: 'noone@example.com', password: 'irrelevant' };

    await request(app).post('/api/auth/login').send(payload);
    await request(app).post('/api/auth/login').send(payload);
    const res = await request(app).post('/api/auth/login').send(payload);

    expect(res.status).toBe(429);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.any(String),
        code: expect.any(String),
      })
    );
  });
});
