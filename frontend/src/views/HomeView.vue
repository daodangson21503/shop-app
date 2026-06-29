<template>
  <div>
    <AppHeader />

    <div class="banner">
      <img src="../assets/banner.jpg" alt="banner" />
    </div>

    <div class="main-content">
      <div class="sidebar-col">
        <CategorySidebar :categories="categoryStore.categories" />
      </div>

     <div class="content-col">
  <!-- Đang tìm kiếm -->
  <template v-if="productStore.keyword">
    <div class="search-result-title">
      Kết quả tìm kiếm: "<strong>{{ productStore.keyword }}</strong>"
      ({{ productStore.filteredProducts.length }} sản phẩm)
    </div>
    <a-empty
      v-if="productStore.filteredProducts.length === 0"
      description="Không tìm thấy sản phẩm nào"
    />
    <ProductSection
      v-else
      title=""
      :products="productStore.filteredProducts"
    />
  </template>

  <!-- Đang lọc theo danh mục -->
  <template v-else-if="productStore.selectedCategory">
    <ProductSection
      :title="selectedCategoryName"
      :products="productStore.filteredProducts"
    />
  </template>

  <!-- Tất cả sản phẩm theo danh mục -->
  <template v-else>
    <ProductSection
      v-for="cat in categoryStore.categories"
      :key="cat.id"
      :title="cat.name"
      :products="productsByCategory(cat.id)"
    />
  </template>
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

const selectedCategoryName = computed(() => {
  const cat = categoryStore.categories.find(
    (c) => c.id === productStore.selectedCategory
  );
  return cat ? cat.name : '';
});

onMounted(() => {
  productStore.fetchProducts();
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
.search-result-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff424e;
}
</style>