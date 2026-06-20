<template>
  <div>
    <AppHeader />

    <div class="checkout-wrapper">
      <h1>Thanh toán</h1>

      <a-row :gutter="32">
        <a-col :span="14">
          <a-form layout="vertical" :model="form">
            <a-form-item label="Họ và tên" required>
              <a-input v-model:value="form.customer_name" placeholder="Nhập họ tên" />
            </a-form-item>
            <a-form-item label="Số điện thoại" required>
              <a-input v-model:value="form.customer_phone" placeholder="Nhập số điện thoại" />
            </a-form-item>
            <a-form-item label="Địa chỉ nhận hàng" required>
              <a-textarea v-model:value="form.customer_address" :rows="3" placeholder="Nhập địa chỉ" />
            </a-form-item>
          </a-form>
        </a-col>

        <a-col :span="10">
          <div class="order-summary">
            <h3>Đơn hàng của bạn</h3>
            <div v-for="item in cart.items" :key="item.id" class="summary-item">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ (item.price * item.quantity).toLocaleString() }}đ</span>
            </div>
            <a-divider />
            <div class="summary-total">
              <span>Tổng cộng</span>
              <span class="total-amount">{{ cart.total.toLocaleString() }}đ</span>
            </div>
            <a-button
              type="primary"
              size="large"
              block
              :loading="submitting"
              @click="submitOrder"
            >
              Đặt hàng
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { useCartStore } from '../stores/cart.store';
import http from '../api/axios';

const cart = useCartStore();
const router = useRouter();
const submitting = ref(false);

const form = ref({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
});

async function submitOrder() {
  if (!form.value.customer_name || !form.value.customer_phone || !form.value.customer_address) {
    message.warning('Vui lòng điền đầy đủ thông tin');
    return;
  }
  if (cart.items.length === 0) {
    message.warning('Giỏ hàng đang trống');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      ...form.value,
      items: cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };
    const { data } = await http.post('/orders', payload);
    message.success('Đặt hàng thành công!');
    cart.items = [];
    cart.persist();
    router.push('/');
  } catch (err) {
    message.error(err.response?.data?.message || 'Đặt hàng thất bại');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.checkout-wrapper {
  max-width: 1000px;
  margin: 32px auto;
  padding: 0 16px;
}
.order-summary {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.total-amount {
  color: #ff424e;
  font-size: 20px;
}
</style>