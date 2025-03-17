import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/db';
import { describe, beforeAll, afterAll, beforeEach, expect, it } from '@jest/globals';

describe('PV Panel Controller', () => {
    let testPvPanelId: number;

    // Updated sample PV panel with fields matching the new schema
    const samplePvPanel = {
        manufacturer: 'SunPower',
        modelNumber: 'SPR-X22-360-' + Date.now(), // Make unique to avoid conflicts
        description: 'High-efficiency solar panel',
        safetyCertification: 'UL 1703',
        ptcRating: 345.5,
        notes: 'Premium panel with excellent warranty',
        designQualificationCert: 'IEC 61215',
        performanceEvaluation: 'Tier 1',
        family: 'X-Series',
        technology: 'Monocrystalline',
        activeArea: 1.6,
        numberOfCells: 96,
        numberOfPanels: 1,
        bipv: false,
        nameplateMaxCurrentAtPmax: 5.9,
        nameplateVoltageAtPmax: 61.0,
        averageNoct: 45.0,
        tempCoeffPmax: -0.29,
        tempCoeffIsc: 0.05,
        tempCoeffVoc: -0.25,
        tempCoeffIpmax: 0.03,
        tempCoeffVpmax: -0.24,
        currentAtLowPower: 5.5,
        voltageAtLowPower: 58.0,
        currentAtNoct: 4.8,
        voltageAtNoct: 56.5,
        mountingType: 'Roof Mount',
        moduleType: 'Standard',
        shortSide: 1046,
        longSide: 1558,
        geometricMultiplier: 1.0,
        performanceRatio: 0.85,
        weight: 18.6,
        framingMaterial: 'Aluminum',
        junctionBoxType: 'IP67',
        connectorType: 'MC4',
        performanceWarranty: '25 years',
        productWarranty: '10 years',
        efficiency: 22.8,
        openCircuitVoltage: 48.2,
        shortCircuitCurrent: 6.2,
        maxPower: 360
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

        it('should return 400 when required fields are missing', async () => {
            const response = await request(app)
                .post('/api/pv-panels')
                .send({
                    // Missing manufacturer which is required
                    modelNumber: 'TEST-MODEL-' + Date.now()
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Manufacturer and model number are required');
        });

        it('should validate numeric fields', async () => {
            const invalidPanel = {
                manufacturer: 'SunPower',
                modelNumber: 'INVALID-MODEL-' + Date.now(),
                maxPower: 'invalid' as any, // Should be a number
                tempCoeffPmax: 'invalid' as any
            };

            const response = await request(app)
                .post('/api/pv-panels')
                .send(invalidPanel);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/pv-panels', () => {
        beforeEach(async () => {
            // Ensure we have at least one PV panel in the database
            if (!testPvPanelId) {
                const pvPanel = await prisma.pVPanel.create({
                    data: {
                        ...samplePvPanel,
                        modelNumber: 'UNIQUE-MODEL-' + Date.now() // Ensure unique model number
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
            modelNumber: 'UPD-400-' + Date.now(), // Ensure unique model number
            description: 'Updated high-efficiency panel',
            safetyCertification: 'UL 1703 Updated',
            ptcRating: 395.5,
            notes: 'Updated premium panel with excellent warranty',
            designQualificationCert: 'IEC 61215 Updated',
            performanceEvaluation: 'Tier 1 Premium',
            family: 'X-Series Premium',
            technology: 'Monocrystalline PERC',
            activeArea: 1.65,
            numberOfCells: 104,
            numberOfPanels: 1,
            bipv: false,
            nameplateMaxCurrentAtPmax: 6.1,
            nameplateVoltageAtPmax: 65.0,
            averageNoct: 44.0,
            tempCoeffPmax: -0.30,
            tempCoeffIsc: 0.06,
            tempCoeffVoc: -0.26,
            tempCoeffIpmax: 0.04,
            tempCoeffVpmax: -0.25,
            currentAtLowPower: 5.8,
            voltageAtLowPower: 60.0,
            currentAtNoct: 5.0,
            voltageAtNoct: 58.5,
            mountingType: 'Roof Mount Premium',
            moduleType: 'Premium',
            shortSide: 1050,
            longSide: 1560,
            geometricMultiplier: 1.1,
            performanceRatio: 0.88,
            weight: 19.0,
            framingMaterial: 'Aluminum Premium',
            junctionBoxType: 'IP68',
            connectorType: 'MC4 Premium',
            performanceWarranty: '30 years',
            productWarranty: '15 years',
            efficiency: 23.5,
            openCircuitVoltage: 50.0,
            shortCircuitCurrent: 6.5,
            maxPower: 400
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
                manufacturer: 'Test Manufacturer',
                modelNumber: 'TEST-MODEL-' + Date.now(),
                maxPower: 'invalid' as any,
                performanceWarranty: 123 as any // Should be a string
            };

            const response = await request(app)
                .put(`/api/pv-panels/${testPvPanelId}`)
                .send(invalidUpdate);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('DELETE /api/pv-panels/:pvPanelId', () => {
        it('should delete an existing PV panel', async () => {
            const response = await request(app)
                .delete(`/api/pv-panels/${testPvPanelId}`);

            expect(response.status).toBe(204);

            // Verify the PV panel was deleted
            const getResponse = await request(app)
                .get(`/api/pv-panels/${testPvPanelId}`);
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
