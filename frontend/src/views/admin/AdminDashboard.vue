<template>
    <div class="admin-wrapper">
        <div class="admin-header">
            <h2>Quản trị sản phẩm</h2>
            <div>
                <a-button style="margin-right: 8px" @click="$router.push('/admin/orders')">
                    Xem đơn hàng
                </a-button>
                <span style="margin-right: 16px">Xin chào, {{ auth.user?.full_name }}</span>
                <a-button @click="logout">Đăng xuất</a-button>
            </div>
        </div>

        <a-button type="primary" style="margin-bottom: 16px" @click="openCreate">
            + Thêm sản phẩm
        </a-button>

        <a-table :dataSource="products" :columns="columns" rowKey="id" :loading="loading">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'price'">
                    {{ Number(record.price).toLocaleString() }}đ
                </template>
                <template v-else-if="column.key === 'action'">
                    <a-button size="small" @click="openEdit(record)">Sửa</a-button>
                    <a-button size="small" danger style="margin-left: 8px" @click="remove(record.id)">Xóa</a-button>
                </template>
            </template>
        </a-table>

        <a-modal v-model:open="modalVisible" :title="editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'" @ok="submit">
            <a-form layout="vertical">
                <a-form-item label="Tên sản phẩm">
                    <a-input v-model:value="form.name" />
                </a-form-item>
                <a-form-item label="Slug (không dấu, không trùng)">
                    <a-input v-model:value="form.slug" :disabled="!!editingId" />
                </a-form-item>
                <a-form-item label="Mô tả">
                    <a-textarea v-model:value="form.description" />
                </a-form-item>
                <a-form-item label="Giá">
                    <a-input-number v-model:value="form.price" style="width: 100%" :min="0" />
                </a-form-item>
                <a-form-item label="Tồn kho">
                    <a-input-number v-model:value="form.stock" style="width: 100%" :min="0" />
                </a-form-item>
                <a-form-item label="Ảnh sản phẩm">
                    <div class="image-upload-area">
                        <!-- Preview ảnh hiện tại -->
                        <div v-if="form.image_url" class="image-preview">
                            <img :src="form.image_url" alt="preview" />
                            <a-button size="small" danger @click="form.image_url = ''">Xóa ảnh</a-button>
                        </div>

                        <!-- Nút chọn file -->
                        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none"
                            @change="handleFileSelect" />
                        <a-button @click="$refs.fileInput.click()" :loading="uploadingImage">
                            {{ form.image_url ? 'Đổi ảnh' : 'Chọn ảnh' }}
                        </a-button>
                        <span v-if="uploadingImage" style="margin-left:8px; color:#888">Đang upload...</span>
                    </div>
                </a-form-item>
                <a-form-item label="Category ID">
                    <a-input-number v-model:value="form.category_id" style="width: 100%" />
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

const products = ref([]);
const loading = ref(false);
const modalVisible = ref(false);
const editingId = ref(null);
const uploadingImage = ref(false);
const fileInput = ref(null);

const form = ref({
    name: '', slug: '', description: '', price: 0, stock: 0, image_url: '', category_id: null,
});

const columns = [
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Giá', key: 'price' },
    { title: 'Tồn kho', dataIndex: 'stock' },
    { title: '', key: 'action' },
];

async function fetchProducts() {
    loading.value = true;
    const { data } = await http.get('/products', { params: { limit: 100 } });
    products.value = data.data;
    loading.value = false;
}

function openCreate() {
    editingId.value = null;
    form.value = { name: '', slug: '', description: '', price: 0, stock: 0, image_url: '', category_id: null };
    modalVisible.value = true;
}

function openEdit(record) {
    editingId.value = record.id;
    form.value = { ...record };
    modalVisible.value = true;
}

async function submit() {
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

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadingImage.value = true;
    try {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await http.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        form.value.image_url = data.data.url;
        message.success('Upload ảnh thành công');
    } catch (err) {
        message.error('Upload ảnh thất bại');
    } finally {
        uploadingImage.value = false;
        // Reset input để có thể chọn lại cùng file
        if (fileInput.value) fileInput.value.value = '';
    }
}

function remove(id) {
    Modal.confirm({
        title: 'Xác nhận xóa sản phẩm này?',
        onOk: async () => {
            await http.delete(`/products/${id}`);
            message.success('Đã xóa');
            fetchProducts();
        },
    });
}

function logout() {
    auth.logout();
    router.push('/admin/login');
}

onMounted(fetchProducts);
</script>

<style scoped>
.admin-wrapper {
    max-width: 1100px;
    margin: 32px auto;
    padding: 0 16px;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.image-upload-area {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.image-preview {
    display: flex;
    align-items: center;
    gap: 8px;
}

.image-preview img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
}
</style>