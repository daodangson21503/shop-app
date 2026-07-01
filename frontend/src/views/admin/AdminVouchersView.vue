<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="admin-sidebar">
      <div class="sidebar-logo">🏠 ShopGiaDung</div>
      <nav class="sidebar-nav">
        <a class="nav-item" @click="$router.push('/admin')">📊 Tổng quan</a>
        <a class="nav-item" @click="$router.push('/admin/products')">📦 Sản phẩm</a>
        <a class="nav-item" @click="$router.push('/admin/categories')">🗂 Danh mục</a>
        <a class="nav-item" @click="$router.push('/admin/orders')">🧾 Đơn hàng</a>
        <a class="nav-item active" @click="$router.push('/admin/vouchers')">🎟 Voucher</a>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">{{ auth.user?.fullName?.[0] || 'A' }}</div>
          <div>
            <div class="admin-name">{{ auth.user?.fullName }}</div>
            <div class="admin-role">Quản trị viên</div>
          </div>
        </div>
        <a-button size="small" @click="logout">Đăng xuất</a-button>
      </div>
    </div>

    <!-- Main -->
    <div class="admin-main">
      <div class="admin-topbar">
        <h2>Quản lý voucher</h2>
        <a-button type="primary" @click="openCreate">+ Thêm voucher</a-button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ vouchers.length }}</div>
          <div class="stat-label">Tổng voucher</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeCount }}</div>
          <div class="stat-label">Đang hoạt động</div>
        </div>
        <div class="stat-card warn">
          <div class="stat-value">{{ expiredCount }}</div>
          <div class="stat-label">Hết hạn / hết lượt</div>
        </div>
      </div>

      <div class="table-wrapper">
        <a-table :dataSource="vouchers" :columns="columns" rowKey="id" :loading="loading" :pagination="{ pageSize: 10 }"
          size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'code'">
              <div class="voucher-code">{{ record.code }}</div>
              <div class="voucher-desc">{{ record.description }}</div>
            </template>

            <template v-else-if="column.key === 'discount'">
              <span class="discount-text">
                {{ record.discountType === 'percent'
                  ? `Giảm ${record.discountValue}%`
                  : `Giảm ${Number(record.discountValue).toLocaleString()}đ` }}
              </span>
              <div class="discount-sub" v-if="record.discountType === 'percent' && record.maxDiscount">
                Tối đa {{ Number(record.maxDiscount).toLocaleString() }}đ
              </div>
            </template>

            <template v-else-if="column.key === 'condition'">
              <div class="condition-text">
                Đơn từ {{ Number(record.minOrderAmount).toLocaleString() }}đ
              </div>
            </template>

            <template v-else-if="column.key === 'usage'">
              <span>{{ record.usedCount }} / {{ record.quantity === 0 ? '∞' : record.quantity }}</span>
            </template>

            <template v-else-if="column.key === 'expiresAt'">
              <span v-if="record.expiresAt">{{ formatDate(record.expiresAt) }}</span>
              <span v-else class="no-expiry">Không giới hạn</span>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record)">{{ getStatusText(record) }}</a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="openEdit(record)">✏️ Sửa</a-button>
                <a-button size="small" danger @click="remove(record)">🗑 Xóa</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Modal -->
    <a-modal v-model:open="modalVisible" :title="editingId ? 'Sửa voucher' : 'Thêm voucher mới'" @ok="submit"
      ok-text="Lưu" cancel-text="Hủy" width="560px">
      <a-form layout="vertical" style="margin-top: 8px">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="Mã voucher">
              <a-input v-model:value="form.code" :disabled="!!editingId" placeholder="GIAM10" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Loại giảm giá">
              <a-select v-model:value="form.discount_type">
                <a-select-option value="percent">Theo phần trăm (%)</a-select-option>
                <a-select-option value="fixed">Số tiền cố định (đ)</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Mô tả">
          <a-input v-model:value="form.description" placeholder="Giảm 10% tối đa 50k" />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="form.discount_type === 'percent' ? 'Giá trị giảm (%)' : 'Số tiền giảm (đ)'">
              <a-input-number v-model:value="form.discount_value" style="width:100%" :min="0" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="form.discount_type === 'percent'">
            <a-form-item label="Giảm tối đa (đ)">
              <a-input-number v-model:value="form.max_discount" style="width:100%" :min="0" placeholder="Không giới hạn" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="Đơn hàng tối thiểu (đ)">
              <a-input-number v-model:value="form.min_order_amount" style="width:100%" :min="0" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Số lượng (0 = không giới hạn)">
              <a-input-number v-model:value="form.quantity" style="width:100%" :min="0" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Ngày hết hạn">
          <a-date-picker v-model:value="form.expires_at" style="width:100%" placeholder="Không giới hạn" />
        </a-form-item>

        <a-form-item label="Trạng thái" v-if="editingId">
          <a-switch v-model:checked="form.is_active" checked-children="Hoạt động" un-checked-children="Tạm dừng" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import http from '../../api/axios';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const vouchers = ref([]);
const loading = ref(false);
const modalVisible = ref(false);
const editingId = ref(null);

const form = ref({
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: 0,
  max_discount: null,
  min_order_amount: 0,
  quantity: 0,
  expires_at: null,
  is_active: true,
});

const columns = [
  { title: 'Mã voucher', key: 'code', width: 200 },
  { title: 'Giảm giá', key: 'discount', width: 150 },
  { title: 'Điều kiện', key: 'condition', width: 150 },
  { title: 'Đã dùng', key: 'usage', width: 100 },
  { title: 'Hết hạn', key: 'expiresAt', width: 130 },
  { title: 'Trạng thái', key: 'status', width: 110 },
  { title: 'Thao tác', key: 'action', width: 140 },
];

const activeCount = computed(() =>
  vouchers.value.filter((v) => getStatusText(v) === 'Hoạt động').length
);
const expiredCount = computed(() =>
  vouchers.value.filter((v) => getStatusText(v) !== 'Hoạt động').length
);

function formatDate(d) {
  return dayjs(d).format('DD/MM/YYYY');
}

function getStatusText(v) {
  if (!v.isActive) return 'Tạm dừng';
  if (v.expiresAt && dayjs(v.expiresAt).isBefore(dayjs())) return 'Hết hạn';
  if (v.quantity > 0 && v.usedCount >= v.quantity) return 'Hết lượt';
  return 'Hoạt động';
}

function getStatusColor(v) {
  const status = getStatusText(v);
  if (status === 'Hoạt động') return 'green';
  if (status === 'Tạm dừng') return 'default';
  return 'red';
}

async function fetchVouchers() {
  loading.value = true;
  try {
    const { data } = await http.get('/vouchers');
    vouchers.value = data.data;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.value = {
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: 0,
    max_discount: null,
    min_order_amount: 0,
    quantity: 0,
    expires_at: null,
    is_active: true,
  };
  modalVisible.value = true;
}

function openEdit(record) {
  editingId.value = record.id;
  form.value = {
    code: record.code,
    description: record.description,
    discount_type: record.discountType,
    discount_value: Number(record.discountValue),
    max_discount: record.maxDiscount ? Number(record.maxDiscount) : null,
    min_order_amount: Number(record.minOrderAmount),
    quantity: record.quantity,
    expires_at: record.expiresAt ? dayjs(record.expiresAt) : null,
    is_active: record.isActive,
  };
  modalVisible.value = true;
}

async function submit() {
  if (!form.value.code || !form.value.discount_value) {
    message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }
  try {
    const payload = {
      ...form.value,
      expires_at: form.value.expires_at ? form.value.expires_at.toISOString() : null,
    };

    if (editingId.value) {
      await http.put(`/vouchers/${editingId.value}`, payload);
      message.success('Cập nhật thành công');
    } else {
      await http.post('/vouchers', payload);
      message.success('Tạo voucher thành công');
    }
    modalVisible.value = false;
    fetchVouchers();
  } catch (err) {
    message.error(err.response?.data?.message || 'Có lỗi xảy ra');
  }
}

function remove(record) {
  Modal.confirm({
    title: `Xóa voucher "${record.code}"?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        await http.delete(`/vouchers/${record.id}`);
        message.success('Đã xóa');
        fetchVouchers();
      } catch (err) {
        message.error(err.response?.data?.message || 'Xóa thất bại');
      }
    },
  });
}

function logout() {
  auth.logout();
  router.push('/admin/login');
}

onMounted(fetchVouchers);
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
  text-decoration: none;
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
  flex-shrink: 0;
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
  padding: 16px 24px;
  border: 1px solid #f0f0f0;
  min-width: 140px;
}

.stat-card.warn .stat-value {
  color: #ff424e;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.table-wrapper {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.voucher-code {
  font-weight: 700;
  font-size: 14px;
  font-family: monospace;
  color: #ff424e;
}

.voucher-desc {
  font-size: 12px;
  color: #999;
}

.discount-text {
  font-weight: 600;
  font-size: 13.5px;
  color: #389e0d;
}

.discount-sub {
  font-size: 11px;
  color: #999;
}

.condition-text {
  font-size: 13px;
  color: #555;
}

.no-expiry {
  color: #999;
  font-size: 12px;
}
</style>