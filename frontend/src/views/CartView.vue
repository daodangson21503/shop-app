<template>
  <div>
    <AppHeader />

    <div class="cart-wrapper">
      <h1>Giỏ hàng của bạn</h1>

      <a-empty v-if="cart.items.length === 0" description="Giỏ hàng đang trống" />

      <div v-else>
        <a-table :dataSource="cart.items" :columns="columns" rowKey="id" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'product'">
              <div class="product-cell">
                <img :src="record.image_url" class="cell-img" />
                <span>{{ record.name }}</span>
              </div>
            </template>
            <template v-else-if="column.key === 'price'">
              {{ Number(record.price).toLocaleString() }}đ
            </template>
            <template v-else-if="column.key === 'quantity'">
              <a-input-number
                v-model:value="record.quantity"
                :min="1"
                @change="cart.persist()"
              />
            </template>
            <template v-else-if="column.key === 'subtotal'">
              {{ (record.price * record.quantity).toLocaleString() }}đ
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button danger @click="cart.removeItem(record.id)">Xóa</a-button>
            </template>
          </template>
        </a-table>

        <div class="cart-summary">
          <div class="total">Tổng cộng: <span>{{ cart.total.toLocaleString() }}đ</span></div>
          <a-button type="primary" size="large" @click="checkout">Tiến hành thanh toán</a-button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { useCartStore } from '../stores/cart.store';

const cart = useCartStore();
const router = useRouter();

const columns = [
  { title: 'Sản phẩm', key: 'product' },
  { title: 'Giá', key: 'price' },
  { title: 'Số lượng', key: 'quantity' },
  { title: 'Tạm tính', key: 'subtotal' },
  { title: '', key: 'action' },
];

function checkout() {
  router.push('/checkout');
}
</script>

<style scoped>
.cart-wrapper {
  max-width: 1000px;
  margin: 32px auto;
  padding: 0 16px;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cell-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
.cart-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
}
.total {
  font-size: 18px;
}
.total span {
  color: #ff424e;
  font-weight: 700;
  font-size: 22px;
}
</style>