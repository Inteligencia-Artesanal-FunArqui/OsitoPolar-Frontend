<script>
import ContactInfo from '../components/contact/contact-info.component.vue';
import SocialLinks from '../components/contact/social-links.component.vue';

export default {
  name: 'contact-page',
  components: {
    ContactInfo,
    SocialLinks
  }
}
</script>
<template>
  <div class="contact-page">
    <h1>{{ $t('contact.title') }}</h1>

    <div class="contact-container">
      <contact-info />
      <social-links />
    </div>
  </div>
</template>


<style scoped>
.contact-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
}

h1 {
  color: #0079c2;
  text-align: center;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .contact-container {
    flex-direction: column;
  }
}
</style>