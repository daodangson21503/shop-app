<template>
  <div class="header">
    <div class="header-top">
      <div class="logo" @click="$router.push('/')">🏠 ShopGiaDung</div>

      <a-input-search
        v-model:value="keyword"
        placeholder="Tìm kiếm sản phẩm..."
        class="search-box"
        @search="onSearch"
      />

      <div class="header-actions">
        <a-badge :count="cart.count">
          <a-button @click="$router.push('/cart')">
            🛒 Giỏ hàng
          </a-button>
        </a-badge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.store';

const router = useRouter();
const cart = useCartStore();
const keyword = ref('');

function onSearch() {
  router.push({ path: '/products', query: { search: keyword.value } });
}
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-top {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #ff424e;
  cursor: pointer;
  white-space: nowrap;
}
.search-box {
  flex: 1;
  max-width: 500px;
}
.header-actions {
  margin-left: auto;
}
</style>