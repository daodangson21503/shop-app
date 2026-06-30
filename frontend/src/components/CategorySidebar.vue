<template>
  <div class="sidebar">
    <div class="sidebar-title">
      <span class="title-icon">📂</span> Danh mục sản phẩm
    </div>
    <ul class="category-list">
      <li
        :class="{ active: selectedCategory === null }"
        @click="selectCategory(null)"
      >
        <span class="cat-dot"></span> Tất cả sản phẩm
      </li>
      <li
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: selectedCategory === cat.id }"
        @click="$router.push(`/products?category=${cat.id}`)"
      >
        <span class="cat-dot"></span> {{ cat.name }}
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
  border-radius: 14px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.sidebar-title {
  background: linear-gradient(135deg, #ff424e, #ff6b6b);
  color: #fff;
  padding: 16px 18px;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.category-list {
  list-style: none;
  margin: 0;
  padding: 8px;
}
.category-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  color: #444;
  transition: all 0.15s;
  margin-bottom: 2px;
}
.cat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
  transition: background 0.15s;
}
.category-list li:hover {
  background: #fff5f5;
  color: #ff424e;
}
.category-list li:hover .cat-dot {
  background: #ff424e;
}
.category-list li.active {
  background: #fff1f0;
  color: #ff424e;
  font-weight: 600;
}
.category-list li.active .cat-dot {
  background: #ff424e;
}
</style>