import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Financial Summary Routes', () => {
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

  const testSummary = {
    totalIncome: 5000,
    totalExpenses: 3500,
    totalSavings: 1500,
    period: 'monthly',
    date: '2024-01-01'
  };

  describe('POST /api/financial-summary/summary', () => {
    it('should create financial summary', async () => {
      const res = await request(app)
        .post('/api/financial-summary/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSummary);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.totalIncome).toBe(testSummary.totalIncome);
    });
  });

  describe('GET /api/financial-summary/summary', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/financial-summary/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSummary);
    });

    it('should get financial summary', async () => {
      const res = await request(app)
        .get('/api/financial-summary/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary).toBeDefined();
    });
  });
});
