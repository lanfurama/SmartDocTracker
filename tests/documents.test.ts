import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import documentsRouter from '../server/api/v1/documents';
import { errorHandler } from '../server/middleware/errorHandler';

describe('Documents API', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/documents', documentsRouter);
        app.use(errorHandler);
    });

    describe('GET /', () => {
        it('should return paginated documents', async () => {
            const response = await request(app)
                .get('/api/v1/documents')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('total');
        });

        it('should support pagination parameters', async () => {
            const response = await request(app)
                .get('/api/v1/documents?page=1&limit=5')
                .expect(200);

            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
            expect(response.body.data.length).toBeLessThanOrEqual(5);
        });

        it('should support status filter', async () => {
            const response = await request(app)
                .get('/api/v1/documents?status=PROCESSING')
                .expect(200);

            response.body.data.forEach((doc: any) => {
                expect(doc.currentStatus).toBe('PROCESSING');
            });
        });

        it('should support search query', async () => {
            const response = await request(app)
                .get('/api/v1/documents?q=test')
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });
    });

    describe('GET /:id', () => {
        it('should return 404 for non-existent document', async () => {
            const response = await request(app)
                .get('/api/v1/documents/non-existent-id')
                .expect(404);

            expect(response.body.error).toHaveProperty('message');
            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });

    describe('POST /', () => {
        it('should reject invalid document data', async () => {
            const response = await request(app)
                .post('/api/v1/documents')
                .send({ title: 'Test' }) // Missing required fields
                .expect(400);

            expect(response.body.error).toHaveProperty('message');
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should create document with valid data', async () => {
            const newDoc = {
                id: 'TEST-' + Date.now(),
                qrCode: 'QR-' + Date.now(),
                title: 'Test Document',
                currentStatus: 'SENDING',
                currentHolder: 'Test User',
                createdAt: new Date().toISOString(),
                history: [{
                    action: 'Created',
                    location: 'Test Location',
                    user: 'Test User',
                    type: 'in',
                    timestamp: new Date().toISOString()
                }]
            };

            const response = await request(app)
                .post('/api/v1/documents')
                .send(newDoc)
                .expect(201);

            expect(response.body.status).toBe('created');
            expect(response.body.id).toBe(newDoc.id);
        });

        it('should reject duplicate QR code', async () => {
            const qrCode = 'DUPLICATE-' + Date.now();

            const doc1 = {
                id: 'DOC1-' + Date.now(),
                qrCode,
                title: 'First Document',
                currentStatus: 'SENDING',
                currentHolder: 'User',
                createdAt: new Date().toISOString()
            };

            await request(app)
                .post('/api/v1/documents')
                .send(doc1)
                .expect(201);

            const doc2 = { ...doc1, id: 'DOC2-' + Date.now() };

            const response = await request(app)
                .post('/api/v1/documents')
                .send(doc2)
                .expect(409);

            expect(response.body.error.code).toBe('CONFLICT');
        });
    });

    describe('POST /:id/actions', () => {
        it('should reject return action without notes', async () => {
            const response = await request(app)
                .post('/api/v1/documents/test-id/actions')
                .send({
                    newStatus: 'RETURNED',
                    action: 'Trả về',
                    location: 'Test',
                    user: 'Test User',
                    type: 'error',
                    notes: '' // Empty notes for return action
                })
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(response.body.error.message).toContain('lý do');
        });
    });
});
