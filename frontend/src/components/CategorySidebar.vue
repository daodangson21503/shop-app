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
        <span class="cat-dot"></span>
        <span class="cat-name">Tất cả sản phẩm</span>
        <span class="cat-arrow">›</span>
      </li>
      <li
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: selectedCategory === cat.id }"
        @click="$router.push(`/products?category=${cat.id}`)"
      >
        <span class="cat-dot"></span>
        <span class="cat-name">{{ cat.name }}</span>
        <span class="cat-arrow">›</span>
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
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  background: linear-gradient(135deg, #ff424e, #ff7a45);
  color: #fff;
  padding: 18px;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.sidebar-title::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  right: -20px;
  top: -30px;
}

.title-icon {
  font-size: 17px;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 10px;
}

.category-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 14px;
  color: #444;
  transition: all 0.18s;
  margin-bottom: 3px;
  position: relative;
}

.cat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
  transition: all 0.18s;
}

.cat-name {
  flex: 1;
}

.cat-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s;
  color: #ff424e;
  font-weight: 700;
}

.category-list li:hover {
  background: #fff5f5;
  color: #ff424e;
  transform: translateX(2px);
}

.category-list li:hover .cat-dot {
  background: #ff424e;
  box-shadow: 0 0 0 4px rgba(255, 66, 78, 0.15);
}

.category-list li:hover .cat-arrow {
  opacity: 1;
  transform: translateX(0);
}

.category-list li.active {
  background: linear-gradient(135deg, #fff1f0, #fff5f0);
  color: #ff424e;
  font-weight: 700;
}

.category-list li.active .cat-dot {
  background: #ff424e;
  box-shadow: 0 0 0 4px rgba(255, 66, 78, 0.15);
}

.category-list li.active .cat-arrow {
  opacity: 1;
  transform: translateX(0);
}
</style>