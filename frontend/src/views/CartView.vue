<template>
  <div>
    <AppHeader />
    <div class="cart-wrapper">
      <h1>Giỏ hàng</h1>

      <a-empty v-if="cart.items.length === 0" class="empty-state">
        <template #image>
          <div class="empty-icon">🛒</div>
        </template>
        <template #description>
          <p>Giỏ hàng của bạn đang trống</p>
          <a-button type="primary" @click="$router.push('/')">Tiếp tục mua sắm</a-button>
        </template>
      </a-empty>

      <a-row v-else :gutter="24">
        <a-col :span="16">
          <div class="cart-list">
            <div v-for="item in cart.items" :key="item.id" class="cart-item">
              <img :src="item.imageUrl || item.image_url" class="item-img" />
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price">{{ Number(item.price).toLocaleString() }}đ</div>
              </div>
              <div class="item-actions">
                <a-input-number
                  v-model:value="item.quantity"
                  :min="1"
                  :max="99"
                  size="small"
                  @change="cart.persist()"
                />
                <a-button
                  type="text"
                  danger
                  size="small"
                  @click="cart.removeItem(item.id)"
                >🗑</a-button>
              </div>
              <div class="item-subtotal">
                {{ (Number(item.price) * item.quantity).toLocaleString() }}đ
              </div>
            </div>
          </div>
        </a-col>

        <a-col :span="8">
          <div class="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="summary-row">
              <span>Tạm tính ({{ cart.count }} sản phẩm)</span>
              <span>{{ cart.total.toLocaleString() }}đ</span>
            </div>
            <div class="summary-row">
              <span>Phí vận chuyển</span>
              <span class="free-ship">Miễn phí</span>
            </div>
            <a-divider style="margin: 12px 0" />
            <div class="summary-total">
              <span>Tổng cộng</span>
              <span>{{ cart.total.toLocaleString() }}đ</span>
            </div>
            <a-button
              type="primary"
              size="large"
              block
              @click="$router.push('/checkout')"
              class="checkout-btn"
            >
              Tiến hành thanh toán →
            </a-button>
            <a-button block @click="$router.push('/')" style="margin-top: 8px">
              ← Tiếp tục mua sắm
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { useCartStore } from '../stores/cart.store';

const cart = useCartStore();
</script>

<style scoped>
.cart-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 60px;
  min-height: 60vh;
}
.cart-wrapper h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
}
.empty-state { padding: 60px 0; text-align: center; }
.empty-icon { font-size: 56px; margin-bottom: 12px; }

.cart-list {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}
.cart-item:last-child { border-bottom: none; }
.cart-item:hover { background: #fafafa; }

.item-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.item-info { flex: 1; min-width: 0; }
.item-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-price { color: #ff424e; font-weight: 600; font-size: 14px; }
.item-actions { display: flex; align-items: center; gap: 8px; }
.item-subtotal { font-weight: 700; font-size: 15px; min-width: 100px; text-align: right; }

.cart-summary {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 20px;
  position: sticky;
  top: 80px;
}
.cart-summary h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}
.free-ship { color: #52c41a; font-weight: 500; }
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #ff424e;
  margin-bottom: 16px;
}
.checkout-btn { height: 44px; font-weight: 600; border-radius: 8px; }
</style>