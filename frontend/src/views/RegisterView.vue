<template>
  <div>
    <AppHeader />
    <div class="register-wrapper">
      <a-card title="Đăng ký tài khoản" style="width: 400px">
        <a-form layout="vertical">
          <a-form-item label="Họ và tên">
            <a-input v-model:value="form.fullName" placeholder="Nguyễn Văn A" />
          </a-form-item>
          <a-form-item label="Email">
            <a-input v-model:value="form.email" placeholder="email@example.com" />
          </a-form-item>
          <a-form-item label="Mật khẩu">
            <a-input-password v-model:value="form.password" />
          </a-form-item>
          <a-button type="primary" block :loading="loading" @click="onRegister">
            Đăng ký
          </a-button>
          <div style="text-align:center; margin-top:12px">
            Đã có tài khoản? <a @click="$router.push('/login')">Đăng nhập</a>
          </div>
        </a-form>
      </a-card>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
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
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 16px;
}
</style>