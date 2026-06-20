const pool = require('../../config/db');

async function list({ search, category, page = 1, limit = 12 }) {
  const offset = (page - 1) * limit;
  const conditions = ['is_active = true'];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category_id = $${values.length}`);
  }

  const where = conditions.join(' AND ');
  values.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT * FROM products WHERE ${where}
     ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return rows;
}

async function getBySlug(slug) {
  const { rows } = await pool.query('SELECT * FROM products WHERE slug=$1', [slug]);
  if (!rows[0]) throw { status: 404, message: 'Product not found' };
  return rows[0];
}

async function create(data) {
  const { name, slug, description, price, stock, image_url, category_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO products (name, slug, description, price, stock, image_url, category_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, slug, description, price, stock, image_url, category_id]
  );
  return rows[0];
}

async function update(id, data) {
  const { name, description, price, stock, image_url, category_id } = data;
  const { rows } = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, stock=$4,
     image_url=$5, category_id=$6, updated_at=now() WHERE id=$7 RETURNING *`,
    [name, description, price, stock, image_url, category_id, id]
  );
  if (!rows[0]) throw { status: 404, message: 'Product not found' };
  return rows[0];
}

async function remove(id) {
  await pool.query('UPDATE products SET is_active=false WHERE id=$1', [id]);
}

module.exports = { list, getBySlug, create, update, remove };