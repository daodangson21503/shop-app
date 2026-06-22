<template>
  <div class="product-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <a-button type="link">Xem thêm ⋙</a-button>
    </div>
    <a-row :gutter="16">
      <a-col :span="6" v-for="p in products" :key="p.id">
        <a-card hoverable class="product-card" @click="$router.push(`/products/${p.slug}`)">
          <template #cover>
            <img :src="p.imageUrl" :alt="p.name" class="product-img" />
          </template>
          <div class="product-name">{{ p.name }}</div>
          <div class="product-rating">★★★★★ <span class="review-count">({{ p.review_count || 0 }} đánh giá)</span></div>
          <div class="product-price">{{ Number(p.price).toLocaleString() }}đ</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  products: Array,
});
</script>

<style scoped>
.product-section {
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ff424e;
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #222;
}
.product-card {
  margin-bottom: 16px;
}
.product-img {
  height: 140px;
  object-fit: cover;
  width: 100%;
}
.product-name {
  font-size: 14px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
  line-height: 1.4;
}
.product-rating {
  color: #fadb14;
  font-size: 12px;
}
.review-count {
  color: #888;
}
.product-price {
  color: #ff424e;
  font-weight: 700;
  font-size: 15px;
  margin-top: 4px;
}
</style>