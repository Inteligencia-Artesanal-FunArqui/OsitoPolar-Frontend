<template>
  <div class="social-links">
    <h2>{{ $t('contact.followUs') }}</h2>

    <div class="social-grid">
      <a href="https://facebook.com/coolfreeze" target="_blank" rel="noopener noreferrer" class="social-item facebook">
        <i class="pi pi-facebook"></i>
        <span>Facebook</span>
      </a>

      <a href="https://twitter.com/coolfreeze" target="_blank" rel="noopener noreferrer" class="social-item twitter">
        <i class="pi pi-twitter"></i>
        <span>Twitter</span>
      </a>

      <a href="https://linkedin.com/company/coolfreeze" target="_blank" rel="noopener noreferrer" class="social-item linkedin">
        <i class="pi pi-linkedin"></i>
        <span>LinkedIn</span>
      </a>

      <a href="https://instagram.com/coolfreeze" target="_blank" rel="noopener noreferrer" class="social-item instagram">
        <i class="pi pi-instagram"></i>
        <span>Instagram</span>
      </a>
    </div>

    <div class="qr-code">
      <img src="" alt="Scan for contact info" />
      <p>{{ $t('contact.scanQR') }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'social-links'
}
</script>

<style scoped>
.social-links {
  flex: 1;
  min-width: 300px;
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
}

.social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.social-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.facebook {
  background: #1877F2;
}

.twitter {
  background: #1DA1F2;
}

.linkedin {
  background: #0A66C2;
}

.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-item i {
  font-size: 1.5rem;
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  text-align: center;
}

.qr-code img {
  width: 150px;
  height: 150px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 0.5rem;
  background: white;
  margin-bottom: 1rem;
}

.qr-code p {
  color: #666;
  margin: 0;
}

@media (max-width: 500px) {
  .social-grid {
    grid-template-columns: 1fr;
  }
}
</style>