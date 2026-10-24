import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import './setup';

const app = createApp();

describe('Auth Endpoints', () => {
  const validUser = {
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    password: 'Password123!',
    phone: '+91 9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    termsAccepted: true,
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('_id');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject registration if email is duplicate', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with valid password', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch authenticated profile via /api/v1/auth/me', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(validUser.email);
  });

  it('should reject unauthenticated access to /api/v1/auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
