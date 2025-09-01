import request from 'supertest';
import app from '../../server.js';
import { setupTestDB, teardownTestDB, clearDB } from '../config/testSetup.js';

describe('Notification Routes', () => {
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

  const testNotification = {
    title: 'Budget Alert',
    message: "You've exceeded your food budget by 20%",
    type: 'budget_alert'
  };

  describe('POST /api/notifications', () => {
    it('should create new notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testNotification);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.notification.title).toBe(testNotification.title);
    });
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testNotification);
    });

    it('should get all notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testNotification);
      notificationId = createRes.body.notification._id;
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notification.read).toBe(true);
    });
  });
});
