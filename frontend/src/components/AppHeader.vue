<template>
  <div class="header">
    <div class="header-top">
      <div class="logo" @click="goHome">🏠 ShopGiaDung</div>

      <a-input-search v-model:value="keyword" placeholder="Tìm kiếm sản phẩm..." class="search-box" @search="onSearch"
        @keyup.enter="onSearch" />

      <div class="header-actions">
        <!-- Nếu đã đăng nhập -->
        <template v-if="auth.isLoggedIn && !auth.isAdmin">
          <a-button @click="$router.push('/my-orders')" class="action-btn">
            📋 Đơn hàng
          </a-button>
          <a-button @click="logout" class="action-btn">Đăng xuất</a-button>
        </template>

        <!-- Nếu chưa đăng nhập -->
        <template v-else-if="!auth.isLoggedIn">
          <a-button @click="$router.push('/login')" class="action-btn">
            Đăng nhập
          </a-button>
        </template>
        
        <a-button v-if="auth.isLoggedIn && !auth.isAdmin" @click="$router.push('/wishlist')" style="margin-right: 8px">
          ❤️ Yêu thích
        </a-button>
        <a-badge :count="cart.count">
          <a-button class="cart-btn" @click="$router.push('/cart')">🛒 Giỏ hàng</a-button>
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
  router.push({ path: '/products', query: { search: keyword.value } });
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
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.logo {
  font-size: 21px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff424e, #ff7a45);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.85;
}

.search-box {
  flex: 1;
  max-width: 520px;
}

.search-box :deep(.ant-input-search-button) {
  background: #ff424e;
  border-color: #ff424e;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
}

.cart-btn {
  border-radius: 8px;
  font-weight: 500;
  background: #fff1f0;
  border-color: #ffccc7;
  color: #ff424e;
}
</style>