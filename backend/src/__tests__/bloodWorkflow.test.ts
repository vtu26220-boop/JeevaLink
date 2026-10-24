import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import './setup';

const app = createApp();

describe('Blood Donation & Requirement Workflow', () => {
  let donorToken: string;
  let donorId: string;
  let requesterToken: string;

  const donorUser = {
    name: 'Rajesh Kumar',
    email: 'rajesh.donor@example.com',
    password: 'Password123!',
    phone: '+91 9811122233',
    city: 'Bengaluru',
    state: 'Karnataka',
    termsAccepted: true,
  };

  const requesterUser = {
    name: 'Priya Verma',
    email: 'priya.req@example.com',
    password: 'Password123!',
    phone: '+91 9844455566',
    city: 'Bengaluru',
    state: 'Karnataka',
    termsAccepted: true,
  };

  it('should register donor, toggle availability, create blood request, and handle contact workflow', async () => {
    // 1. Register donor user
    const donorRes = await request(app).post('/api/v1/auth/register').send(donorUser);
    donorToken = donorRes.body.token;

    // 2. Register donor profile
    const profileRes = await request(app)
      .post('/api/v1/donors')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        bloodGroup: 'O+',
        city: 'Bengaluru',
        state: 'Karnataka',
        contactPreference: 'Platform Only',
        isAvailable: true,
        consentToContact: true,
      });

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.donor.bloodGroup).toBe('O+');
    donorId = profileRes.body.donor._id;

    // 3. Donor toggles availability
    const toggleRes = await request(app)
      .patch('/api/v1/donors/me/availability')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.isAvailable).toBe(false);

    // Toggle back to available
    await request(app)
      .patch('/api/v1/donors/me/availability')
      .set('Authorization', `Bearer ${donorToken}`);

    // 4. Register requester user
    const reqRes = await request(app).post('/api/v1/auth/register').send(requesterUser);
    requesterToken = reqRes.body.token;

    // 5. Create blood request
    const bloodReqRes = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'Family Member',
        bloodGroup: 'O+',
        unitsRequested: 2,
        hospital: 'Manipal Hospital',
        city: 'Bengaluru',
        state: 'Karnataka',
        requiredDate: '2026-11-01',
        urgency: 'Urgent',
        preferredContact: 'Phone',
        contactPhone: '+91 9844455566',
        confirmationAccurate: true,
      });

    expect(bloodReqRes.status).toBe(201);
    expect(bloodReqRes.body.bloodRequest.status).toBe('Open');
    const bloodRequestId = bloodReqRes.body.bloodRequest._id;

    // 6. Requester submits contact request to donor
    const contactRes = await request(app)
      .post('/api/v1/donor-contact-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        bloodRequestId,
        donorId,
        message: 'Urgent need for 2 units O+ at Manipal Hospital',
      });

    expect(contactRes.status).toBe(201);
    expect(contactRes.body.contactRequest.status).toBe('Pending');
    const contactRequestId = contactRes.body.contactRequest._id;

    // 7. Donor views incoming requests
    const incomingRes = await request(app)
      .get('/api/v1/donor-contact-requests/incoming')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(incomingRes.status).toBe(200);
    expect(incomingRes.body.requests.length).toBe(1);

    // 8. Donor accepts the request
    const respondRes = await request(app)
      .patch(`/api/v1/donor-contact-requests/${contactRequestId}/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        status: 'Accepted',
        responseNote: 'I can donate tomorrow at 10 AM.',
      });

    expect(respondRes.status).toBe(200);
    expect(respondRes.body.contactRequest.status).toBe('Accepted');
    expect(respondRes.body.contactRequest.sharedContactDetails).toHaveProperty('donorPhone');

    // 9. Requester checks outgoing requests to see shared details
    const outgoingRes = await request(app)
      .get('/api/v1/donor-contact-requests/outgoing')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(outgoingRes.status).toBe(200);

    // 10. Requester updates request status to Fulfilled
    const fulfillRes = await request(app)
      .patch(`/api/v1/blood-requests/${bloodRequestId}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        status: 'Fulfilled',
        unitsFulfilled: 2,
      });

    expect(fulfillRes.status).toBe(200);
    expect(fulfillRes.body.bloodRequest.status).toBe('Fulfilled');
  });
});
