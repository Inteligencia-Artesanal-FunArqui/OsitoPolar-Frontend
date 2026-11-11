<script>
/**
 * @component footer
 * @description Footer with brand, quick public links and copyright.
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
        { label: this.$t('nav.about'), to: '/about' },
        { label: this.$t('nav.contact'), to: '/contact' }
      ]
    }
  }
}
</script>

<template>
  <footer class="footer-container">
    <div class="footer-content">
      <div class="footer-copyright">
        &copy; {{ currentYear }} {{ $t('footer.company') }}. {{ $t('footer.rights') }}.
      </div>
      <nav class="footer-links">
        <router-link v-for="link in links" :key="link.to" :to="link.to" class="footer-link">
          {{ link.label }}
        </router-link>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  background-color: var(--op-surface);
  border-top: 1px solid var(--op-border);
  padding: var(--op-space-6) 0;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--op-space-4);
  padding: 0 var(--op-space-6);
}

.footer-copyright {
  color: var(--op-text-muted);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: var(--op-space-5);
}

.footer-link {
  color: var(--op-brand);
  font-size: 0.9rem;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
  color: var(--op-brand-strong);
}

@media (max-width: 640px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    padding: 0 var(--op-space-4);
  }
}
</style>
