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
    <op-page-header :title="$t('contact.title')" :subtitle="$t('contact.subtitle')" />

    <div class="contact-container">
      <contact-info />
      <social-links />
    </div>
  </div>
</template>


<style scoped>
.contact-page { max-width: 1100px; margin: 0 auto; }

.contact-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: var(--op-space-6);
  align-items: start;
}
</style>
