<script>
export default {
  name: "language-switcher",
  computed: {
    currentLanguageCode() {
      return this.$i18n.locale;
    },
    isEnglish() {
      return this.currentLanguageCode === 'en';
    }
  },
  methods: {
    toggleLanguage() {
      const newLang = this.currentLanguageCode === 'en' ? 'es' : 'en';
      this.$i18n.locale = newLang;
      localStorage.setItem('user-language', newLang);
    }
  },
  mounted() {
    const savedLang = localStorage.getItem('user-language');
    if (savedLang && ['en', 'es'].includes(savedLang)) {
      this.$i18n.locale = savedLang;
    } else if (!this.$i18n.locale) {
      this.$i18n.locale = 'en';
    }
  }
}
</script>

<template>
  <button
      @click="toggleLanguage"
      class="language-toggle"
      :class="{ 'is-spanish': !isEnglish }"
      :aria-label="isEnglish ? 'Switch to Spanish' : 'Cambiar a Inglés'"
  >
    <span class="language-code">{{ currentLanguageCode.toUpperCase() }}</span>
  </button>
</template>

<style scoped>
.language-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  padding: 0 12px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  overflow: hidden;
}

.language-toggle:hover {
  border-color: #0079c2;
  background: #f0f9ff;
  transform: translateY(-1px);
}

.language-toggle:active {
  transform: translateY(0);
}

.language-code {
  font-size: 14px;
  font-weight: 700;
  color: #0079c2;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

/* Efecto de onda al hacer click */
.language-toggle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 121, 194, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.language-toggle:active::before {
  width: 100px;
  height: 100px;
}


.language-toggle.is-spanish {
  background: #0079c2;
  border-color: #0079c2;
}

.language-toggle.is-spanish .language-code {
  color: #ffffff;
}

.language-toggle.is-spanish:hover {
  background: #005a91;
  border-color: #005a91;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .language-toggle {
    min-width: 44px;
    height: 32px;
    padding: 0 10px;
  }

  .language-code {
    font-size: 13px;
  }
}


.mobile-menu-dialog .language-toggle {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
}

.mobile-menu-dialog .language-code {
  font-size: 16px;
}


@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.language-toggle {
  animation: slideIn 0.3s ease;
}

.language-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.2);
}

.language-toggle:focus:not(:focus-visible) {
  box-shadow: none;
}
</style>