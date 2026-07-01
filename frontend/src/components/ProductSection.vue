<template>
  <div class="product-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <a-button type="link" class="see-more-btn" @click="$router.push(`/products?category=${categoryId}`)">
        Xem thêm <span class="arrow">›</span>
      </a-button>
    </div>

    <div class="scroll-wrapper">
      <div class="scroll-track">
        <div class="product-card" v-for="p in products" :key="p.id" @click="$router.push(`/products/${p.slug}`)">
          <div class="img-wrap">
            <img :src="p.imageUrl" :alt="p.name" class="product-img" />
            <button
              class="wishlist-btn"
              :class="{ active: wishlist.isWishlisted(p.id) }"
              @click.stop="toggleWishlist(p)"
            >
              {{ wishlist.isWishlisted(p.id) ? '❤️' : '🤍' }}
            </button>
          </div>
          <div class="card-body">
            <div class="product-name">{{ p.name }}</div>
            <div class="product-rating">
              <span class="stars">{{ renderStars(p.avgRating) }}</span>
              <span class="review-count">({{ p.reviewCount || 0 }})</span>
            </div>
            <div class="product-price">{{ Number(p.price).toLocaleString() }}đ</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { useWishlistStore } from '../stores/wishlist.store';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';

defineProps({
  title: String,
  products: Array,
  categoryId: Number,
});

const wishlist = useWishlistStore();
const auth = useAuthStore();
const router = useRouter();

function renderStars(avg) {
  const rounded = Math.round(avg || 0);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

async function toggleWishlist(product) {
  if (!auth.isLoggedIn) {
    message.warning('Vui lòng đăng nhập để dùng tính năng yêu thích');
    router.push('/login');
    return;
  }
  await wishlist.toggle(product);
  message.success(wishlist.isWishlisted(product.id) ? 'Đã thêm yêu thích' : 'Đã bỏ yêu thích');
}
</script>

<style scoped>
.product-section {
  margin-bottom: 36px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 19px;
  font-weight: 800;
  margin: 0;
  color: #222;
  position: relative;
  padding-left: 12px;
}

.section-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 4px;
  background: #ff424e;
  border-radius: 2px;
}

.see-more-btn {
  color: #ff424e;
  font-size: 13px;
  font-weight: 600;
  padding: 0;
}

.arrow {
  margin-left: 2px;
}

.scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #ffccc7 transparent;
  margin: 0 -4px;
  padding: 4px;
}

.scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.scroll-wrapper::-webkit-scrollbar-thumb {
  background: #ffccc7;
  border-radius: 4px;
}

.scroll-track {
  display: flex;
  gap: 16px;
}

.product-card {
  flex: 0 0 220px;
  width: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.09);
}

.card-body {
  padding: 12px;
}

.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f8f8f8;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-img {
  transform: scale(1.06);
}

.wishlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s;
}

.wishlist-btn:hover {
  transform: scale(1.1);
}

.product-name {
  font-size: 13.5px;
  font-weight: 500;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 6px;
  line-height: 1.4;
  color: #333;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.stars {
  color: #fadb14;
  font-size: 11px;
  letter-spacing: 1px;
}

.review-count {
  color: #999;
  font-size: 11px;
}

.product-price {
  color: #ff424e;
  font-weight: 800;
  font-size: 16px;
  margin-top: 2px;
}
</style>