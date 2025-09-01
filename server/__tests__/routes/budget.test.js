import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Budget Routes', () => {
  let authToken;

  beforeAll(async () => await setupTestDB());
  afterAll(async () => await teardownTestDB());
  beforeEach(async () => {
    await clearDB();
    // Create and login test user first
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123'
      });
    authToken = registerRes.body.token;
  });

  const testBudget = {
    category: 'food',
    amount: 500,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  };

  describe('POST /api/budgets', () => {
    it('should create new budget', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBudget);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.budget.amount).toBe(testBudget.amount);
    });
  });

  describe('GET /api/budgets', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBudget);
    });

    it('should get all budgets', async () => {
      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.budgets)).toBe(true);
      expect(res.body.budgets.length).toBeGreaterThan(0);
    });
  });
});
