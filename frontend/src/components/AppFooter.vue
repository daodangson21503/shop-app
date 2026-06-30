<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">🏠 ShopGiaDung</div>
      <div class="footer-text">© 2026 ShopGiaDung — Website </div>
      <div class="footer-contact">
        <span>📞 Hotline: 0789018729</span>
        <span class="divider">|</span>
        <span>✉️ Email: support@shopgiadung.com</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1f1f1f, #2b2b2b);
  color: #bbb;
  padding: 36px 16px 30px;
  margin-top: 48px;
  text-align: center;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.footer-brand {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff424e, #ff7a45);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.footer-text {
  font-size: 13px;
  margin-bottom: 10px;
  color: #999;
}

.footer-contact {
  font-size: 13px;
  color: #ccc;
}

.footer-contact .divider {
  margin: 0 10px;
  color: #555;
}
</style>