const pool = require('../../config/db');

async function create(data) {
  const { customer_name, customer_phone, customer_address, items, user_id } = data;

  if (!items || items.length === 0) {
    throw { status: 400, message: 'Giỏ hàng trống' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Tính tổng tiền + verify giá thật từ DB (không tin giá frontend gửi lên)
    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id=$1 AND is_active=true',
        [item.product_id]
      );
      const product = rows[0];
      if (!product) throw { status: 404, message: `Sản phẩm id=${item.product_id} không tồn tại` };
      if (product.stock < item.quantity) {
        throw { status: 400, message: `Sản phẩm "${product.name}" không đủ hàng trong kho` };
      }

      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      verifiedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal,
      });
    }

    // Tạo order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id || null, customer_name, customer_phone, customer_address, totalAmount]
    );
    const order = orderResult.rows[0];

    // Tạo order_items + giảm stock
    for (const item of verifiedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.subtotal]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id=$2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    return { ...order, items: verifiedItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
  if (!rows[0]) throw { status: 404, message: 'Order not found' };

  const items = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [id]);
  return { ...rows[0], items: items.rows };
}

async function updateStatus(id, status) {
  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw { status: 400, message: 'Trạng thái không hợp lệ' };
  }
  const { rows } = await pool.query(
    'UPDATE orders SET status=$1, updated_at=now() WHERE id=$2 RETURNING *',
    [status, id]
  );
  if (!rows[0]) throw { status: 404, message: 'Order not found' };
  return rows[0];
}

module.exports = { create, listAll, getById, updateStatus };