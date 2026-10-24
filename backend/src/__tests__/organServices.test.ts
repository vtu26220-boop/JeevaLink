import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { User } from '../models/User';
import './setup';

const app = createApp();

describe('Organ Services & Admin Access Controls', () => {
  let userToken: string;
  let adminToken: string;

  const regularUser = {
    name: 'Suresh Raina',
    email: 'suresh@example.com',
    password: 'Password123!',
    phone: '+91 9123456780',
    city: 'Chennai',
    state: 'Tamil Nadu',
    termsAccepted: true,
  };

  const adminUser = {
    name: 'Admin Officer',
    email: 'admin.unit@example.com',
    password: 'AdminPassword123!',
    phone: '+91 9999900000',
    city: 'New Delhi',
    state: 'Delhi',
    termsAccepted: true,
  };

  it('should fetch organ resources and FAQs without auth', async () => {
    const resRes = await request(app).get('/api/v1/organ-donation/resources');
    expect(resRes.status).toBe(200);
    expect(resRes.body.resources.length).toBeGreaterThan(0);

    const faqRes = await request(app).get('/api/v1/organ-donation/faq');
    expect(faqRes.status).toBe(200);
    expect(faqRes.body.faqs.length).toBeGreaterThan(0);
  });

  it('should allow user to submit and withdraw expression of interest', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(regularUser);
    userToken = regRes.body.token;

    // Submit interest
    const interestRes = await request(app)
      .post('/api/v1/organ-donation/interest')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        consentToSave: true,
        requestMoreInfo: true,
        notes: 'Interested in corneal donation information.',
      });

    expect(interestRes.status).toBe(200);
    expect(interestRes.body.interest.requestMoreInfo).toBe(true);

    // Get my interest
    const getRes = await request(app)
      .get('/api/v1/organ-donation/interest/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.interest).not.toBeNull();

    // Withdraw interest
    const withdrawRes = await request(app)
      .post('/api/v1/organ-donation/interest/withdraw')
      .set('Authorization', `Bearer ${userToken}`);
    expect(withdrawRes.status).toBe(200);

    // After withdrawal, it should return null
    const afterRes = await request(app)
      .get('/api/v1/organ-donation/interest/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(afterRes.body.interest).toBeNull();
  });

  it('should handle organ assistance request lifecycle and admin updates', async () => {
    // Register user for this test
    const regRes = await request(app).post('/api/v1/auth/register').send(regularUser);
    const userToken = regRes.body.token;

    // 1. User submits assistance request
    const assistRes = await request(app)
      .post('/api/v1/organ-assistance-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        requesterName: 'Suresh Raina',
        contactEmail: 'suresh@example.com',
        contactPhone: '+91 9123456780',
        city: 'Chennai',
        state: 'Tamil Nadu',
        assistanceType: 'Authorized Transplant Center Directory Navigation',
        preferredContact: 'Email',
        briefDescription: 'Looking for verified government transplant centers in Tamil Nadu for renal guidance.',
        consentToProcess: true,
      });

    expect(assistRes.status).toBe(201);
    const requestId = assistRes.body.assistanceRequest._id;

    // 2. Regular user tries to access admin dashboard -> forbidden
    const unauthAdmin = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(unauthAdmin.status).toBe(403);

    // 3. Register admin user
    const adminReg = await request(app).post('/api/v1/auth/register').send(adminUser);
    // Promote user in DB to admin
    await User.findByIdAndUpdate(adminReg.body.user._id, { role: 'admin' });
    // Re-login to get updated token
    const loginAdmin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginAdmin.body.token;

    // 4. Admin accesses dashboard
    const adminDash = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDash.status).toBe(200);
    expect(adminDash.body.stats).toHaveProperty('totalUsers');

    // 5. Admin updates assistance request status
    const updateRes = await request(app)
      .patch(`/api/v1/admin/organ-assistance-requests/${requestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Under Review',
        note: 'Transferred details to Tamil Nadu TRANSTAN authorized liaison officer.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.request.status).toBe('Under Review');
  });
});
