import request from 'supertest';
import { app } from '../src/index';  
import { prisma } from '../src/config/db'; 
import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';




describe('Survey Controller', () => {
    beforeAll(async () => {
        await prisma.surveyResponse.deleteMany();
        await prisma.survey.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/surveys/:surveyId/surveyResponses', () => {
        let surveyId: string;
    
        beforeAll(async () => {
            const survey = await prisma.survey.create({
                data: {
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}'
                }
            });
            surveyId = survey.id;
        });
    
        it('should create a new survey response with valid data', async () => {
            const response = await request(app)
                .post(`/api/surveys/${surveyId}/surveyResponses`)
                .send({
                    responseJson: '{"answer": "Test"}',
                    userId: 'user-1'
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
                    userId: 'user-1'
                });
    
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    
        // it('should return 400 for invalid JSON format', async () => {
        //     const response = await request(app)
        //         .post(`/api/surveys/${surveyId}/surveyResponses`)
        //         .send({
        //             responseJson: 'invalid-json',
        //             userId: 'user-1'
        //         });
    
        //     expect(response.status).toBe(400);
        //     expect(response.body).toHaveProperty('error');
        // });
    });

    describe('POST /api/surveys', () => {
        it('should create a new survey', async () => {
            const response = await request(app)
                .post('/api/surveys')
                .send({
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /api/surveys/:userId', () => {
        it('should fetch surveys by user ID', async () => {
            const response = await request(app)
                .get('/api/surveys/user-1');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

 
});

describe('POST /api/surveys/:surveyId/surveyResponses', () => {
    let surveyId: string;

    beforeAll(async () => {
        // Clean up existing data
        await prisma.surveyResponse.deleteMany();
        await prisma.survey.deleteMany();

        // Create a new survey
        const survey = await prisma.survey.create({
            data: {
                title: 'Test Survey',
                description: 'This is a test survey',
                surveyJson: '{}'
            }
        });
        surveyId = survey.id;
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.surveyResponse.deleteMany();
        await prisma.survey.deleteMany();
    });

    describe('POST /api/surveys/:surveyId/surveyResponses', () => {
        it('should create a new survey response', async () => {
            const survey = await prisma.survey.create({
                data: {
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}'
                }
            });

            const response = await request(app)
                .post(`/api/surveys/${survey.id}/surveyResponses`)
                .send({
                    responseJson: '{}',
                    userId: 'user-1'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /api/surveys/:surveyId/surveyResponses', () => {
        it('should fetch survey responses', async () => {
            const survey = await prisma.survey.create({
                data: {
                    title: 'Test Survey',
                    description: 'This is a test survey',
                    surveyJson: '{}'
                }
            });

            await prisma.surveyResponse.create({
                data: {
                    surveyId: survey.id,
                    responseJson: '{}',
                    userId: 'user-1'
                }
            });

            const response = await request(app)
                .get(`/api/surveys/${survey.id}/surveyResponses`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});