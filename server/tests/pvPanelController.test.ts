import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/db';
import { describe, beforeAll, afterAll, beforeEach, expect, it } from '@jest/globals';

describe('PV Panel Controller', () => {
    let testPvPanelId: number;

    const samplePvPanel = {
        manufacturer: 'SunPower',
        modelNumber: 'SPR-X22-360',
        description: 'High-efficiency solar panel',
        maxPower: 360,
        openCircuitVoltage: 48.2,
        tempCoeffPmax: -0.29,
        tempCoeffIsc: 0.05,
        tempCoeffVoc: -0.25,
        shortSide: 1046,
        longSide: 1558,
        weight: 18.6,
        performanceWarranty: '25 years',
        productWarranty: '10 years'
    };

    beforeAll(async () => {
        // Clean up existing data
        await prisma.pVPanel.deleteMany();
    });

    afterAll(async () => {
        await prisma.pVPanel.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/pv-panels', () => {
        it('should create a new PV panel with valid data', async () => {
            const response = await request(app)
                .post('/api/pv-panels')
                .send(samplePvPanel);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.manufacturer).toBe(samplePvPanel.manufacturer);
            expect(response.body.modelNumber).toBe(samplePvPanel.modelNumber);
            expect(response.body.maxPower).toBe(samplePvPanel.maxPower);
            testPvPanelId = response.body.id;
        });

        it('should return 500 when required fields are missing', async () => {
            const response = await request(app)
                .post('/api/pv-panels')
                .send({
                    manufacturer: 'SunPower'
                    // Missing other required fields
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        });

        it('should validate numeric fields', async () => {
            const invalidPanel = {
                ...samplePvPanel,
                maxPower: 'invalid', // Should be a number
                tempCoeffPmax: 'invalid'
            };

            const response = await request(app)
                .post('/api/pv-panels')
                .send(invalidPanel);

            expect(response.status).toBe(500);
        });
    });

    describe('GET /api/pv-panels', () => {
        beforeEach(async () => {
            // Ensure we have at least one PV panel in the database
            if (!testPvPanelId) {
                const pvPanel = await prisma.pVPanel.create({
                    data: {
                        ...samplePvPanel
                    }
                });
                testPvPanelId = pvPanel.id;
            }
        });

        it('should fetch all PV panels with pagination', async () => {
            const response = await request(app)
                .get('/api/pv-panels')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('manufacturer');
            expect(response.body[0]).toHaveProperty('maxPower');
        });

        it('should fetch a single PV panel by ID', async () => {
            const response = await request(app)
                .get(`/api/pv-panels/${testPvPanelId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', testPvPanelId);
            expect(response.body).toHaveProperty('manufacturer', samplePvPanel.manufacturer);
            expect(response.body).toHaveProperty('maxPower', samplePvPanel.maxPower);
        });

        it('should return 404 for non-existent PV panel ID', async () => {
            const response = await request(app)
                .get('/api/pv-panels/99999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'PV panel not found');
        });

        it('should handle invalid page and limit parameters', async () => {
            const response = await request(app)
                .get('/api/pv-panels')
                .query({ page: 'invalid', limit: 'invalid' });

            expect(response.status).toBe(200); // Should default to page 1, limit 50
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('PUT /api/pv-panels/:pvPanelId', () => {
        const updatedPanel = {
            manufacturer: 'Updated Manufacturer',
            modelNumber: 'UPD-400',
            description: 'Updated high-efficiency panel',
            maxPower: 400,
            openCircuitVoltage: 50.0,
            tempCoeffPmax: -0.30,
            tempCoeffIsc: 0.06,
            tempCoeffVoc: -0.26,
            shortSide: 1050,
            longSide: 1560,
            weight: 19.0,
            performanceWarranty: '30 years',
            productWarranty: '15 years'
        };

        it('should update an existing PV panel', async () => {
            const response = await request(app)
                .put(`/api/pv-panels/${testPvPanelId}`)
                .send(updatedPanel);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('manufacturer', updatedPanel.manufacturer);
            expect(response.body).toHaveProperty('maxPower', updatedPanel.maxPower);
            expect(response.body).toHaveProperty('performanceWarranty', updatedPanel.performanceWarranty);
        });

        it('should return 500 when updating non-existent PV panel', async () => {
            const response = await request(app)
                .put('/api/pv-panels/99999')
                .send(updatedPanel);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        });

        it('should validate update data types', async () => {
            const invalidUpdate = {
                ...updatedPanel,
                maxPower: 'invalid',
                performanceWarranty: 'invalid'
            };

            const response = await request(app)
                .put(`/api/pv-panels/${testPvPanelId}`)
                .send(invalidUpdate);

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /api/pv-panels/:pvPanelId', () => {
        it('should delete an existing PV panel', async () => {
            const response = await request(app)
                .delete(`/api/pv-panels/${testPvPanelId}`);

            expect(response.status).toBe(204);

            // Verify the PV panel was deleted
            const getResponse = await request(app)
                .get(`/api/pvpanels/${testPvPanelId}`);
            expect(getResponse.status).toBe(404);
        });

        it('should return 500 when deleting non-existent PV panel', async () => {
            const response = await request(app)
                .delete('/api/pv-panels/99999');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        });
    });
});
