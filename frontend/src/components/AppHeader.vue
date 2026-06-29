<template>
  <div class="header">
    <div class="header-top">
      <div class="logo" @click="goHome">🏠 ShopGiaDung</div>

      <a-input-search v-model:value="keyword" placeholder="Tìm kiếm sản phẩm..." class="search-box" @search="onSearch"
        @keyup.enter="onSearch" />

      <div class="header-actions">
        <!-- Nếu đã đăng nhập -->
        <template v-if="auth.isLoggedIn && !auth.isAdmin">
          <a-button @click="$router.push('/my-orders')" style="margin-right: 8px">
            📋 Đơn hàng
          </a-button>
          <a-button @click="logout" style="margin-right: 8px">Đăng xuất</a-button>
        </template>

        <!-- Nếu chưa đăng nhập -->
        <template v-else-if="!auth.isLoggedIn">
          <a-button @click="$router.push('/login')" style="margin-right: 8px">
            Đăng nhập
          </a-button>
        </template>

        <a-badge :count="cart.count">
          <a-button @click="$router.push('/cart')">🛒 Giỏ hàng</a-button>
        </a-badge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.store';
import { useProductStore } from '../stores/product.store';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const cart = useCartStore();
const productStore = useProductStore();
const keyword = ref('');
const auth = useAuthStore();

function onSearch() {
  productStore.setCategory(null);
  productStore.setKeyword(keyword.value);
  router.push('/');
}

function goHome() {
  keyword.value = '';
  productStore.setCategory(null);
  productStore.setKeyword('');
  router.push('/');
}

function logout() {
  auth.logout();
  router.push('/');
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