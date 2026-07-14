<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

definePageMeta({ layout: 'admin', middleware: 'admin' })

const loading = ref(true)
const stats = ref({
  revenueToday: 0,
  revenueWeek: 0,
  revenueMonth: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
})
const revenueData = ref([])
const topProducts = ref([])
const ordersByStatus = ref([])

const chartLabels = computed(() => revenueData.value.map((d) => d.date || d.label || ''))
const chartValues = computed(() => revenueData.value.map((d) => d.revenue || d.total || 0))

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Doanh thu',
      data: chartValues.value,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#fff',
      bodyColor: '#e2e8f0',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx) => {
          return new Intl.NumberFormat('vi-VN').format(ctx.parsed.y) + 'đ'
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (value) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr'
          if (value >= 1000) return (value / 1000).toFixed(0) + 'k'
          return value
        },
      },
    },
  },
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

function formatPrice(val) {
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ'
}

async function fetchDashboard() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/dashboard/stats')
    const data = res.data || {}
    stats.value = {
      revenueToday: data.revenue?.today || 0,
      revenueWeek: data.revenue?.week || 0,
      revenueMonth: data.revenue?.month || 0,
      totalOrders: data.totalOrders || 0,
      totalProducts: data.totalProducts || 0,
      totalCustomers: data.totalCustomers || 0,
    }
    revenueData.value = data.dailyRevenue || []
    topProducts.value = data.topProducts || []
    ordersByStatus.value = data.ordersByStatus || []
  } catch {
    stats.value = { revenueToday: 0, revenueWeek: 0, revenueMonth: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 }
    revenueData.value = []
    topProducts.value = []
    ordersByStatus.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Đang tải dữ liệu...</p>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Doanh thu hôm nay</p>
          <p class="text-xl font-bold text-gray-900">{{ formatPrice(stats.revenueToday) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Doanh thu tuần</p>
          <p class="text-xl font-bold text-gray-900">{{ formatPrice(stats.revenueWeek) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Doanh thu tháng</p>
          <p class="text-xl font-bold text-gray-900">{{ formatPrice(stats.revenueMonth) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Tổng đơn hàng</p>
          <p class="text-xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Sản phẩm</p>
          <p class="text-xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Khách hàng</p>
          <p class="text-xl font-bold text-gray-900">{{ stats.totalCustomers }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Biểu đồ doanh thu</h3>
          <div v-if="revenueData.length > 0" class="h-72">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <div v-else class="h-72 flex items-center justify-center text-sm text-gray-400">
            Chưa có dữ liệu doanh thu
          </div>
        </div>

        <!-- Orders by Status -->
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Đơn hàng theo trạng thái</h3>
          <div v-if="ordersByStatus.length > 0" class="space-y-3">
            <div
              v-for="item in ordersByStatus"
              :key="item.status"
              class="flex items-center justify-between"
            >
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :class="statusColors[item.status] || 'bg-gray-100 text-gray-600'"
              >
                {{ statusLabels[item.status] || item.status }}
              </span>
              <span class="text-sm font-bold text-gray-900">{{ item.count }}</span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 text-center py-8">
            Chưa có đơn hàng
          </div>
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mt-6">
        <h3 class="text-base font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
        <div v-if="topProducts.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-2 text-gray-500 font-medium">#</th>
                <th class="text-left py-3 px-2 text-gray-500 font-medium">Sản phẩm</th>
                <th class="text-right py-3 px-2 text-gray-500 font-medium">Đã bán</th>
                <th class="text-right py-3 px-2 text-gray-500 font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, index) in topProducts"
                :key="index"
                class="border-b border-gray-50 hover:bg-gray-50"
              >
                <td class="py-3 px-2 text-gray-400">{{ index + 1 }}</td>
                <td class="py-3 px-2">
                  <span class="text-gray-900 font-medium">{{ p.name }}</span>
                </td>
                <td class="py-3 px-2 text-right text-gray-700">{{ p.soldQuantity || 0 }}</td>
                <td class="py-3 px-2 text-right font-medium text-gray-900">{{ formatPrice(p.revenue || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-sm text-gray-400 text-center py-8">
          Chưa có dữ liệu sản phẩm bán chạy
        </div>
      </div>
    </div>
  </div>
</template>
