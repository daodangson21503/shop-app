<template>
  <div class="login-wrapper">
    <a-card title="Đăng nhập Quản trị" style="width: 400px">
      <a-form layout="vertical" @finish="onLogin">
        <a-form-item label="Email">
          <a-input v-model:value="form.email" placeholder="admin@shop.com" />
        </a-form-item>
        <a-form-item label="Mật khẩu">
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-button type="primary" block :loading="loading" @click="onLogin">
          Đăng nhập
        </a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const form = ref({ email: '', password: '' });

async function onLogin() {
  loading.value = true;
  try {
    await auth.login(form.value.email, form.value.password);
    if (!auth.isAdmin) {
      message.error('Tài khoản không có quyền quản trị');
      auth.logout();
      return;
    }
    message.success('Đăng nhập thành công');
    router.push('/admin');
  } catch (err) {
    message.error(err.response?.data?.message || 'Đăng nhập thất bại');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}
</style>