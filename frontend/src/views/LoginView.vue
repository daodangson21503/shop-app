<template>
  <div>
    <AppHeader />
    <div class="login-wrapper">
      <a-card title="Đăng nhập" style="width: 400px">
        <a-form layout="vertical">
          <a-form-item label="Email">
            <a-input v-model:value="form.email" placeholder="email@example.com" />
          </a-form-item>
          <a-form-item label="Mật khẩu">
            <a-input-password v-model:value="form.password" />
          </a-form-item>
          <a-button type="primary" block :loading="loading" @click="onLogin">
            Đăng nhập
          </a-button>
          <div style="text-align:center; margin-top:12px">
            Chưa có tài khoản? <a @click="$router.push('/register')">Đăng ký</a>
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
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const form = ref({ email: '', password: '' });

async function onLogin() {
  if (!form.value.email || !form.value.password) {
    message.warning('Vui lòng điền đầy đủ thông tin');
    return;
  }
  loading.value = true;
  try {
    await auth.login(form.value.email, form.value.password);
    message.success('Đăng nhập thành công');
    router.push('/my-orders');
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
  min-height: 60vh;
  padding: 40px 16px;
}
</style>