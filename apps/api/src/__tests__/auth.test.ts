import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';

// Mock Redis and BullMQ to avoid real connections in tests
jest.mock('../../src/config/redis', () => ({
  redis: {
    connect: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  },
  getRedisClient: jest.fn(),
  closeRedis: jest.fn(),
}));

jest.mock('../../src/queue/deploymentQueue', () => ({
  getDeploymentQueue: jest.fn(),
  enqueueDeployment: jest.fn().mockResolvedValue('mock-job-id'),
  DEPLOYMENT_QUEUE_NAME: 'deployments',
}));

jest.mock('../../src/queue/deploymentWorker', () => ({
  startDeploymentWorker: jest.fn(),
  stopDeploymentWorker: jest.fn(),
}));

jest.mock('../../src/websocket/io', () => ({
  initIoServer: jest.fn(),
  getIoServer: jest.fn().mockReturnValue(null),
}));

const app = createApp();

// ─── Test Data ────────────────────────────────────────────────────────────────

const testUser = {
  email: `test-auth-${Date.now()}@devflow.test`,
  password: 'TestPassword123',
  name: 'Test User',
};

let accessToken: string;
let refreshToken: string;
let userId: string;

// ─── Cleanup ──────────────────────────────────────────────────────────────────

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@devflow.test' } } });
  await prisma.$disconnect();
});

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never leak hash

    userId = res.body.data.user.id;
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('should reject weak passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'weak@devflow.test',
      password: 'weak',
    });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'ValidPass123',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999',
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('should reject non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@devflow.test',
      password: 'ValidPass123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.id).toBe(userId);
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('MISSING_TOKEN');
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });
});

describe('POST /api/auth/refresh', () => {
  it('should issue new tokens with valid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });

  it('should reject invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
