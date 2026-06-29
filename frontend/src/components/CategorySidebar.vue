<template>
  <div class="sidebar">
    <div class="sidebar-title">Danh mục sản phẩm</div>
    <ul class="category-list">
      <li
        :class="{ active: selectedCategory === null }"
        @click="selectCategory(null)"
      >
        Tất cả sản phẩm
      </li>
      <li
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useProductStore } from '../stores/product.store';
import { storeToRefs } from 'pinia';

defineProps({ categories: Array });

const productStore = useProductStore();
const { selectedCategory } = storeToRefs(productStore);

function selectCategory(id) {
  productStore.setCategory(id);
}
</script>

<style scoped>
.sidebar {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
}
.sidebar-title {
  background: #ff424e;
  color: #fff;
  padding: 12px 16px;
  font-weight: 600;
}
.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.category-list li {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}
.category-list li:hover {
  background: #fff1f0;
  color: #ff424e;
}
.category-list li.active {
  background: #fff1f0;
  color: #ff424e;
  font-weight: 600;
  border-left: 3px solid #ff424e;
}
</style>