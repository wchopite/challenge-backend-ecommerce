import { randomUUID } from 'node:crypto';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { DataSource } from 'typeorm';

const TEST_DATABASE = 'ecommerce_challenge_test';

function baseClientConfig(): ConstructorParameters<typeof Client>[0] {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: 'postgres',
  };
}

async function createTestDatabase(): Promise<void> {
  const client = new Client(baseClientConfig());
  await client.connect();

  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    TEST_DATABASE,
  ]);
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${TEST_DATABASE}"`);
  }

  await client.end();
}

async function dropTestDatabase(): Promise<void> {
  const client = new Client(baseClientConfig());
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE}" WITH (FORCE)`);
  await client.end();
}

describe('Stock endpoints (e2e)', () => {
  const sku = `SKU-E2E-${randomUUID()}`;
  let app: INestApplication;

  beforeAll(async () => {
    await createTestDatabase();

    process.env.DB_DATABASE = TEST_DATABASE;
    process.env.DB_SYNCHRONIZE = 'true';

    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.query(
      `WITH c AS (INSERT INTO categories (name) VALUES ($1) RETURNING id),
            p AS (
              INSERT INTO products (name, description, price_cents, category_id)
              SELECT $2, $3, $4, id FROM c RETURNING id
            )
       INSERT INTO variants (sku, attributes, product_id)
       SELECT $5, $6::jsonb, id FROM p`,
      [`Category ${sku}`, 'Runner', 'A running shoe', 1999900, sku, JSON.stringify({ size: '42' })],
    );
  });

  afterAll(async () => {
    await app.close();
    await dropTestDatabase();
  });

  it('registers an inbound movement and reports availability', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', 'e2e-in-1')
      .send({ sku, quantity: 5, motive: 'PURCHASE' })
      .expect(201)
      .expect((response) => {
        expect(response.body.available).toBe(5);
      });

    await request(app.getHttpServer())
      .get(`/stock/variants/${sku}`)
      .expect(200)
      .expect({ sku, available: 5 });
  });

  it('registers an outbound movement', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', 'e2e-out-1')
      .send({ sku, quantity: 3, motive: 'SALE' })
      .expect(201)
      .expect((response) => {
        expect(response.body.available).toBe(2);
      });
  });

  it('rejects an outbound movement without enough stock (409)', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', 'e2e-insufficient')
      .send({ sku, quantity: 100, motive: 'SALE' })
      .expect(409);
  });

  it('rejects an unknown SKU (404)', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', 'e2e-unknown')
      .send({ sku: 'UNKNOWN', quantity: 1, motive: 'PURCHASE' })
      .expect(404);
  });

  it('rejects an invalid payload (400)', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', 'e2e-invalid')
      .send({ sku, quantity: 0, motive: 'PURCHASE' })
      .expect(400);
  });

  it('rejects a duplicated idempotency key without changing stock (409)', async () => {
    const key = `e2e-dup-${randomUUID()}`;

    const before = await request(app.getHttpServer()).get(`/stock/variants/${sku}`).expect(200);

    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', key)
      .send({ sku, quantity: 2, motive: 'PURCHASE' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('Idempotency-Key', key)
      .send({ sku, quantity: 2, motive: 'PURCHASE' })
      .expect(409);

    const after = await request(app.getHttpServer()).get(`/stock/variants/${sku}`).expect(200);

    expect(after.body.available).toBe((before.body.available as number) + 2);
  });

  it('registers a movement without an Idempotency-Key header (201)', async () => {
    await request(app.getHttpServer())
      .post('/stock/movimientos')
      .send({ sku, quantity: 1, motive: 'PURCHASE' })
      .expect(201);
  });

  it('returns a generated x-request-id header when none is provided', async () => {
    const response = await request(app.getHttpServer()).get(`/stock/variants/${sku}`).expect(200);

    expect(response.headers['x-request-id']).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).not.toBe('');
  });

  it('honors the incoming x-request-id and echoes it on domain errors', async () => {
    const correlationId = `e2e-corr-${randomUUID()}`;

    const response = await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('x-request-id', correlationId)
      .send({ sku: 'UNKNOWN', quantity: 1, motive: 'PURCHASE' })
      .expect(404);

    expect(response.headers['x-request-id']).toBe(correlationId);
    expect(response.body.requestId).toBe(correlationId);
  });

  it('includes the request id in validation error responses', async () => {
    const correlationId = `e2e-corr-${randomUUID()}`;

    const response = await request(app.getHttpServer())
      .post('/stock/movimientos')
      .set('x-request-id', correlationId)
      .send({ sku, quantity: 0, motive: 'PURCHASE' })
      .expect(400);

    expect(response.body.requestId).toBe(correlationId);
  });
});
