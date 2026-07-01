<template>
  <div class="header-wrapper">
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="top-bar-left">
          <span>📞 Hotline: 0789018729 </span>
          <span class="divider">|</span>
          <span>✉️ support@shopgiadung.vn</span>
        </div>
        <div class="top-bar-right">
          <span>🚚 Miễn phí vận chuyển đơn từ 300.000đ</span>
        </div>
      </div>
    </div>

    <div class="header">
      <div class="header-top">
        <div class="logo" @click="goHome">🏠 ShopGiaDung</div>

        <a-input-search v-model:value="keyword" placeholder="Tìm kiếm sản phẩm..." class="search-box" @search="onSearch"
          @keyup.enter="onSearch" />

        <div class="header-actions">
          <!-- Nếu đã đăng nhập -->
          <template v-if="auth.isLoggedIn && !auth.isAdmin">
            <a-dropdown placement="bottomRight">
              <a-button class="user-btn">
                <span class="user-avatar">{{ userInitial }}</span>
                <span class="user-name">{{ auth.user?.fullName || 'Tài khoản' }}</span>
                <span class="dropdown-arrow">▾</span>
              </a-button>
              <template #overlay>
                <a-menu class="user-menu">
                  <a-menu-item disabled class="user-email-item">
                    <div class="menu-greeting">Xin chào,</div>
                    <div class="menu-email">{{ auth.user?.email }}</div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="$router.push('/my-orders')">
                    📋 Đơn hàng của tôi
                  </a-menu-item>
                  <a-menu-item @click="$router.push('/wishlist')">
                    ❤️ Sản phẩm yêu thích
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="logout" danger>
                    🚪 Đăng xuất
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>

          <!-- Nếu chưa đăng nhập -->
          <template v-else-if="!auth.isLoggedIn">
            <a-button @click="$router.push('/login')" class="action-btn">
              Đăng nhập
            </a-button>
            <a-button type="primary" @click="$router.push('/register')" class="action-btn register-btn">
              Đăng ký
            </a-button>
          </template>

          <a-badge :count="cart.count">
            <button class="cart-btn" @click="$router.push('/cart')">
              <span class="cart-icon">🛒</span>
              <span>Giỏ hàng</span>
            </button>
          </a-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.store';
import { useProductStore } from '../stores/product.store';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const cart = useCartStore();
const productStore = useProductStore();
const keyword = ref('');
const auth = useAuthStore();

const userInitial = computed(() => {
  const name = auth.user?.fullName || auth.user?.email || 'U';
  return name.charAt(0).toUpperCase();
});

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
.header-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar {
  background: #1a1a2e;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
}

.top-bar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-bar .divider {
  color: rgba(255, 255, 255, 0.3);
}

.top-bar-right {
  color: rgba(255, 255, 255, 0.7);
}

.header {
  background: #fff;
  padding: 14px 24px;
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
  font-size: 22px;
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

.search-box :deep(.ant-input-affix-wrapper),
.search-box :deep(.ant-input) {
  border-radius: 20px 0 0 20px;
}

.search-box :deep(.ant-input-search-button) {
  border-radius: 0 20px 20px 0 !important;
  background: #ff424e;
  border-color: #ff424e;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  border-radius: 20px;
  font-weight: 500;
  height: 38px;
  padding: 0 18px;
}

.register-btn {
  background: #ff424e;
  border-color: #ff424e;
  box-shadow: 0 2px 8px rgba(255, 66, 78, 0.3);
}

.user-btn {
  border-radius: 20px;
  font-weight: 500;
  height: 38px;
  padding: 0 14px 0 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #f0f0f0;
  background: #fafafa;
  transition: all 0.2s;
}

.user-btn:hover {
  border-color: #ffccc7;
  background: #fff5f5;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff424e, #ff7a45);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-size: 13.5px;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #999;
}

.user-menu {
  border-radius: 12px;
  overflow: hidden;
  min-width: 220px;
  padding: 6px 0;
}

.user-email-item {
  cursor: default;
  padding: 10px 16px 8px;
}

.menu-greeting {
  font-size: 11px;
  color: #999;
}

.menu-email {
  font-size: 13.5px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  height: 38px;
  padding: 0 20px;
  background: linear-gradient(135deg, #ff424e, #ff5c5c);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(255, 66, 78, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}

.cart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(255, 66, 78, 0.45);
}

.cart-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .top-bar-right {
    display: none;
  }
}
</style>