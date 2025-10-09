<script>
/**
 * @component footer
 * @description Footer component displayed at the bottom of the application
 * Contains copyright information, links, and company details
 * Now with full i18n support
 */
export default {
  name: "footer-component",
  data() {
    return {
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    links() {
      return [
        { label: this.$t('footer.terms'), url: '#' },
        { label: this.$t('footer.privacy'), url: '#' },
        { label: this.$t('footer.cookies'), url: '#' }
      ]
    }
  }
}
</script>

<template>
  <div class="footer-container">
    <div class="footer-content">
      <div class="footer-copyright">
        &copy; {{ currentYear }} {{ $t('footer.company') }}. {{ $t('footer.rights') }}.
      </div>
      <div class="footer-links">
        <a v-for="link in links" :key="link.url" :href="link.url" class="footer-link">
          {{ link.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-container {
  background-color: white;
  border-top: 1px solid #e0e0e0;
  padding: 2.5rem 0;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.footer-copyright {
  color: #666;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  color: #0079c2;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  text-decoration: underline;
  color: #005a91;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 2rem 0;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-link {
    font-size: 0.85rem;
  }
}
</style>