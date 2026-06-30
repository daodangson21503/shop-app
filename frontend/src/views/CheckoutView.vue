<template>
  <div>
    <AppHeader />
    <div class="checkout-wrapper">
      <h1>Thanh toán</h1>

      <a-row :gutter="24">
        <a-col :span="14">
          <div class="checkout-section">
            <h3 class="section-title">📍 Thông tin giao hàng</h3>
            <a-form layout="vertical">
              <a-form-item label="Họ và tên">
                <a-input
                  v-model:value="form.customer_name"
                  size="large"
                  placeholder="Nguyễn Văn A"
                />
              </a-form-item>
              <a-form-item label="Số điện thoại">
                <a-input
                  v-model:value="form.customer_phone"
                  size="large"
                  placeholder="0912 345 678"
                />
              </a-form-item>
              <a-form-item label="Địa chỉ nhận hàng">
                <a-textarea
                  v-model:value="form.customer_address"
                  :rows="3"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </a-form-item>
            </a-form>
          </div>

          <div class="checkout-section">
            <h3 class="section-title">💳 Phương thức thanh toán</h3>
            <div class="payment-option active">
              <span>💵</span>
              <div>
                <div class="payment-name">Thanh toán khi nhận hàng (COD)</div>
                <div class="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</div>
              </div>
            </div>
          </div>
        </a-col>

        <a-col :span="10">
          <div class="order-summary">
            <h3>🛍 Đơn hàng của bạn</h3>

            <div class="summary-items">
              <div v-for="item in cart.items" :key="item.id" class="summary-item">
                <div class="si-info">
                  <span class="si-qty">{{ item.quantity }}×</span>
                  <span class="si-name">{{ item.name }}</span>
                </div>
                <span class="si-price">
                  {{ (Number(item.price) * item.quantity).toLocaleString() }}đ
                </span>
              </div>
            </div>

            <a-divider style="margin: 12px 0" />

            <div class="summary-row">
              <span>Tạm tính</span>
              <span>{{ cart.total.toLocaleString() }}đ</span>
            </div>
            <div class="summary-row">
              <span>Vận chuyển</span>
              <span class="free">Miễn phí</span>
            </div>
            <div class="summary-total">
              <span>Tổng cộng</span>
              <span>{{ cart.total.toLocaleString() }}đ</span>
            </div>

            <a-button
              type="primary"
              size="large"
              block
              :loading="submitting"
              @click="submitOrder"
              class="place-order-btn"
            >
              Đặt hàng ngay
            </a-button>

            <p class="secure-note">🔒 Thông tin của bạn được bảo mật an toàn</p>
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
const form = ref({ customer_name: '', customer_phone: '', customer_address: '' });

async function submitOrder() {
  if (!form.value.customer_name || !form.value.customer_phone || !form.value.customer_address) {
    message.warning('Vui lòng điền đầy đủ thông tin giao hàng');
    return;
  }
  if (cart.items.length === 0) {
    message.warning('Giỏ hàng đang trống');
    return;
  }
  submitting.value = true;
  try {
    await http.post('/orders', {
      ...form.value,
      items: cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    });
    message.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng 🎉');
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 60px;
}
.checkout-wrapper h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
}
.checkout-section {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 20px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
}
.payment-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 22px;
}
.payment-option.active { border-color: #ff424e; background: #fff5f5; }
.payment-name { font-weight: 600; font-size: 14px; }
.payment-desc { font-size: 12px; color: #888; margin-top: 2px; }

.order-summary {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 20px;
  position: sticky;
  top: 80px;
}
.order-summary h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
.summary-items { display: flex; flex-direction: column; gap: 8px; }
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}
.si-info { display: flex; gap: 6px; flex: 1; }
.si-qty { color: #999; flex-shrink: 0; }
.si-name { color: #333; }
.si-price { font-weight: 500; flex-shrink: 0; }
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.free { color: #52c41a; font-weight: 500; }
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #ff424e;
  margin: 12px 0 16px;
}
.place-order-btn { height: 44px; font-weight: 600; border-radius: 8px; }
.secure-note {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  margin-bottom: 0;
}
</style>