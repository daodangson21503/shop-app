<template>
  <div>
    <AppHeader />
    <div class="orders-wrapper">
      <h1>Đơn hàng của tôi</h1>
      <p class="orders-subtitle">Theo dõi tình trạng đơn hàng của bạn</p>

      <a-spin :spinning="loading">
        <div v-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <p>Bạn chưa có đơn hàng nào</p>
          <a-button type="primary" @click="$router.push('/')">Mua sắm ngay</a-button>
        </div>

        <template v-else>
          <div class="filter-tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ active: activeStatus === tab.value }"
              @click="activeStatus = tab.value"
            >
              {{ tab.label }}
              <span class="tab-count">{{ countByStatus(tab.value) }}</span>
            </button>
          </div>

          <div v-if="filteredOrders.length === 0" class="empty-state small">
            <p>Không có đơn hàng nào ở trạng thái này</p>
          </div>

          <div v-else class="orders-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="order-header" @click="openDetail(order)">
                <div class="order-meta">
                  <span class="order-id">Đơn #{{ order.id.slice(0, 8) }}</span>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="status-badge" :class="`status-${order.status}`">
                  <span class="status-dot"></span>
                  {{ statusText(order.status) }}
                </div>
              </div>

              <div class="order-items" @click="openDetail(order)">
                <div v-for="item in order.items" :key="item.id" class="order-item">
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                  <span class="item-price">{{ Number(item.subtotal).toLocaleString() }}đ</span>
                </div>
              </div>

              <div class="order-footer">
                <span class="footer-label">
                  Tổng cộng <span class="item-count">({{ order.items.length }} sản phẩm)</span>
                </span>
                <span class="order-total">{{ Number(order.totalAmount).toLocaleString() }}đ</span>
              </div>

              <div class="order-actions">
                <a-button size="small" @click="openDetail(order)">Xem chi tiết</a-button>
                <a-button size="small" @click="reorder(order)">Mua lại</a-button>
                <a-button
                  v-if="order.status === 'pending'"
                  size="small"
                  danger
                  @click="confirmCancel(order)"
                >
                  Hủy đơn
                </a-button>
              </div>
            </div>
          </div>
        </template>
      </a-spin>
    </div>
    <AppFooter />

    <!-- Modal chi tiết đơn hàng -->
    <a-modal v-model:open="detailVisible" title="Chi tiết đơn hàng" :footer="null" width="560px">
      <div v-if="selectedOrder" class="modal-content">
        <div class="modal-status">
          <span class="status-badge" :class="`status-${selectedOrder.status}`">
            <span class="status-dot"></span>
            {{ statusText(selectedOrder.status) }}
          </span>
          <span class="modal-order-id">#{{ selectedOrder.id.slice(0, 8) }}</span>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">📍 Thông tin nhận hàng</div>
          <p><strong>{{ selectedOrder.customerName }}</strong> — {{ selectedOrder.customerPhone }}</p>
          <p class="address-text">{{ selectedOrder.customerAddress }}</p>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">🛒 Sản phẩm</div>
          <div v-for="item in selectedOrder.items" :key="item.id" class="modal-item">
            <span class="modal-item-name">{{ item.productName }} x{{ item.quantity }}</span>
            <span class="modal-item-price">{{ Number(item.subtotal).toLocaleString() }}đ</span>
          </div>
        </div>

        <a-divider style="margin: 12px 0" />

        <div class="modal-total-row">
          <span>Tổng cộng</span>
          <span class="modal-total">{{ Number(selectedOrder.totalAmount).toLocaleString() }}đ</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import http from '../api/axios';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();
const orders = ref([]);
const loading = ref(false);
const activeStatus = ref('all');
const detailVisible = ref(false);
const selectedOrder = ref(null);

const statusTabs = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') return orders.value;
  return orders.value.filter((o) => o.status === activeStatus.value);
});

function countByStatus(status) {
  if (status === 'all') return orders.value.length;
  return orders.value.filter((o) => o.status === status).length;
}

const statusText = (s) => ({
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', completed: 'Hoàn tất', cancelled: 'Đã hủy',
}[s] || s);

function formatDate(d) {
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function openDetail(order) {
  selectedOrder.value = order;
  detailVisible.value = true;
}

function reorder(order) {
  order.items.forEach((item) => {
    cart.addItem(
      { id: item.productId, name: item.productName, price: item.unitPrice, image_url: '' },
      item.quantity
    );
  });
  message.success('Đã thêm sản phẩm vào giỏ hàng');
  router.push('/cart');
}

function confirmCancel(order) {
  Modal.confirm({
    title: 'Xác nhận hủy đơn hàng?',
    content: `Đơn #${order.id.slice(0, 8)} sẽ bị hủy và không thể khôi phục.`,
    okText: 'Hủy đơn',
    okType: 'danger',
    cancelText: 'Đóng',
    onOk: async () => {
      try {
        await http.patch(`/orders/${order.id}/cancel`);
        message.success('Đã hủy đơn hàng');
        fetchOrders();
      } catch (err) {
        message.error(err.response?.data?.message || 'Hủy đơn thất bại');
      }
    },
  });
}

async function fetchOrders() {
  loading.value = true;
  try {
    const { data } = await http.get('/orders/my-orders');
    orders.value = data.data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login');
    return;
  }
  fetchOrders();
});
</script>

<style scoped>
.orders-wrapper {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 16px 60px;
  min-height: 60vh;
}
.orders-wrapper h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
}
.orders-subtitle {
  color: #888;
  margin-bottom: 24px;
  font-size: 14px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #eee;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.filter-tab:hover { border-color: #ffccc7; color: #ff424e; }
.filter-tab.active { background: #ff424e; border-color: #ff424e; color: #fff; }
.tab-count {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}
.filter-tab.active .tab-count { background: rgba(255, 255, 255, 0.25); }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.empty-state.small { padding: 30px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { margin-bottom: 16px; font-size: 15px; }

.orders-list { display: flex; flex-direction: column; gap: 16px; }
.order-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.order-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); }

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.order-meta { display: flex; flex-direction: column; gap: 2px; }
.order-id { font-weight: 600; font-size: 14px; }
.order-date { font-size: 12px; color: #999; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-pending { background: #fff7e6; color: #d48806; }
.status-pending .status-dot { background: #d48806; }
.status-confirmed { background: #e6f4ff; color: #1677ff; }
.status-confirmed .status-dot { background: #1677ff; }
.status-shipping { background: #e6fffb; color: #13a8a8; }
.status-shipping .status-dot { background: #13a8a8; }
.status-completed { background: #f6ffed; color: #389e0d; }
.status-completed .status-dot { background: #389e0d; }
.status-cancelled { background: #fff1f0; color: #cf1322; }
.status-cancelled .status-dot { background: #cf1322; }

.order-items { padding: 12px 18px; cursor: pointer; }
.order-item { display: flex; align-items: center; padding: 6px 0; font-size: 14px; }
.item-name { flex: 1; color: #333; }
.item-qty { color: #999; margin-right: 16px; font-size: 13px; }
.item-price { font-weight: 500; color: #555; min-width: 90px; text-align: right; }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-top: 1px solid #f0f0f0;
}
.footer-label { font-size: 14px; color: #666; }
.item-count { font-size: 12px; color: #aaa; }
.order-total { font-weight: 700; font-size: 18px; color: #ff424e; }

.order-actions {
  display: flex;
  gap: 8px;
  padding: 0 18px 16px;
}

.modal-content { padding-top: 4px; }
.modal-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.modal-order-id { font-size: 13px; color: #999; }
.modal-section { margin-bottom: 16px; }
.modal-section-title { font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #444; }
.address-text { color: #666; font-size: 13.5px; }
.modal-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13.5px;
}
.modal-item-name { color: #333; }
.modal-item-price { font-weight: 500; color: #555; }
.modal-total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 16px;
}
.modal-total { color: #ff424e; font-size: 19px; }
</style>