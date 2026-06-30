<template>
  <div>
    <AppHeader />

    <div class="page-wrapper">
      <!-- Breadcrumb -->
      <a-breadcrumb style="margin-bottom: 16px">
        <a-breadcrumb-item @click="$router.push('/')" style="cursor:pointer">Trang chủ</a-breadcrumb-item>
        <a-breadcrumb-item>Sản phẩm</a-breadcrumb-item>
        <a-breadcrumb-item v-if="currentCategory">{{ currentCategory }}</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="page-header">
        <h1>{{ currentCategory || 'Tất cả sản phẩm' }}</h1>
      </div>

      <a-row :gutter="20">
        <!-- Sidebar filter -->
        <a-col :span="5">
          <div class="filter-panel">
            <div class="filter-title">📂 Danh mục</div>
            <ul class="category-list">
              <li
                :class="{ active: !selectedCategory }"
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

            <a-divider />

            <div class="filter-title">↕️ Sắp xếp theo giá</div>
            <a-radio-group v-model:value="sortPrice" @change="applyFilter" direction="vertical">
              <div class="radio-group-col">
                <a-radio value="">Mặc định</a-radio>
                <a-radio value="asc">Giá thấp → cao</a-radio>
                <a-radio value="desc">Giá cao → thấp</a-radio>
              </div>
            </a-radio-group>

            <a-divider />

            <div class="filter-title">💰 Khoảng giá</div>
            <div class="price-filter-col">
              <a-input-number
                v-model:value="minPrice"
                placeholder="Từ (đ)"
                style="width:100%"
                :formatter="v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''"
              />
              <a-input-number
                v-model:value="maxPrice"
                placeholder="Đến (đ)"
                style="width:100%"
                :formatter="v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''"
              />
              <a-button block type="primary" class="filter-btn" @click="applyFilter">Lọc</a-button>
              <a-button block @click="resetFilter">Xóa bộ lọc</a-button>
            </div>
          </div>
        </a-col>

        <!-- Product grid -->
        <a-col :span="19">
          <!-- Toolbar -->
          <div class="list-toolbar">
            <div class="result-count">
              <span v-if="!loading">Tìm thấy <b>{{ products.length }}</b> sản phẩm</span>
            </div>
            <div class="view-controls">
              <a-input-search
                v-model:value="keyword"
                placeholder="Tìm sản phẩm..."
                style="width: 240px"
                allow-clear
                @search="applyFilter"
              />
            </div>
          </div>

          <!-- Loading -->
          <a-spin :spinning="loading">
            <!-- Empty -->
            <div v-if="!loading && products.length === 0" class="empty-result">
              <div class="empty-icon">🔍</div>
              <p>Không tìm thấy sản phẩm nào</p>
              <a-button @click="resetFilter">Xóa bộ lọc</a-button>
            </div>

            <!-- Grid -->
            <div v-else class="product-grid">
              <div
                v-for="p in products"
                :key="p.id"
                class="product-card"
                @click="$router.push(`/products/${p.slug}`)"
              >
                <div class="card-img-wrapper">
                  <img
                    :src="getImageUrl(p.imageUrl || p.image_url)"
                    :alt="p.name"
                    class="card-img"
                  />
                  <div v-if="p.stock === 0" class="out-of-stock-badge">Hết hàng</div>
                </div>
                <div class="card-body">
                  <div class="card-name">{{ p.name }}</div>
                  <div class="card-price">{{ Number(p.price).toLocaleString() }}đ</div>
                  <a-button
                    type="primary"
                    block
                    size="small"
                    class="add-btn"
                    :disabled="p.stock === 0"
                    @click.stop="addToCart(p)"
                  >
                    {{ p.stock === 0 ? 'Hết hàng' : '+ Thêm vào giỏ' }}
                  </a-button>
                </div>
              </div>
            </div>
          </a-spin>
        </a-col>
      </a-row>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { useCartStore } from '../stores/cart.store';
import { useCategoryStore } from '../stores/category.store';
import { getImageUrl } from '../utils/image.js';
import http from '../api/axios';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const categoryStore = useCategoryStore();

const products = ref([]);
const loading = ref(false);
const keyword = ref('');
const selectedCategory = ref(null);
const sortPrice = ref('');
const minPrice = ref(null);
const maxPrice = ref(null);

const categories = computed(() => categoryStore.categories);
const currentCategory = computed(() => {
  const cat = categories.value.find(c => c.id === selectedCategory.value);
  return cat?.name || '';
});

async function fetchProducts() {
  loading.value = true;
  try {
    const params = { limit: 100 };
    if (keyword.value) params.search = keyword.value;
    if (selectedCategory.value) params.category = selectedCategory.value;
    const { data } = await http.get('/products', { params });
    let list = data.data;

    if (minPrice.value) list = list.filter(p => Number(p.price) >= minPrice.value);
    if (maxPrice.value) list = list.filter(p => Number(p.price) <= maxPrice.value);
    if (sortPrice.value === 'asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortPrice.value === 'desc') list.sort((a, b) => Number(b.price) - Number(a.price));

    products.value = list;
  } finally {
    loading.value = false;
  }
}

function selectCategory(id) {
  selectedCategory.value = id;
  router.replace({ query: id ? { category: id } : {} });
  fetchProducts();
}

function applyFilter() { fetchProducts(); }

function resetFilter() {
  keyword.value = '';
  selectedCategory.value = null;
  sortPrice.value = '';
  minPrice.value = null;
  maxPrice.value = null;
  router.replace({ query: {} });
  fetchProducts();
}

function addToCart(p) {
  cart.addItem(p);
  message.success('Đã thêm vào giỏ hàng');
}

onMounted(() => {
  categoryStore.fetchCategories();
  if (route.query.category) selectedCategory.value = Number(route.query.category);
  if (route.query.search) keyword.value = route.query.search;
  fetchProducts();
});

watch(() => route.query, (q) => {
  if (q.search !== undefined) keyword.value = q.search || '';
  if (q.category !== undefined) selectedCategory.value = q.category ? Number(q.category) : null;
  fetchProducts();
});
</script>

<style scoped>
.page-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.page-header {
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 22px;
  font-weight: 800;
  color: #222;
  position: relative;
  padding-left: 12px;
}
.page-header h1::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 4px;
  background: #ff424e;
  border-radius: 2px;
}

/* Filter panel */
.filter-panel {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 18px;
  position: sticky;
  top: 90px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.filter-title {
  font-weight: 700;
  font-size: 13px;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.category-list li {
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
  color: #555;
  transition: all 0.15s;
}
.category-list li:hover { background: #fff5f5; color: #ff424e; }
.category-list li.active {
  background: #fff1f0;
  color: #ff424e;
  font-weight: 600;
}

.radio-group-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
:deep(.ant-radio-wrapper) {
  font-size: 13.5px;
}

.price-filter-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.filter-btn {
  font-weight: 600;
  border-radius: 8px;
}

/* Toolbar */
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}
.result-count { font-size: 14px; color: #666; }
.result-count b { color: #ff424e; }

/* Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.product-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}
.product-card:hover {
  box-shadow: 0 10px 28px rgba(0,0,0,0.09);
  transform: translateY(-4px);
}
.card-img-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #fafafa;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.product-card:hover .card-img { transform: scale(1.06); }
.out-of-stock-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 6px;
}
.card-body { padding: 12px; }
.card-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 36px;
}
.card-price {
  font-size: 16px;
  font-weight: 800;
  color: #ff424e;
  margin-bottom: 10px;
}
.add-btn { border-radius: 8px; font-size: 12px; font-weight: 600; }

.empty-result {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-result p { margin: 0 0 16px; font-size: 15px; }
</style>