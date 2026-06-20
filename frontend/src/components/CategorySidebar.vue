<template>
  <div class="sidebar">
    <div class="sidebar-title">Danh mục sản phẩm</div>
    <ul class="category-list">
      <li v-for="cat in categories" :key="cat.id" @click="$router.push(`/products?category=${cat.id}`)">
        {{ cat.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  categories: Array,
});
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
</style>