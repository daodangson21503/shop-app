<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="sidebar-logo">🏠 ShopGiaDung</div>
      <nav class="sidebar-nav">
        <a class="nav-item" @click="$router.push('/admin')">📊 Tổng quan</a>
        <a class="nav-item" @click="$router.push('/admin/products')">📦 Sản phẩm</a>
        <a class="nav-item" @click="$router.push('/admin/categories')">🗂 Danh mục</a>
        <a class="nav-item" @click="$router.push('/admin/orders')">🧾 Đơn hàng</a>
        <a class="nav-item" @click="$router.push('/admin/vouchers')">🎟 Voucher</a>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">{{ auth.user?.full_name?.[0] || 'A' }}</div>
          <div>
            <div class="admin-name">{{ auth.user?.full_name }}</div>
            <div class="admin-role">Quản trị viên</div>
          </div>
        </div>
        <a-button size="small" @click="logout">Đăng xuất</a-button>
      </div>
    </div>

    <div class="admin-main">
      <div class="admin-topbar">
        <h2>Quản lý sản phẩm</h2>
        <a-button type="primary" size="large" @click="openCreate">+ Thêm sản phẩm</a-button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ products.length }}</div>
          <div class="stat-label">Tổng sản phẩm</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-green">{{products.filter(p => p.stock > 0).length}}</div>
          <div class="stat-label">Còn hàng</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-red">{{products.filter(p => p.stock === 0).length}}</div>
          <div class="stat-label">Hết hàng</div>
        </div>
      </div>
      <a-alert v-if="lowStockProducts.length > 0" type="warning" show-icon closable class="low-stock-alert">
        <template #message>
          <b>⚠️ {{ lowStockProducts.length }} sản phẩm sắp hết hàng</b> (tồn kho ≤ 10):
          {{lowStockProducts.map(p => p.name).join(', ')}}
        </template>
      </a-alert>
      <div class="table-toolbar">
        <a-input-search v-model:value="searchText" placeholder="Tìm tên sản phẩm..." style="width:280px" allow-clear />
      </div>

      <div class="table-wrapper">
        <a-table :dataSource="filteredProducts" :columns="columns" rowKey="id" :loading="loading"
          :pagination="{ pageSize: 10 }" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'product'">
              <div class="product-cell">
                <img :src="getFullImageUrl(record.imageUrl || record.image_url)" class="product-thumb"
                  @error="(e) => e.target.src = 'https://placehold.co/40x40/eee/999?text=?'" />
                <div>
                  <div class="product-name">{{ record.name }}</div>
                  <div class="product-slug">{{ record.slug }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'price'">
              <span class="price-text">{{ Number(record.price).toLocaleString() }}đ</span>
            </template>
            <template v-else-if="column.key === 'stock'">
              <a-tag :color="record.stock > 10 ? 'green' : record.stock > 0 ? 'orange' : 'red'">
                {{ record.stock > 0 ? `${record.stock} còn` : 'Hết hàng' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="openEdit(record)">✏️ Sửa</a-button>
                <a-button size="small" danger @click="remove(record.id)">🗑 Xóa</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Modal -->
    <a-modal v-model:open="modalVisible" :title="editingId ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'" @ok="submit"
      ok-text="Lưu" cancel-text="Hủy" width="620px">
      <a-form layout="vertical" style="margin-top:12px">

        <!-- Upload ảnh -->
        <a-form-item label="Ảnh sản phẩm">
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="onDrop">
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onFileChange" />
            <div v-if="imagePreview" class="preview-wrapper">
              <img :src="imagePreview" class="preview-img" />
              <div class="preview-overlay"><span>Bấm để đổi ảnh</span></div>
            </div>
            <div v-else class="upload-placeholder">
              <div style="font-size:36px">📷</div>
              <div style="font-weight:600;margin-top:8px">Bấm hoặc kéo thả ảnh vào đây</div>
              <div style="font-size:12px;color:#999;margin-top:4px">JPG, PNG, WEBP — tối đa 5MB</div>
            </div>
          </div>
          <a-progress v-if="uploading" :percent="uploadProgress" size="small" style="margin-top:8px" />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="14">
            <a-form-item label="Tên sản phẩm" required>
              <a-input v-model:value="form.name" placeholder="VD: Nồi cơm điện Sharp 1.8L" />
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item label="Slug (tự động tạo)">
              <a-input v-model:value="form.slug" :disabled="!!editingId" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Danh mục" required>
          <a-select v-model:value="form.category_id" placeholder="Chọn danh mục...">
            <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="Giá (đ)" required>
              <a-input-number v-model:value="form.price" style="width:100%" :min="0"
                :formatter="v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Tồn kho" required>
              <a-input-number v-model:value="form.stock" style="width:100%" :min="0" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Mô tả">
          <a-textarea v-model:value="form.description" :rows="3" placeholder="Mô tả ngắn về sản phẩm..." />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import http from '../../api/axios';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const modalVisible = ref(false);
const editingId = ref(null);
const searchText = ref('');
const fileInput = ref(null);
const imagePreview = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);

const form = ref({
  name: '', slug: '', description: '',
  price: 0, stock: 0, image_url: '', category_id: null,
});

const columns = [
  { title: 'Sản phẩm', key: 'product', width: 300 },
  { title: 'Giá', key: 'price', width: 130, sorter: (a, b) => a.price - b.price },
  { title: 'Tồn kho', key: 'stock', width: 120, sorter: (a, b) => a.stock - b.stock },
  { title: 'Thao tác', key: 'action', width: 150 },
];

const filteredProducts = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
);
const lowStockProducts = computed(() =>
  products.value.filter(p => p.stock > 0 && p.stock <= 10)
);
// Hiển thị ảnh đúng cả local upload lẫn URL ngoài
function getFullImageUrl(url) {
  if (!url) return 'https://placehold.co/40x40/eee/999?text=?';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url}`; // ảnh upload local
}

// Auto slug từ tên
function toSlug(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}
watch(() => form.value.name, (val) => {
  if (!editingId.value) form.value.slug = toSlug(val || '');
});

async function fetchProducts() {
  loading.value = true;
  const { data } = await http.get('/products', { params: { limit: 200 } });
  products.value = data.data;
  loading.value = false;
}

function openCreate() {
  editingId.value = null;
  imagePreview.value = '';
  form.value = { name: '', slug: '', description: '', price: 0, stock: 0, image_url: '', category_id: null };
  modalVisible.value = true;
}

function openEdit(record) {
  editingId.value = record.id;
  const imgUrl = record.imageUrl || record.image_url || '';
  imagePreview.value = getFullImageUrl(imgUrl);
  form.value = {
    name: record.name, slug: record.slug,
    description: record.description || '',
    price: Number(record.price), stock: record.stock,
    image_url: imgUrl,
    category_id: record.categoryId || record.category_id,
  };
  modalVisible.value = true;
}

function triggerFileInput() { fileInput.value?.click(); }
function onDrop(e) { const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }
function onFileChange(e) { const f = e.target.files[0]; if (f) uploadFile(f); }

async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) { message.error('File quá lớn, tối đa 5MB'); return; }
  imagePreview.value = URL.createObjectURL(file);
  uploading.value = true;
  uploadProgress.value = 30;
  try {
    const formData = new FormData();
    formData.append('image', file);
    uploadProgress.value = 60;
    const { data } = await http.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    uploadProgress.value = 100;
    form.value.image_url = data.data.url;
    message.success('Upload ảnh thành công');
  } catch {
    message.error('Upload ảnh thất bại');
    imagePreview.value = form.value.image_url ? getFullImageUrl(form.value.image_url) : '';
  } finally {
    uploading.value = false;
    setTimeout(() => uploadProgress.value = 0, 800);
  }
}

async function submit() {
  if (!form.value.name) { message.warning('Vui lòng nhập tên sản phẩm'); return; }
  if (!form.value.category_id) { message.warning('Vui lòng chọn danh mục'); return; }
  try {
    if (editingId.value) {
      await http.put(`/products/${editingId.value}`, form.value);
      message.success('Cập nhật thành công');
    } else {
      await http.post('/products', form.value);
      message.success('Thêm sản phẩm thành công');
    }
    modalVisible.value = false;
    fetchProducts();
  } catch (err) {
    message.error(err.response?.data?.message || 'Có lỗi xảy ra');
  }
}

function remove(id) {
  Modal.confirm({
    title: 'Xóa sản phẩm này?', content: 'Sản phẩm sẽ bị ẩn khỏi cửa hàng.',
    okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
    onOk: async () => {
      await http.delete(`/products/${id}`);
      message.success('Đã xóa');
      fetchProducts();
    },
  });
}

function logout() { auth.logout(); router.push('/admin/login'); }

onMounted(async () => {
  fetchProducts();
  const { data } = await http.get('/categories');
  categories.value = data.data;
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
}

.admin-sidebar {
  width: 220px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.sidebar-logo {
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
}

.nav-item {
  display: block;
  padding: 11px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.15s;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ff424e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.admin-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.admin-main {
  flex: 1;
  margin-left: 220px;
  padding: 24px;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-topbar h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 28px;
  border: 1px solid #f0f0f0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-value.text-green {
  color: #52c41a;
}

.stat-value.text-red {
  color: #ff424e;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.table-toolbar {
  margin-bottom: 12px;
}

.table-wrapper {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.product-name {
  font-weight: 500;
  font-size: 13px;
}

.product-slug {
  font-size: 11px;
  color: #999;
}

.price-text {
  color: #ff424e;
  font-weight: 600;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #ff424e;
  background: #fff5f5;
}

.upload-placeholder {
  text-align: center;
  padding: 24px;
  color: #666;
}

.preview-wrapper {
  position: relative;
  width: 100%;
}

.preview-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-wrapper:hover .preview-overlay {
  opacity: 1;
}

.low-stock-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}
</style>