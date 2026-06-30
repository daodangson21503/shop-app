<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="sidebar-logo">🏠 ShopGiaDung</div>
      <nav class="sidebar-nav">
        <a class="nav-item active" @click="$router.push('/admin')">📊 Tổng quan</a>
        <a class="nav-item" @click="$router.push('/admin/products')">📦 Sản phẩm</a>
        <a class="nav-item" @click="$router.push('/admin/categories')">🗂 Danh mục</a>
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

    <div class="admin-main">
      <div class="admin-topbar">
        <h2>Tổng quan</h2>
        <a-button @click="fetchStats">🔄 Làm mới</a-button>
      </div>

      <a-spin :spinning="loading">
        <!-- Revenue cards -->
        <div class="revenue-row">
          <div class="revenue-card">
            <div class="rc-label">Doanh thu hôm nay</div>
            <div class="rc-value">{{ formatMoney(stats.revenue?.today) }}</div>
          </div>
          <div class="revenue-card">
            <div class="rc-label">Doanh thu 7 ngày</div>
            <div class="rc-value">{{ formatMoney(stats.revenue?.week) }}</div>
          </div>
          <div class="revenue-card">
            <div class="rc-label">Doanh thu tháng này</div>
            <div class="rc-value">{{ formatMoney(stats.revenue?.month) }}</div>
          </div>
        </div>

        <!-- Quick stats -->
        <div class="quick-stats">
          <div class="qs-item">
            <span class="qs-icon">🧾</span>
            <div>
              <div class="qs-value">{{ stats.totalOrders || 0 }}</div>
              <div class="qs-label">Tổng đơn hàng</div>
            </div>
          </div>
          <div class="qs-item">
            <span class="qs-icon">📦</span>
            <div>
              <div class="qs-value">{{ stats.totalProducts || 0 }}</div>
              <div class="qs-label">Sản phẩm</div>
            </div>
          </div>
          <div class="qs-item">
            <span class="qs-icon">👥</span>
            <div>
              <div class="qs-value">{{ stats.totalCustomers || 0 }}</div>
              <div class="qs-label">Khách hàng</div>
            </div>
          </div>
        </div>

        <a-row :gutter="20">
          <!-- Revenue chart -->
          <a-col :span="14">
            <div class="panel">
              <h3>📈 Doanh thu 7 ngày gần nhất</h3>
              <Line v-if="chartData" :data="chartData" :options="chartOptions" style="max-height:280px" />
            </div>
          </a-col>

          <!-- Top products -->
          <a-col :span="10">
            <div class="panel">
              <h3>🏆 Top sản phẩm bán chạy</h3>
              <div v-if="stats.topProducts?.length === 0" class="empty-mini">Chưa có dữ liệu</div>
              <div v-else class="top-products-list">
                <div v-for="(p, i) in stats.topProducts" :key="i" class="top-product-item">
                  <div class="tp-rank" :class="`rank-${i+1}`">{{ i + 1 }}</div>
                  <div class="tp-info">
                    <div class="tp-name">{{ p.name }}</div>
                    <div class="tp-sold">Đã bán {{ p.soldQuantity }}</div>
                  </div>
                  <div class="tp-revenue">{{ formatMoney(p.revenue) }}</div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Filler,
} from 'chart.js';
import http from '../../api/axios';
import { useAuthStore } from '../../stores/auth.store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const stats = ref({});

function formatMoney(v) {
  return `${Number(v || 0).toLocaleString()}đ`;
}

const chartData = computed(() => {
  if (!stats.value.dailyRevenue) return null;
  return {
    labels: stats.value.dailyRevenue.map(d => d.date),
    datasets: [{
      label: 'Doanh thu',
      data: stats.value.dailyRevenue.map(d => d.revenue),
      borderColor: '#ff424e',
      backgroundColor: 'rgba(255,66,78,0.08)',
      fill: true,
      tension: 0.3,
    }],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: { callback: (v) => `${(v/1000)}k` },
    },
  },
};

async function fetchStats() {
  loading.value = true;
  try {
    const { data } = await http.get('/dashboard/stats');
    stats.value = data.data;
  } finally {
    loading.value = false;
  }
}

function logout() {
  auth.logout();
  router.push('/admin/login');
}

onMounted(fetchStats);
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: #f5f6fa; }
.admin-sidebar {
  width: 220px; background: #1a1a2e; color: #fff;
  display: flex; flex-direction: column; flex-shrink: 0;
  position: fixed; top: 0; bottom: 0; left: 0; z-index: 10;
}
.sidebar-logo { padding: 20px 16px; font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar-nav { flex: 1; padding: 12px 0; }
.nav-item { display: block; padding: 11px 20px; font-size: 14px; color: rgba(255,255,255,0.65); cursor: pointer; transition: all 0.15s; }
.nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.08); color: #fff; }
.sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 10px; }
.admin-info { display: flex; align-items: center; gap: 10px; }
.admin-avatar { width: 32px; height: 32px; border-radius: 50%; background: #ff424e; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.admin-name { font-size: 13px; font-weight: 600; color: #fff; }
.admin-role { font-size: 11px; color: rgba(255,255,255,0.45); }
.admin-main { flex: 1; margin-left: 220px; padding: 24px; }
.admin-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.admin-topbar h2 { font-size: 22px; font-weight: 700; margin: 0; }

.revenue-row { display: flex; gap: 16px; margin-bottom: 16px; }
.revenue-card {
  flex: 1; background: linear-gradient(135deg, #ff424e, #ff7a45);
  border-radius: 12px; padding: 20px; color: #fff;
}
.rc-label { font-size: 13px; opacity: 0.9; margin-bottom: 6px; }
.rc-value { font-size: 24px; font-weight: 700; }

.quick-stats { display: flex; gap: 16px; margin-bottom: 20px; }
.qs-item {
  flex: 1; background: #fff; border: 1px solid #f0f0f0; border-radius: 10px;
  padding: 16px 20px; display: flex; align-items: center; gap: 14px;
}
.qs-icon { font-size: 28px; }
.qs-value { font-size: 22px; font-weight: 700; color: #1a1a2e; }
.qs-label { font-size: 12px; color: #999; }

.panel {
  background: #fff; border: 1px solid #f0f0f0; border-radius: 12px;
  padding: 20px; margin-bottom: 16px;
}
.panel h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }

.top-products-list { display: flex; flex-direction: column; gap: 10px; }
.top-product-item { display: flex; align-items: center; gap: 12px; }
.tp-rank {
  width: 26px; height: 26px; border-radius: 50%; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; flex-shrink: 0; color: #999;
}
.tp-rank.rank-1 { background: #ffd700; color: #fff; }
.tp-rank.rank-2 { background: #c0c0c0; color: #fff; }
.tp-rank.rank-3 { background: #cd7f32; color: #fff; }
.tp-info { flex: 1; min-width: 0; }
.tp-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-sold { font-size: 11px; color: #999; }
.tp-revenue { font-size: 13px; font-weight: 700; color: #ff424e; flex-shrink: 0; }
.empty-mini { text-align: center; color: #999; padding: 40px 0; font-size: 13px; }
</style>