<template>
  <div style="padding: 24px">
    <h1>Danh sách sản phẩm</h1>
    <a-spin :spinning="store.loading">
      <a-row :gutter="16">
        <a-col :span="6" v-for="p in store.products" :key="p.id">
          <a-card hoverable style="margin-bottom: 16px">
            <template #cover>
              <img :src="p.image_url" :alt="p.name" style="height: 180px; object-fit: cover" />
            </template>
            <a-card-meta :title="p.name" :description="`${Number(p.price).toLocaleString()}đ`" />
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '../stores/product.store';

const store = useProductStore();
onMounted(() => store.fetchProducts());
</script>