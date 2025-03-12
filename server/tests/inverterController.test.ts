import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/db';
import { describe, beforeAll, afterAll, beforeEach, expect, it } from '@jest/globals';

describe('Inverter Controller', () => {
    let testInverterId: number;

    beforeAll(async () => {
        // Clean up existing data
        await prisma.inverter.deleteMany();
    });

    afterAll(async () => {
        await prisma.inverter.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/inverters', () => {
        it('should create a new inverter with valid data', async () => {
            const response = await request(app)
                .post('/api/inverters')
                .send({
                    manufacturer: 'SolarTech',
                    modelNumber: 'ST-1000',
                    description: 'High-efficiency inverter',
                    outputVoltage: 240,
                    maxCurrent: 40,
                    maxPower: 9600
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.manufacturer).toBe('SolarTech');
            expect(response.body.modelNumber).toBe('ST-1000');
            testInverterId = response.body.id;
        });

        it('should return 400 when required fields are missing', async () => {
            const response = await request(app)
                .post('/api/inverters')
                .send({
                    manufacturer: 'SolarTech'
                    // Missing other required fields
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('GET /api/inverters', () => {
        beforeEach(async () => {
            // Ensure we have at least one inverter in the database
            if (!testInverterId) {
                const inverter = await prisma.inverter.create({
                    data: {
                        manufacturer: 'TestMaker',
                        modelNumber: 'TM-2000',
                        description: 'Test inverter',
                        outputVoltage: 220,
                        maxCurrent: 30,
                        maxPower: 6600
                    }
                });
                testInverterId = inverter.id;
            }
        });

        it('should fetch all inverters with pagination', async () => {
            const response = await request(app)
                .get('/api/inverters')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should fetch a single inverter by ID', async () => {
            const response = await request(app)
                .get(`/api/inverters/${testInverterId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', testInverterId);
            expect(response.body).toHaveProperty('manufacturer');
            expect(response.body).toHaveProperty('modelNumber');
        });

        it('should return 404 for non-existent inverter ID', async () => {
            const response = await request(app)
                .get('/api/inverters/99999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Inverter not found');
        });
    });

    describe('PUT /api/inverters/:inverterId', () => {
        it('should update an existing inverter', async () => {
            const response = await request(app)
                .put(`/api/inverters/${testInverterId}`)
                .send({
                    manufacturer: 'UpdatedMaker',
                    modelNumber: 'UM-3000',
                    description: 'Updated description',
                    outputVoltage: 230,
                    maxCurrent: 35,
                    maxPower: 8050
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('manufacturer', 'UpdatedMaker');
            expect(response.body).toHaveProperty('modelNumber', 'UM-3000');
        });

        it('should return 404 when updating non-existent inverter', async () => {
            const response = await request(app)
                .put('/api/inverters/99999')
                .send({
                    manufacturer: 'UpdatedMaker',
                    modelNumber: 'UM-3000',
                    description: 'Updated description',
                    outputVoltage: 230,
                    maxCurrent: 35,
                    maxPower: 8050
                });

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /api/inverters/:inverterId', () => {
        it('should delete an existing inverter', async () => {
            const response = await request(app)
                .delete(`/api/inverters/${testInverterId}`);

            expect(response.status).toBe(204);

            // Verify the inverter was deleted
            const getResponse = await request(app)
                .get(`/api/inverters/${testInverterId}`);
            expect(getResponse.status).toBe(404);
        });

        it('should return 500 when deleting non-existent inverter', async () => {
            const response = await request(app)
                .delete('/api/inverters/99999');

            expect(response.status).toBe(500);
        });
    });
});
