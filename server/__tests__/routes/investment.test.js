import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Investment Routes', () => {
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

  const testInvestment = {
    name: 'Apple Inc.',
    symbol: 'AAPL',
    quantity: 10,
    purchasePrice: 150.00,
    currentPrice: 175.00,
    type: 'stock'
  };

  describe('POST /api/investments', () => {
    it('should create new investment', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testInvestment);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.investment.symbol).toBe(testInvestment.symbol);
    });
  });

  describe('GET /api/investments', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testInvestment);
    });

    it('should get all investments', async () => {
      const res = await request(app)
        .get('/api/investments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.investments)).toBe(true);
      expect(res.body.investments.length).toBeGreaterThan(0);
    });
  });
});
