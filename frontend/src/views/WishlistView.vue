<template>
  <div>
    <AppHeader />
    <div class="wishlist-wrapper">
      <h1>Sản phẩm yêu thích</h1>
      <a-empty v-if="wishlist.items.length === 0" description="Chưa có sản phẩm yêu thích nào" />
      <a-row :gutter="16" v-else>
        <a-col :span="6" v-for="item in wishlist.items" :key="item.id">
          <a-card hoverable @click="$router.push(`/products/${item.product.slug}`)">
            <template #cover>
              <img :src="item.product.imageUrl" :alt="item.product.name" style="height:140px;object-fit:cover" />
            </template>
            <div>{{ item.product.name }}</div>
            <div style="color:#ff424e;font-weight:700">{{ Number(item.product.price).toLocaleString() }}đ</div>
            <a-button danger size="small" style="margin-top:8px" @click.stop="remove(item.product)">
              Xóa khỏi yêu thích
            </a-button>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { useWishlistStore } from '../stores/wishlist.store';

const wishlist = useWishlistStore();

async function remove(product) {
  await wishlist.toggle(product);
}

onMounted(() => wishlist.fetch());
</script>

<style scoped>
.wishlist-wrapper {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 16px;
}
</style>