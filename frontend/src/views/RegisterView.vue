<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <div class="brand-icon">🏠</div>
        <h1>ShopGiaDung</h1>
        <p>Đồ gia dụng chính hãng, giá tốt mỗi ngày</p>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2>Tạo tài khoản</h2>
        <p class="auth-subtitle">Đăng ký để theo dõi đơn hàng dễ dàng hơn</p>

        <a-form layout="vertical">
          <a-form-item label="Họ và tên">
            <a-input v-model:value="form.fullName" size="large" placeholder="Nguyễn Văn A" />
          </a-form-item>
          <a-form-item label="Email">
            <a-input v-model:value="form.email" size="large" placeholder="email@example.com" />
          </a-form-item>
          <a-form-item label="Mật khẩu">
            <a-input-password v-model:value="form.password" size="large" placeholder="Tối thiểu 6 ký tự" />
          </a-form-item>
          <a-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="onRegister"
            class="submit-btn"
          >
            Đăng ký
          </a-button>
        </a-form>

        <div class="auth-footer">
          Đã có tài khoản? <a @click="$router.push('/login')">Đăng nhập</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import http from '../api/axios';

const router = useRouter();
const loading = ref(false);
const form = ref({ fullName: '', email: '', password: '' });

async function onRegister() {
  if (!form.value.fullName || !form.value.email || !form.value.password) {
    message.warning('Vui lòng điền đầy đủ thông tin');
    return;
  }
  loading.value = true;
  try {
    await http.post('/auth/register', form.value);
    message.success('Đăng ký thành công! Vui lòng đăng nhập.');
    router.push('/login');
  } catch (err) {
    message.error(err.response?.data?.message || 'Đăng ký thất bại');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
}
.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #ff424e 0%, #ff7a45 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.auth-brand { text-align: center; padding: 40px; }
.brand-icon { font-size: 64px; margin-bottom: 16px; }
.auth-brand h1 { font-size: 36px; font-weight: 800; margin-bottom: 8px; color: #fff; }
.auth-brand p { font-size: 16px; opacity: 0.9; }
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
.auth-card h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.auth-subtitle { color: #888; margin-bottom: 24px; font-size: 14px; }
.submit-btn { margin-top: 8px; height: 44px; font-weight: 600; border-radius: 8px; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
@media (max-width: 768px) { .auth-left { display: none; } }
</style>