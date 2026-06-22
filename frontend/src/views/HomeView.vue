<template>
  <div>
    <AppHeader />

    <div class="banner">
      <img src="https://placehold.co/1200x300?text=Banner+Khuyen+Mai" alt="banner" />
    </div>

    <div class="main-content">
      <div class="sidebar-col">
        <CategorySidebar :categories="categoryStore.categories" />
      </div>

      <div class="content-col">
        <ProductSection
          v-for="cat in categoryStore.categories"
          :key="cat.id"
          :title="cat.name"
          :products="productsByCategory(cat.id)"
        />
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import CategorySidebar from '../components/CategorySidebar.vue';
import ProductSection from '../components/ProductSection.vue';
import { useProductStore } from '../stores/product.store';
import { useCategoryStore } from '../stores/category.store';

const productStore = useProductStore();
const categoryStore = useCategoryStore();

function productsByCategory(categoryId) {
  return productStore.products.filter((p) => p.categoryId === categoryId);
}

onMounted(() => {
  productStore.fetchProducts({ limit: 100 }); // lấy nhiều hơn để đủ chia theo category
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.banner img {
  width: 100%;
  display: block;
}
.main-content {
  max-width: 1200px;
  margin: 24px auto;
  display: flex;
  gap: 20px;
  padding: 0 16px;
}
.sidebar-col {
  width: 240px;
  flex-shrink: 0;
}
.content-col {
  flex: 1;
}
</style>