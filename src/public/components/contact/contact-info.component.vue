<script>
export default {
  name: 'contact-info'
}
</script>
<template>
  <div class="contact-info">
    <div class="info-item">
      <div class="icon">
        <i class="pi pi-map-marker"></i>
      </div>
      <div class="content">
        <h3>{{ $t('contact.address') }}</h3>
        <p>Av. La Marina 123, Lima, Perú</p>
      </div>
    </div>

    <div class="info-item">
      <div class="icon">
        <i class="pi pi-phone"></i>
      </div>
      <div class="content">
        <h3>{{ $t('contact.phone') }}</h3>
        <p>
          <a href="tel:+51987654321" class="contact-link">+51 987 654 321</a>
        </p>
      </div>
    </div>

    <div class="info-item">
      <div class="icon">
        <i class="pi pi-envelope"></i>
      </div>
      <div class="content">
        <h3>{{ $t('contact.email') }}</h3>
        <p>
          <a href="mailto:info@coolfreeze.com" class="contact-link">info@coolfreeze.com</a>
        </p>
      </div>
    </div>

    <div class="info-item">
      <div class="icon">
        <i class="pi pi-clock"></i>
      </div>
      <div class="content">
        <h3>{{ $t('contact.businessHours') }}</h3>
        <p>{{ $t('contact.mondayToFriday') }}: 9:00 AM - 6:00 PM</p>
        <p>{{ $t('contact.saturday') }}: 9:00 AM - 1:00 PM</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  min-width: 300px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.icon {
  background: #0079c2;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon i {
  font-size: 1.5rem;
}

.content h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.contact-link {
  color: #0079c2;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #005a94;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .contact-info {
    width: 100%;
  }
}
</style>