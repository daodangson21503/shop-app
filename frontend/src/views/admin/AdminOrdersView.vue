<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="admin-sidebar">
      <div class="sidebar-logo">🏠 ShopGiaDung</div>
      <nav class="sidebar-nav">
        <a class="nav-item" @click="$router.push('/admin')">📊 Tổng quan</a>
        <a class="nav-item" @click="$router.push('/admin/products')">📦 Sản phẩm</a>
        <a class="nav-item" @click="$router.push('/admin/categories')">🗂 Danh mục</a>
        <a class="nav-item active" @click="$router.push('/admin/orders')">🧾 Đơn hàng</a>
        <a class="nav-item" @click="$router.push('/admin/vouchers')">🎟 Voucher</a>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">{{ auth.user?.full_name?.[0] || 'A' }}</div>
          <div>
            <div class="admin-name">{{ auth.user?.full_name }}</div>
            <div class="admin-role">Quản trị viên</div>
          </div>
        </div>
        <a-button size="small" @click="logout">Đăng xuất</a-button>
      </div>
    </div>

    <!-- Main -->
    <div class="admin-main">
      <div class="admin-topbar">
        <h2>Quản lý đơn hàng</h2>
        <a-button @click="fetchOrders">🔄 Làm mới</a-button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card" v-for="s in statusStats" :key="s.key">
          <div class="stat-value" :style="{ color: s.color }">{{ s.count }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <a-radio-group v-model:value="filterStatus" button-style="solid" size="small">
          <a-radio-button value="">Tất cả</a-radio-button>
          <a-radio-button value="pending">Chờ xử lý</a-radio-button>
          <a-radio-button value="confirmed">Đã xác nhận</a-radio-button>
          <a-radio-button value="shipping">Đang giao</a-radio-button>
          <a-radio-button value="completed">Hoàn tất</a-radio-button>
          <a-radio-button value="cancelled">Đã hủy</a-radio-button>
        </a-radio-group>

        <a-input-search v-model:value="searchText" placeholder="Tìm tên khách / SĐT..." style="width: 240px"
          allow-clear />
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <a-table :dataSource="filteredOrders" :columns="columns" rowKey="id" :loading="loading"
          :pagination="{ pageSize: 10 }" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'id'">
              <span class="order-id">#{{ record.id.slice(0, 8) }}</span>
            </template>

            <template v-else-if="column.key === 'customer'">
              <div class="customer-cell">
                <div class="customer-name">{{ record.customerName }}</div>
                <div class="customer-phone">📞 {{ record.customerPhone }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'total'">
              <span class="total-text">{{ Number(record.totalAmount).toLocaleString() }}đ</span>
            </template>

            <template v-else-if="column.key === 'date'">
              <span class="date-text">{{ formatDate(record.createdAt) }}</span>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-select :value="record.status" style="width: 140px" size="small"
                @change="(val) => changeStatus(record.id, val)">
                <a-select-option value="pending">⏳ Chờ xử lý</a-select-option>
                <a-select-option value="confirmed">✅ Đã xác nhận</a-select-option>
                <a-select-option value="shipping">🚚 Đang giao</a-select-option>
                <a-select-option value="completed">🎉 Hoàn tất</a-select-option>
                <a-select-option value="cancelled">❌ Đã hủy</a-select-option>
              </a-select>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-button size="small" @click="viewDetail(record)">Chi tiết</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <a-modal v-model:open="detailVisible" title="Chi tiết đơn hàng" :footer="null" width="560px">
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Mã đơn</span>
            <span class="order-id">#{{ selectedOrder.id.slice(0, 8) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ngày đặt</span>
            <span>{{ formatDate(selectedOrder.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Khách hàng</span>
            <span>{{ selectedOrder.customerName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Điện thoại</span>
            <span>{{ selectedOrder.customerPhone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Địa chỉ</span>
            <span>{{ selectedOrder.customerAddress }}</span>
          </div>
        </div>

        <a-divider style="margin: 12px 0" />

        <div class="items-list">
          <div v-for="item in selectedOrder.items" :key="item.id" class="detail-item">
            <span class="di-name">{{ item.productName }}</span>
            <span class="di-qty">x{{ item.quantity }}</span>
            <span class="di-price">{{ Number(item.subtotal).toLocaleString() }}đ</span>
          </div>
        </div>

        <a-divider style="margin: 12px 0" />

        <div class="detail-total">
          <span>Tổng cộng</span>
          <span>{{ Number(selectedOrder.totalAmount).toLocaleString() }}đ</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import http from '../../api/axios';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const orders = ref([]);
const loading = ref(false);
const detailVisible = ref(false);
const selectedOrder = ref(null);
const filterStatus = ref('');
const searchText = ref('');

const columns = [
  { title: 'Mã đơn', key: 'id', width: 100 },
  { title: 'Khách hàng', key: 'customer', width: 180 },
  { title: 'Tổng tiền', key: 'total', width: 130 },
  { title: 'Ngày đặt', key: 'date', width: 130 },
  { title: 'Trạng thái', key: 'status', width: 160 },
  { title: '', key: 'action', width: 90 },
];

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: '#d48806' },
  confirmed: { label: 'Đã xác nhận', color: '#1677ff' },
  shipping: { label: 'Đang giao', color: '#13a8a8' },
  completed: { label: 'Hoàn tất', color: '#389e0d' },
  cancelled: { label: 'Đã hủy', color: '#cf1322' },
};

const statusStats = computed(() =>
  Object.entries(statusConfig).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    color: cfg.color,
    count: orders.value.filter(o => o.status === key).length,
  }))
);

const filteredOrders = computed(() =>
  orders.value.filter(o => {
    const matchStatus = !filterStatus.value || o.status === filterStatus.value;
    const q = searchText.value.toLowerCase();
    const matchSearch = !q ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q);
    return matchStatus && matchSearch;
  })
);

function formatDate(d) {
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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
    const order = orders.value.find(o => o.id === id);
    if (order) order.status = status;
    message.success('Đã cập nhật trạng thái');
  } catch {
    message.error('Cập nhật thất bại');
  }
}

async function viewDetail(record) {
  const { data } = await http.get(`/orders/${record.id}`);
  selectedOrder.value = data.data;
  detailVisible.value = true;
}

function logout() {
  auth.logout();
  router.push('/admin/login');
}

onMounted(fetchOrders);
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
}

.admin-sidebar {
  width: 220px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.sidebar-logo {
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
}

.nav-item {
  display: block;
  padding: 11px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ff424e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.admin-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.admin-main {
  flex: 1;
  margin-left: 220px;
  padding: 24px;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-topbar h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px 20px;
  border: 1px solid #f0f0f0;
  min-width: 110px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.filter-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.table-wrapper {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.order-id {
  font-family: monospace;
  font-weight: 600;
  color: #555;
}

.customer-name {
  font-weight: 500;
  font-size: 13px;
}

.customer-phone {
  font-size: 12px;
  color: #888;
}

.total-text {
  color: #ff424e;
  font-weight: 600;
}

.date-text {
  font-size: 12px;
  color: #666;
}

.order-detail {
  padding: 4px 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #888;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.di-name {
  flex: 1;
}

.di-qty {
  color: #999;
}

.di-price {
  font-weight: 600;
  min-width: 90px;
  text-align: right;
}

.detail-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: #ff424e;
}
</style>