<template>
    <div class="admin-layout">
        <!-- Sidebar -->
        <div class="admin-sidebar">
            <div class="sidebar-logo">🏠 ShopGiaDung</div>
            <nav class="sidebar-nav">
                <a class="nav-item" @click="$router.push('/admin')">📊 Tổng quan</a>
                <a class="nav-item" @click="$router.push('/admin/products')">📦 Sản phẩm</a>
                <a class="nav-item active" @click="$router.push('/admin/categories')">🗂 Danh mục</a>
                <a class="nav-item" @click="$router.push('/admin/orders')">🧾 Đơn hàng</a>
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

        <!-- Main -->
        <div class="admin-main">
            <div class="admin-topbar">
                <h2>Quản lý danh mục</h2>
                <a-button type="primary" @click="openCreate">+ Thêm danh mục</a-button>
            </div>

            <div class="table-wrapper">
                <a-table :dataSource="categories" :columns="columns" rowKey="id" :loading="loading" :pagination="false"
                    size="middle">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'name'">
                            <div class="cat-name">{{ record.name }}</div>
                            <div class="cat-slug">{{ record.slug }}</div>
                        </template>

                        <template v-else-if="column.key === 'productCount'">
                            <a-tag color="blue">{{ record._count?.products || 0 }} sản phẩm</a-tag>
                        </template>

                        <template v-else-if="column.key === 'action'">
                            <a-space>
                                <a-button size="small" @click="openEdit(record)">✏️ Sửa</a-button>
                                <a-button size="small" danger :disabled="record._count?.products > 0"
                                    @click="remove(record)">🗑 Xóa</a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>

        <!-- Modal -->
        <a-modal v-model:open="modalVisible" :title="editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'" @ok="submit"
            ok-text="Lưu" cancel-text="Hủy">
            <a-form layout="vertical" style="margin-top: 8px">
                <a-form-item label="Tên danh mục">
                    <a-input v-model:value="form.name" placeholder="Ví dụ: Đồ dùng nhà bếp" @input="autoGenSlug" />
                </a-form-item>
                <a-form-item label="Slug (URL)">
                    <a-input v-model:value="form.slug" :disabled="!!editingId" placeholder="do-dung-nha-bep" />
                    <div class="hint-text" v-if="!editingId">Tự động sinh từ tên, có thể sửa lại</div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import http from '../../api/axios';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const categories = ref([]);
const loading = ref(false);
const modalVisible = ref(false);
const editingId = ref(null);
const form = ref({ name: '', slug: '' });

const columns = [
    { title: 'Danh mục', key: 'name' },
    { title: 'Số sản phẩm', key: 'productCount', width: 150 },
    { title: 'Thao tác', key: 'action', width: 160 },
];

function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function autoGenSlug() {
    if (!editingId.value) {
        form.value.slug = slugify(form.value.name);
    }
}

async function fetchCategories() {
    loading.value = true;
    try {
        const { data } = await http.get('/categories');
        categories.value = data.data;
    } finally {
        loading.value = false;
    }
}

function openCreate() {
    editingId.value = null;
    form.value = { name: '', slug: '' };
    modalVisible.value = true;
}

function openEdit(record) {
    editingId.value = record.id;
    form.value = { name: record.name, slug: record.slug };
    modalVisible.value = true;
}

async function submit() {
    if (!form.value.name || !form.value.slug) {
        message.warning('Vui lòng điền đầy đủ thông tin');
        return;
    }
    try {
        if (editingId.value) {
            await http.put(`/categories/${editingId.value}`, form.value);
            message.success('Cập nhật thành công');
        } else {
            await http.post('/categories', form.value);
            message.success('Thêm danh mục thành công');
        }
        modalVisible.value = false;
        fetchCategories();
    } catch (err) {
        message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
}

function remove(record) {
    if (record._count?.products > 0) {
        message.warning('Không thể xóa danh mục còn sản phẩm');
        return;
    }
    Modal.confirm({
        title: `Xóa danh mục "${record.name}"?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                await http.delete(`/categories/${record.id}`);
                message.success('Đã xóa');
                fetchCategories();
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

onMounted(fetchCategories);
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

.table-wrapper {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #f0f0f0;
    overflow: hidden;
}

.cat-name {
    font-weight: 500;
    font-size: 14px;
}

.cat-slug {
    font-size: 12px;
    color: #999;
}

.hint-text {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}
</style>