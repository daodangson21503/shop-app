<template>
  <div class="admin-wrapper">
    <div class="admin-header">
      <h2>Quản lý đơn hàng</h2>
      <a-button @click="$router.push('/admin')">← Về quản lý sản phẩm</a-button>
    </div>

    <a-table :dataSource="orders" :columns="columns" rowKey="id" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'total_amount'">
          {{ Number(record.totalAmount).toLocaleString() }}đ
        </template>
        <template v-else-if="column.key === 'created_at'">
          {{ new Date(record.createdAt).toLocaleString('vi-VN') }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-select v-model:value="record.status" style="width: 140px" @change="(val) => changeStatus(record.id, val)">
            <a-select-option value="pending">Chờ xử lý</a-select-option>
            <a-select-option value="confirmed">Đã xác nhận</a-select-option>
            <a-select-option value="shipping">Đang giao</a-select-option>
            <a-select-option value="completed">Hoàn tất</a-select-option>
            <a-select-option value="cancelled">Đã hủy</a-select-option>
          </a-select>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button size="small" @click="viewDetail(record)">Xem chi tiết</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="detailVisible" title="Chi tiết đơn hàng" :footer="null" width="600px">
      <div v-if="selectedOrder">
        <p><strong>Khách hàng:</strong> {{ selectedOrder.customer_name }}</p>
        <p><strong>SĐT:</strong> {{ selectedOrder.customer_phone }}</p>
        <p><strong>Địa chỉ:</strong> {{ selectedOrder.customer_address }}</p>
        <a-divider />
        <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
          <span>{{ item.product_name }} x{{ item.quantity }}</span>
          <span>{{ Number(item.subtotal).toLocaleString() }}đ</span>
        </div>
        <a-divider />
        <div class="item-row total">
          <span>Tổng cộng</span>
          <span>{{ Number(selectedOrder.total_amount).toLocaleString() }}đ</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import http from '../../api/axios';

const orders = ref([]);
const loading = ref(false);
const detailVisible = ref(false);
const selectedOrder = ref(null);

const columns = [
  { title: 'Khách hàng', dataIndex: 'customerName' },
  { title: 'SĐT', dataIndex: 'customerPhone' },
  { title: 'Tổng tiền', key: 'total_amount' },
  { title: 'Ngày đặt', key: 'created_at' },
  { title: 'Trạng thái', key: 'status' },
  { title: '', key: 'action' },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const { data } = await http.get('/orders');
    orders.value = data.data;
  } finally {
    loading.value = false;
  }
}

async function changeStatus(id, status) {
  try {
    await http.patch(`/orders/${id}/status`, { status });
    message.success('Đã cập nhật trạng thái');
  } catch (err) {
    message.error('Cập nhật thất bại');
    fetchOrders();
  }
}

async function viewDetail(record) {
  const { data } = await http.get(`/orders/${record.id}`);
  selectedOrder.value = data.data;
  detailVisible.value = true;
}

onMounted(fetchOrders);
</script>

<style scoped>
.admin-wrapper {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 16px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.item-row.total {
  font-weight: 700;
  font-size: 16px;
}
</style>