import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('FCM Routes', () => {
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

  const testFcmToken = {
    token: 'sample_fcm_token_here',
    deviceType: 'android'
  };

  describe('POST /api/fcm/save', () => {
    it('should save FCM token', async () => {
      const res = await request(app)
        .post('/api/fcm/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testFcmToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/fcm/delete', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/fcm/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testFcmToken);
    });

    it('should delete FCM token', async () => {
      const res = await request(app)
        .post('/api/fcm/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: testFcmToken.token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
