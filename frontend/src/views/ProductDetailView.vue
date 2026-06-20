<template>
  <div>
    <AppHeader />

    <div class="detail-wrapper" v-if="product">
      <a-row :gutter="32">
        <a-col :span="10">
          <img :src="product.image_url" :alt="product.name" class="detail-img" />
        </a-col>
        <a-col :span="14">
          <h1>{{ product.name }}</h1>
          <div class="rating">★★★★★ <span>(0 đánh giá)</span></div>
          <div class="price">{{ Number(product.price).toLocaleString() }}đ</div>
          <p class="description">{{ product.description }}</p>
          <div class="stock">Còn lại: {{ product.stock }} sản phẩm</div>

          <a-input-number
            v-model:value="quantity"
            :min="1"
            :max="product.stock"
            style="width: 120px; margin-bottom: 16px"
          />

          <div class="actions">
            <a-button type="primary" size="large" @click="addToCart">
              🛒 Thêm vào giỏ hàng
            </a-button>
            <a-button size="large" @click="buyNow">
              Mua ngay
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>

    <a-spin v-else style="display: block; margin: 60px auto; width: fit-content" />

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import http from '../api/axios';
import { useCartStore } from '../stores/cart.store';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const product = ref(null);
const quantity = ref(1);

async function fetchProduct() {
  product.value = null;
  const { data } = await http.get(`/products/${route.params.slug}`);
  product.value = data.data;
}

function addToCart() {
  cart.addItem(product.value, quantity.value);
  message.success('Đã thêm vào giỏ hàng');
}

function buyNow() {
  cart.addItem(product.value, quantity.value);
  router.push('/cart');
}

onMounted(fetchProduct);
watch(() => route.params.slug, fetchProduct);
</script>

<style scoped>
.detail-wrapper {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 16px;
}
.detail-img {
  width: 100%;
  border-radius: 8px;
}
.rating {
  color: #fadb14;
  margin-bottom: 8px;
}
.rating span {
  color: #888;
  font-size: 13px;
}
.price {
  font-size: 28px;
  color: #ff424e;
  font-weight: 700;
  margin-bottom: 16px;
}
.description {
  color: #555;
  margin-bottom: 16px;
  line-height: 1.6;
}
.stock {
  margin-bottom: 16px;
  color: #555;
}
.actions {
  display: flex;
  gap: 12px;
}
</style>