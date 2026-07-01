<template>
  <div>
    <AppHeader />

    <div class="detail-wrapper" v-if="product">
      <div class="breadcrumb">
        <a @click="$router.push('/')">Trang chủ</a>
        <span class="sep">/</span>
        <a v-if="product.category" @click="goCategory">{{ product.category.name }}</a>
        <span v-if="product.category" class="sep">/</span>
        <span>{{ product.name }}</span>
      </div>

      <div class="detail-card">
        <a-row :gutter="40">
          <a-col :span="10">
            <div class="img-wrap">
              <img :src="product.imageUrl" :alt="product.name" class="detail-img" />
            </div>
          </a-col>
          <a-col :span="14">
            <div class="title-row">
              <h1>{{ product.name }}</h1>
              <button class="fav-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
                {{ isFavorite ? '♥' : '♡' }}
              </button>
            </div>

            <div class="meta-row">
              <span class="rating">
                <span class="stars">★★★★★</span>
                <span class="review-count">(0 đánh giá)</span>
              </span>
              <span class="meta-sep">|</span>
              <span class="meta-id">Mã SP: SP{{ String(product.id).padStart(5, '0') }}</span>
            </div>

            <div class="price-box">
              <span class="price">{{ Number(product.price).toLocaleString() }}đ</span>
            </div>

            <div class="stock" :class="{ low: product.stock < 10 }">
              <span class="stock-dot"></span>
              Còn lại {{ product.stock }} sản phẩm
            </div>

            <div class="quantity-row">
              <span class="qty-label">Số lượng</span>
              <a-input-number v-model:value="quantity" :min="1" :max="product.stock" size="large" class="qty-input" />
            </div>

            <div class="actions">
              <a-button size="large" class="add-cart-btn" @click="addToCart">
                🛒 Thêm vào giỏ hàng
              </a-button>
              <a-button type="primary" size="large" class="buy-now-btn" @click="buyNow">
                Mua ngay
              </a-button>
            </div>

            <div class="info-boxes">
              <div class="info-box">
                <span class="info-icon">🚚</span>
                <div>
                  <div class="info-title">Giao hàng nhanh</div>
                  <div class="info-desc">2-3 ngày toàn quốc</div>
                </div>
              </div>
              <div class="info-box">
                <span class="info-icon">↩️</span>
                <div>
                  <div class="info-title">Đổi trả dễ dàng</div>
                  <div class="info-desc">Trong vòng 7 ngày</div>
                </div>
              </div>
              <div class="info-box">
                <span class="info-icon">✅</span>
                <div>
                  <div class="info-title">Hàng chính hãng</div>
                  <div class="info-desc">Cam kết 100%</div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <div class="tabs-section">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="description" tab="Mô tả sản phẩm">
              <p class="description">{{ product.description || 'Đang cập nhật mô tả sản phẩm.' }}</p>
            </a-tab-pane>
            <a-tab-pane key="specs" tab="Thông số kỹ thuật">
              <table class="specs-table">
                <tbody>
                  <tr>
                    <td>Danh mục</td>
                    <td>{{ product.category?.name || 'Đang cập nhật' }}</td>
                  </tr>
                  <tr>
                    <td>Tình trạng kho</td>
                    <td>{{ product.stock }} sản phẩm</td>
                  </tr>
                  <tr>
                    <td>Mã sản phẩm</td>
                    <td>SP{{ String(product.id).padStart(5, '0') }}</td>
                  </tr>
                  <tr>
                    <td>Xuất xứ</td>
                    <td>Đang cập nhật</td>
                  </tr>
                </tbody>
              </table>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <div class="related-section" v-if="relatedProducts.length">
        <ProductSection title="Sản phẩm liên quan" :products="relatedProducts" :categoryId="product.categoryId" />
      </div>
    </div>

    <a-spin v-else style="display: block; margin: 80px auto; width: fit-content" />
    <div class="reviews-section" v-if="product">
      <h2>Đánh giá sản phẩm</h2>

      <div class="rating-summary">
        <div class="avg-rating">{{ reviewData.avgRating || 0 }}</div>
        <div>
          <div class="stars-display">{{ '★'.repeat(Math.round(reviewData.avgRating)) }}{{ '☆'.repeat(5 -
            Math.round(reviewData.avgRating)) }}</div>
          <div class="review-count-text">{{ reviewData.count }} đánh giá</div>
        </div>
      </div>

      <!-- Form viết đánh giá -->
      <div class="review-form" v-if="auth.isLoggedIn">
        <h3>Viết đánh giá của bạn</h3>
        <a-rate v-model:value="newReview.rating" />
        <a-textarea v-model:value="newReview.comment" placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." :rows="3"
          style="margin-top: 12px" />
        <a-button type="primary" style="margin-top: 12px" @click="submitReview" :loading="submittingReview">
          Gửi đánh giá
        </a-button>
      </div>
      <div v-else class="login-prompt">
        <a @click="$router.push('/login')">Đăng nhập</a> để viết đánh giá
      </div>

      <!-- Danh sách đánh giá -->
      <div class="review-list">
        <a-empty v-if="reviewData.reviews.length === 0" description="Chưa có đánh giá nào" />
        <div v-for="r in reviewData.reviews" :key="r.id" class="review-item">
          <div class="review-header">
            <strong>{{ r.user.fullName }}</strong>
            <span class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
          </div>
          <div class="review-date">{{ new Date(r.createdAt).toLocaleDateString('vi-VN') }}</div>
          <p v-if="r.comment">{{ r.comment }}</p>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import ProductSection from '../components/ProductSection.vue';
import http from '../api/axios';
import { useCartStore } from '../stores/cart.store';
import { useProductStore } from '../stores/product.store';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const productStore = useProductStore();
const reviewData = ref({ reviews: [], avgRating: 0, count: 0 });
const newReview = ref({ rating: 5, comment: '' });
const submittingReview = ref(false);

const product = ref(null);
const quantity = ref(1);
const activeTab = ref('description');
const isFavorite = ref(false);

const relatedProducts = computed(() => {
  if (!product.value) return [];
  return productStore.products
    .filter((p) => p.categoryId === product.value.categoryId && p.id !== product.value.id)
    .slice(0, 4);
});

async function fetchProduct() {
  product.value = null;
  activeTab.value = 'description';
  const { data } = await http.get(`/products/${route.params.slug}`);
  product.value = data.data;
  await fetchReviews();

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  isFavorite.value = favorites.includes(product.value.id);

  if (productStore.products.length === 0) {
    productStore.fetchProducts();
  }
}

function toggleFavorite() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (isFavorite.value) {
    const updated = favorites.filter((id) => id !== product.value.id);
    localStorage.setItem('favorites', JSON.stringify(updated));
    isFavorite.value = false;
    message.info('Đã bỏ yêu thích');
  } else {
    favorites.push(product.value.id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    isFavorite.value = true;
    message.success('Đã thêm vào yêu thích');
  }
}

function goCategory() {
  productStore.setCategory(product.value.categoryId);
  router.push('/');
}

function addToCart() {
  cart.addItem(product.value, quantity.value);
  message.success('Đã thêm vào giỏ hàng');
}

function buyNow() {
  cart.addItem(product.value, quantity.value);
  router.push('/cart');
}

async function fetchReviews() {
  const { data } = await http.get(`/reviews/product/${product.value.id}`);
  reviewData.value = data.data;
}

async function submitReview() {
  if (newReview.value.rating < 1) {
    message.warning('Vui lòng chọn số sao đánh giá');
    return;
  }
  submittingReview.value = true;
  try {
    await http.post('/reviews', {
      product_id: product.value.id,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
    });
    message.success('Cảm ơn bạn đã đánh giá!');
    newReview.value = { rating: 5, comment: '' };
    await fetchReviews();
  } catch (err) {
    message.error(err.response?.data?.message || 'Có lỗi xảy ra');
  } finally {
    submittingReview.value = false;
  }
}

onMounted(fetchProduct);
watch(() => route.params.slug, fetchProduct);
</script>

<style scoped>
.detail-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 60px;
}

.breadcrumb {
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.breadcrumb a {
  color: #888;
  cursor: pointer;
}

.breadcrumb a:hover {
  color: #ff424e;
}

.sep {
  margin: 0 6px;
}

.detail-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.img-wrap {
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}

.fav-btn {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.fav-btn.active {
  color: #ff424e;
  border-color: #ffccc7;
  background: #fff1f0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #999;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #fadb14;
  font-size: 14px;
  letter-spacing: 1px;
}

.meta-sep {
  color: #ddd;
}

.price-box {
  background: #fff7f7;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 18px;
  display: inline-block;
}

.price {
  font-size: 30px;
  color: #ff424e;
  font-weight: 800;
}

.stock {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #389e0d;
  font-size: 14px;
  font-weight: 500;
}

.stock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #389e0d;
}

.stock.low {
  color: #d48806;
}

.stock.low .stock-dot {
  background: #d48806;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.qty-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.qty-input {
  width: 120px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.add-cart-btn {
  border-radius: 8px;
  font-weight: 600;
  border-color: #ff424e;
  color: #ff424e;
  flex: 1;
}

.buy-now-btn {
  border-radius: 8px;
  font-weight: 600;
  flex: 1;
}

.info-boxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 18px;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 20px;
}

.info-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #333;
}

.info-desc {
  font-size: 12px;
  color: #999;
}

.tabs-section {
  margin-top: 32px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.description {
  color: #555;
  line-height: 1.8;
  font-size: 14px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
}

.specs-table td:first-child {
  width: 200px;
  color: #888;
  background: #fafafa;
  font-weight: 500;
}

.specs-table td:last-child {
  color: #333;
}

.related-section {
  margin-top: 40px;
}

.reviews-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 16px;
}
.reviews-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}
.rating-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
}
.avg-rating {
  font-size: 36px;
  font-weight: 800;
  color: #ff424e;
}
.stars-display {
  color: #fadb14;
  font-size: 18px;
}
.review-count-text {
  color: #888;
  font-size: 13px;
}
.review-form {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
.review-form h3 {
  font-size: 15px;
  margin-bottom: 12px;
}
.login-prompt {
  margin-bottom: 24px;
  color: #888;
}
.login-prompt a {
  color: #ff424e;
  cursor: pointer;
}
.review-item {
  border-bottom: 1px solid #eee;
  padding: 16px 0;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.review-stars {
  color: #fadb14;
  font-size: 13px;
}
.review-date {
  color: #999;
  font-size: 12px;
  margin: 4px 0 8px;
}
</style>