import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Analytics Routes', () => {
  let authToken;

  beforeAll(async () => await setupTestDB());
  afterAll(async () => await teardownTestDB());
  beforeEach(async () => {
    await clearDB();
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123'
      });
    authToken = registerRes.body.token;
  });

  describe('GET /api/analytics/category', () => {
    it('should get category analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/category')
        .query({ period: 'monthly', year: '2024', month: '1' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/analytics/monthly', () => {
    it('should get monthly analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/monthly')
        .query({ year: '2024' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/analytics/budget-vs-actual', () => {
    it('should get budget vs actual comparison', async () => {
      const res = await request(app)
        .get('/api/analytics/budget-vs-actual')
        .query({ period: 'monthly', year: '2024', month: '1' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
