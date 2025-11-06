import { testRequest } from '../helpers';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await testRequest()
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'Test123!@#',
          name: 'New User'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('new@example.com');
    });

    it('should reject weak passwords', async () => {
      const res = await testRequest()
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'weak',
          name: 'New User'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate emails', async () => {
      await testRequest()
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test123!@#',
          name: 'First User'
        });

      const res = await testRequest()
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test123!@#',
          name: 'Second User'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await testRequest()
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const res = await testRequest()
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});