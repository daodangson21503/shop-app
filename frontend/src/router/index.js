import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ProductListView from '../views/ProductListView.vue';
import ProductDetailView from '../views/ProductDetailView.vue';
import CartView from '../views/CartView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import AdminLoginView from '../views/admin/AdminLoginView.vue';
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import { useAuthStore } from '../stores/auth.store';
import AdminOrdersView from '../views/admin/AdminOrdersView.vue';
import LoginView from '../views/LoginView.vue';
import MyOrdersView from '../views/MyOrdersView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/products', component: ProductListView },
  { path: '/products/:slug', component: ProductDetailView },
  { path: '/cart', component: CartView },
  { path: '/checkout', component: CheckoutView },
  { path: '/login', component: LoginView },                             
  { path: '/register', component: RegisterView },
  { path: '/my-orders', component: MyOrdersView }, 
  { path: '/admin/login', component: AdminLoginView },
  { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } },
  { path: '/admin/orders', component: AdminOrdersView, meta: { requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/admin/login';
  }
});

export default router;