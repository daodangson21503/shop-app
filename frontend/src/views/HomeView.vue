<template>
  <div>
    <AppHeader />

    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-tag">🔥 Ưu đãi mỗi ngày</div>
        <h1 class="hero-title">
          Thế giới <span class="highlight">đồ gia dụng</span><br />
          cho căn bếp hiện đại
        </h1>
        <p class="hero-subtitle">
          Hàng ngàn sản phẩm chất lượng — giao nhanh, giá tốt mỗi ngày
        </p>
        <a-button type="primary" size="large" class="hero-cta" @click="goShopping">
          Khám phá ngay →
        </a-button>
      </div>
      <div class="hero-decor">
        <div class="decor-circle circle-1"></div>
        <div class="decor-circle circle-2"></div>
        <div class="decor-circle circle-3"></div>
        <div class="hero-icon icon-1">🍳</div>
        <div class="hero-icon icon-2">🔪</div>
        <div class="hero-icon icon-3">🧺</div>
        <div class="hero-icon icon-4">☕</div>
      </div>
    </div>

    <div class="service-strip">
      <div class="service-item">
        <span class="service-icon">🚚</span>
        <div>
          <div class="service-title">Miễn phí vận chuyển</div>
          <div class="service-desc">Cho đơn hàng từ 300.000đ</div>
        </div>
      </div>
      <div class="service-item">
        <span class="service-icon">↩️</span>
        <div>
          <div class="service-title">Đổi trả dễ dàng</div>
          <div class="service-desc">Trong vòng 7 ngày</div>
        </div>
      </div>
      <div class="service-item">
        <span class="service-icon">🛡️</span>
        <div>
          <div class="service-title">Bảo hành chính hãng</div>
          <div class="service-desc">Cam kết 100% hàng thật</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="sidebar-col">
        <CategorySidebar :categories="categoryStore.categories" />

        <div class="promo-banner">
          <div class="promo-icon">🎁</div>
          <div class="promo-title">Ưu đãi thành viên</div>
          <div class="promo-text">Giảm thêm 10% cho đơn đầu tiên</div>
          <a-button size="small" class="promo-btn" @click="$router.push('/register')">
            Đăng ký ngay
          </a-button>
        </div>
      </div>

      <div class="content-col">
        <!-- Đang tìm kiếm -->
        <template v-if="productStore.keyword">
          <div class="search-result-title">
            Kết quả tìm kiếm: "<strong>{{ productStore.keyword }}</strong>"
            ({{ productStore.filteredProducts.length }} sản phẩm)
          </div>
          <a-empty v-if="productStore.filteredProducts.length === 0" description="Không tìm thấy sản phẩm nào" />
          <ProductSection v-else title="" :products="productStore.filteredProducts" />
        </template>

        <!-- Đang lọc theo danh mục -->
        <template v-else-if="productStore.selectedCategory">
          <ProductSection :title="selectedCategoryName" :products="productStore.filteredProducts" />
        </template>

        <!-- Tất cả sản phẩm theo danh mục -->
        <template v-else>
          <ProductSection v-for="cat in categoryStore.categories" :key="cat.id" :title="cat.name" :categoryId="cat.id"
            :products="productsByCategory(cat.id)" />
        </template>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import CategorySidebar from '../components/CategorySidebar.vue';
import ProductSection from '../components/ProductSection.vue';
import { useProductStore } from '../stores/product.store';
import { useCategoryStore } from '../stores/category.store';

const productStore = useProductStore();
const categoryStore = useCategoryStore();

function productsByCategory(categoryId) {
  return productStore.products.filter((p) => p.categoryId === categoryId);
}

const selectedCategoryName = computed(() => {
  const cat = categoryStore.categories.find(
    (c) => c.id === productStore.selectedCategory
  );
  return cat ? cat.name : '';
});

function goShopping() {
  document.querySelector('.content-col')?.scrollIntoView({ behavior: 'smooth' });
}

onMounted(() => {
  productStore.fetchProducts();
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.hero-banner {
  max-width: 1280px;
  margin: 16px auto 0;
  padding: 0 16px;
  position: relative;
}

.hero-content {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #ff424e 0%, #ff7a45 100%);
  border-radius: 20px;
  padding: 56px 64px;
  overflow: hidden;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  width: fit-content;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  margin: 0 0 12px;
}

.hero-title .highlight {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.5);
  text-underline-offset: 6px;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px;
  max-width: 420px;
}

.hero-cta {
  width: fit-content;
  height: 46px;
  padding: 0 28px;
  font-weight: 700;
  font-size: 15px;
  border-radius: 24px;
  background: #fff;
  color: #ff424e;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.hero-cta:hover {
  background: #fff !important;
  color: #ff424e !important;
  transform: translateY(-2px);
}

.hero-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  border-radius: 20px;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.circle-1 {
  width: 280px;
  height: 280px;
  right: -60px;
  top: -100px;
}

.circle-2 {
  width: 180px;
  height: 180px;
  right: 120px;
  bottom: -80px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  right: 380px;
  top: 20px;
}

.hero-icon {
  position: absolute;
  font-size: 42px;
  opacity: 0.85;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.icon-1 {
  right: 80px;
  top: 36px;
}

.icon-2 {
  right: 220px;
  bottom: 30px;
  font-size: 34px;
}

.icon-3 {
  right: 40px;
  bottom: 24px;
  font-size: 36px;
}

.icon-4 {
  right: 320px;
  top: 100px;
  font-size: 30px;
}

@media (max-width: 768px) {
  .hero-content {
    padding: 36px 24px;
  }
  .hero-title {
    font-size: 26px;
  }
  .hero-decor {
    display: none;
  }
}

.service-strip {
  max-width: 1280px;
  margin: 16px auto 0;
  padding: 0 16px;
  display: flex;
  gap: 16px;
  background: #fff;
}

.service-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 14px 18px;
}

.service-icon {
  font-size: 26px;
  width: 44px;
  height: 44px;
  background: #fff5f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #333;
}

.service-desc {
  font-size: 11.5px;
  color: #999;
  margin-top: 1px;
}

@media (max-width: 768px) {
  .service-strip {
    flex-direction: column;
  }
}

.main-content {
  max-width: 1200px;
  margin: 24px auto;
  display: flex;
  gap: 20px;
  padding: 0 16px;
}

.sidebar-col {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.promo-banner {
  background: linear-gradient(160deg, #ff7a45 0%, #ff424e 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.promo-banner::after {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  right: -30px;
  bottom: -40px;
}

.promo-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.promo-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.promo-text {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 14px;
}

.promo-btn {
  background: #fff;
  color: #ff424e;
  border: none;
  border-radius: 18px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.content-col {
  flex: 1;
}

.search-result-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff424e;
}
</style>