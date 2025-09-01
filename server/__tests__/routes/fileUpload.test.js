import request from 'supertest';
import path from 'path';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('File Upload Routes', () => {
  let authToken;
  let testUser;

  beforeAll(async () => await setupTestDB());
  afterAll(async () => await teardownTestDB());
  beforeEach(async () => {
    await clearDB();
    // Create test user and get token
  });

  describe('PUT /api/users/profile/avatar', () => {
    it('should upload valid avatar image', async () => {
      const res = await request(app)
        .put('/api/users/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', path.join(__dirname, '../fixtures/valid-avatar.jpg'));
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid file type', async () => {
      const res = await request(app)
        .put('/api/users/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', path.join(__dirname, '../fixtures/invalid.pdf'));
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Only image files are allowed!');
    });
  });

  describe('POST /api/receipts/upload', () => {
    it('should upload and process valid receipt', async () => {
      const res = await request(app)
        .post('/api/receipts/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', path.join(__dirname, '../fixtures/valid-receipt.jpg'));
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
