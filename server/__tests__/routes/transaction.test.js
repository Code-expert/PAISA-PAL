import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Transaction Routes', () => {
  let authToken;
  let testUser;

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

  const testTransaction = {
    amount: 25.99,
    description: 'Coffee at Starbucks',
    category: 'food',
    type: 'expense',
    paymentMethod: 'credit_card'
  };

  describe('POST /api/transactions', () => {
    it('should create new transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTransaction);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.transaction.amount).toBe(testTransaction.amount);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTransaction);
    });

    it('should get all transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.transactions)).toBe(true);
      expect(res.body.transactions.length).toBeGreaterThan(0);
    });
  });
});
