import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/db';
import { describe, beforeAll, afterAll, afterEach, expect, it } from '@jest/globals';

describe('Company Controller', () => {
  let testCompanyIds: number[] = [];

  beforeAll(async () => {
    // Create test data without deleting existing companies
    const createdCompanies = await prisma.company.createMany({
      data: [
        { name: 'Test Company A', address: '123 Test St', phone: '555-1111' },
        { name: 'Test Company B', address: '456 Test St', phone: '555-2222' }
      ]
    });
    
    // Store IDs of created test companies for cleanup
    const companies = await prisma.company.findMany({
      where: {
        name: { in: ['Test Company A', 'Test Company B'] }
      },
      select: { id: true }
    });
    testCompanyIds = companies.map(c => c.id);
  });

  afterAll(async () => {
    // Clean up only the test companies we created
    await prisma.company.deleteMany({
      where: { id: { in: testCompanyIds } }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/companies', () => {
    it('should fetch all companies including test data', async () => {
      const response = await request(app)
        .get('/api/companies')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Verify test companies are present
      const testCompanies = response.body.filter((c: any) => 
        testCompanyIds.includes(c.id)
      );
      expect(testCompanies.length).toBe(2);
    });
  });

  describe('POST /api/companies', () => {
    let newCompanyId: number;

    it('should create a new company', async () => {
      const newCompany = {
        name: 'New Test Company',
        address: '789 Test St',
        phone: '555-3333'
      };

      const response = await request(app)
        .post('/api/companies')
        .send(newCompany)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      newCompanyId = response.body.id;
    });

    afterEach(async () => {
      // Clean up the newly created company
      if (newCompanyId) {
        await prisma.company.delete({
          where: { id: newCompanyId }
        });
      }
    });
  });

  // ... (rest of the test cases)
});