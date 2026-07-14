<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'default' })

const page = ref(null)
const loading = ref(true)
const error = ref(false)

const faqItems = ref([
  {
    q: 'Làm thế nào để đặt hàng?',
    a: 'Bạn có thể duyệt sản phẩm trên website, thêm vào giỏ hàng và tiến hành thanh toán. Điền đầy đủ thông tin giao hàng và chọn phương thức thanh toán phù hợp.',
  },
  {
    q: 'Tôi có thể hủy đơn hàng không?',
    a: 'Bạn có thể hủy đơn hàng khi đơn đang ở trạng thái "Chờ xử lý". Vào mục "Đơn hàng của tôi" và chọn "Hủy đơn". Nếu đơn đã được xác nhận hoặc đang giao, vui lòng liên hệ hotline để được hỗ trợ.',
  },
  {
    q: 'Thời gian giao hàng bao lâu?',
    a: 'Thời gian giao hàng từ 3-7 ngày làm việc tùy khu vực. Đối với nội thành Hà Nội và TP.HCM, thời gian giao hàng thường là 1-2 ngày.',
  },
  {
    q: 'Tôi có thể đổi trả hàng không?',
    a: 'Chúng tôi hỗ trợ đổi trả trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi kỹ thuật hoặc không đúng mô tả. Sản phẩm phải còn nguyên tem, hộp và chưa qua sử dụng.',
  },
  {
    q: 'Làm thế nào để tra cứu đơn hàng?',
    a: 'Bạn có thể tra cứu đơn hàng bằng cách vào mục "Tra cứu đơn hàng" và nhập mã đơn hàng cùng số điện thoại đặt hàng. Hoặc đăng nhập tài khoản và vào "Đơn hàng của tôi".',
  },
  {
    q: 'Phương thức thanh toán nào được hỗ trợ?',
    a: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng. Đối với đơn hàng online, quý khách có thể thanh toán bằng thẻ tín dụng/ghi nợ qua cổng thanh toán.',
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ?',
    a: 'Bạn có thể gọi hotline 1900 1234 56 (8:00 - 22:00 hàng ngày), gửi email qua fanpage hoặc chat trực tiếp trên website để được hỗ trợ nhanh nhất.',
  },
])

const activeFaq = ref(null)

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}

onMounted(async () => {
  try {
    const api = useApi()
    const res = await api('/pages/help')
    page.value = res.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Trợ giúp</span>
    </nav>

    <div v-if="loading" class="space-y-4">
      <div class="h-10 w-64 skeleton"></div>
      <div class="h-4 w-full skeleton"></div>
      <div class="h-4 w-3/4 skeleton"></div>
    </div>

    <!-- API content -->
    <article v-else-if="page" class="max-w-4xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{{ page.title }}</h1>
      <div class="prose prose-gray max-w-none" v-html="page.content"></div>
    </article>

    <!-- Fallback static help content -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Trung tâm trợ giúp</h1>
        <p class="text-gray-500 max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn. Dưới đây là những câu hỏi thường gặp và thông tin hữu ích.
        </p>
      </div>

      <!-- Contact Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-gray-900 mb-1">Hotline</h3>
          <a href="tel:1900123456" class="text-lg font-bold text-blue-600 hover:text-blue-700">1900 1234 56</a>
          <p class="text-xs text-gray-400 mt-1">8:00 - 22:00 hàng ngày</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-gray-900 mb-1">Email</h3>
          <a href="mailto:info@shopgiadung.com" class="text-sm font-medium text-blue-600 hover:text-blue-700">info@shopgiadung.com</a>
          <p class="text-xs text-gray-400 mt-1">Phản hồi trong 24h</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
          <div class="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-gray-900 mb-1">Chat</h3>
          <p class="text-sm font-medium text-gray-900">Chat trực tiếp</p>
          <p class="text-xs text-gray-400 mt-1">Trên website</p>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Câu hỏi thường gặp</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="transition-colors"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span class="text-sm font-medium text-gray-900">{{ item.q }}</span>
              <svg
                class="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
                :class="activeFaq === index ? 'rotate-180' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="activeFaq === index"
              class="px-6 pb-4"
            >
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="text-center mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Chưa tìm thấy câu trả lời?</h3>
        <p class="text-sm text-gray-500 mb-4">Liên hệ với chúng tôi để được hỗ trợ nhanh nhất</p>
        <a
          href="tel:1900123456"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Gọi 1900 1234 56
        </a>
      </div>
    </div>
  </div>
</template>
