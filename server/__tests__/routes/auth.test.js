import request from 'supertest';
import app from '../../server.js';
import { jest } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Authentication Routes', () => {
  beforeAll(async () => await setupTestDB());
  afterAll(async () => await teardownTestDB());
  beforeEach(async () => await clearDB());

  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    phone: '+1234567890'
  };

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });
});
