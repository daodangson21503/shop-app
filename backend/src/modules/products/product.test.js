const request = require('supertest');

// Mock database trước khi load app
jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const app = require('../../app');
const pool = require('../../config/db');

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Nồi cơm điện',
            slug: 'noi-com-dien',
            price: 850000,
            stock: 50,
            is_active: true,
          },
        ],
      });

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('should return product detail', async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            name: 'Nồi cơm điện',
            slug: 'noi-com-dien',
            price: 850000,
          },
        ],
      });

      const res = await request(app).get('/api/products/noi-com-dien');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('noi-com-dien');
    });

    it('should return 404 if product not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/api/products/san-pham-khong-ton-tai');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should return 401 with wrong credentials', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});