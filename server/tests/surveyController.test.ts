import request from 'supertest';
import { app } from '../src/index';  
import { prisma } from '../src/config/db'; 
import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';

describe('Survey Controller', () => {
    let testUserId: number;

    beforeAll(async () => {
        // Clean up existing data
        await prisma.surveyResponse.deleteMany();
        await prisma.survey.deleteMany();
        await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
        
        // Create a test user for our tests
        const testUser = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test User',
                role: UserRole.USER,
                uid: 'test-user-id'
            }
        });
        testUserId = testUser.id;
    });

    afterAll(async () => {
        // Clean up after tests
        // await prisma.surveyResponse.deleteMany();
        // await prisma.survey.deleteMany();
        // await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
        await prisma.$disconnect();
    });

    describe('POST /api/surveys/:surveyId/surveyResponses', () => {
        let surveyId: number;
    
        beforeAll(async () => {
            const survey = await prisma.survey.create({
                data: {
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}',
                    userId: testUserId
                }
            });
            surveyId = survey.id;
        });
    
        it('should create a new survey response with valid data', async () => {
            const response = await request(app)
                .post(`/api/surveys/${surveyId}/surveyResponses`)
                .send({
                    responseJson: '{"answer": "Test"}',
                    userId: testUserId
                });
    
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.surveyId).toBe(surveyId);
        });
    
        it('should return 400 when required fields are missing', async () => {
            const response = await request(app)
                .post(`/api/surveys/${surveyId}/surveyResponses`)
                .send({});
    
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    
        it('should return 404 for non-existent survey ID', async () => {
            const response = await request(app)
                .post('/api/surveys/invalid-id/surveyResponses')
                .send({
                    responseJson: '{"answer": "Test"}',
                    userId: testUserId
                });
    
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/surveys', () => {
        it('should create a new survey', async () => {
            const response = await request(app)
                .post('/api/surveys')
                .send({
                    title: 'New Survey',
                    description: 'This is a new survey',
                    surveyJson: '{}',
                    userId: testUserId
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /api/surveys', () => {
        it('should fetch all surveys', async () => {
            await prisma.survey.create({
                data: {
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}',
                    userId: testUserId
                }
            });

            const response = await request(app)
                .get('/api/surveys');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/surveys/:userId', () => {
        it('should fetch surveys by user ID', async () => {
            const response = await request(app)
                .get(`/api/surveys/${testUserId}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});

describe('POST /api/surveys/:surveyId/surveyResponses', () => {
    let surveyId: number;
    let testUserId: number;

    beforeAll(async () => {
        // Clean up existing data
        await prisma.surveyResponse.deleteMany();
        await prisma.survey.deleteMany();
        await prisma.user.deleteMany({ where: { email: 'test-response@example.com' } });
        
        // Create a test user
        const testUser = await prisma.user.create({
            data: {
                email: 'test-response@example.com',
                name: 'Test Response User',
                role: UserRole.USER,
                uid: 'test-response-user-id'
            }
        });
        testUserId = testUser.id;

        const survey = await prisma.survey.create({
            data: {
                title: 'Test Survey',
                description: 'This is a test survey',
                surveyJson: '{}',
                userId: testUserId
            }
        });
        surveyId = survey.id;
    });

    afterAll(async () => {
        // Clean up after tests
        // await prisma.surveyResponse.deleteMany();
        // await prisma.survey.deleteMany();
        // await prisma.user.deleteMany({ where: { email: 'test-response@example.com' } });
    });

    describe('POST /api/surveys/:surveyId/surveyResponses', () => {
        it('should create a new survey response', async () => {
            const response = await request(app)
                .post(`/api/surveys/${surveyId}/surveyResponses`)
                .send({
                    responseJson: '{}',
                    userId: testUserId
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /api/surveys/:surveyId/surveyResponses', () => {
        it('should fetch survey responses', async () => {
            await prisma.surveyResponse.create({
                data: {
                    surveyId: surveyId,
                    responseJson: '{}',
                    userId: testUserId
                }
            });

            const response = await request(app)
                .get(`/api/surveys/${surveyId}/surveyResponses`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});