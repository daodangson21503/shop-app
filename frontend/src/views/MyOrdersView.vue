<template>
  <div>
    <AppHeader />
    <div class="orders-wrapper">
      <h1>Đơn hàng của tôi</h1>

      <a-spin :spinning="loading">
        <a-empty v-if="orders.length === 0" description="Bạn chưa có đơn hàng nào" />

        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">Đơn #{{ order.id.slice(0, 8) }}...</span>
              <span class="order-date">
                {{ new Date(order.createdAt).toLocaleString('vi-VN') }}
              </span>
            </div>
            <a-tag :color="statusColor(order.status)">
              {{ statusText(order.status) }}
            </a-tag>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <span>{{ item.productName }} x{{ item.quantity }}</span>
              <span>{{ Number(item.subtotal).toLocaleString() }}đ</span>
            </div>
          </div>

          <div class="order-footer">
            <span>Tổng cộng:</span>
            <span class="order-total">{{ Number(order.totalAmount).toLocaleString() }}đ</span>
          </div>
        </div>
      </a-spin>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import http from '../api/axios';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const orders = ref([]);
const loading = ref(false);

const statusText = (s) => ({
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', completed: 'Hoàn tất', cancelled: 'Đã hủy',
}[s] || s);

const statusColor = (s) => ({
  pending: 'orange', confirmed: 'blue',
  shipping: 'cyan', completed: 'green', cancelled: 'red',
}[s] || 'default');

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login');
    return;
  }
  loading.value = true;
  try {
    const { data } = await http.get('/orders/my-orders');
    orders.value = data.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.orders-wrapper {
  max-width: 800px;
  margin: 32px auto;
  padding: 0 16px;
}
.order-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}
.order-id { font-weight: 600; margin-right: 12px; }
.order-date { color: #888; font-size: 13px; }
.order-items { padding: 12px 16px; }
.order-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  color: #555;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  font-weight: 600;
}
.order-total { color: #ff424e; font-size: 16px; }
</style>