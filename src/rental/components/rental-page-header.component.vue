<script>
export default {
  name: 'rental-page-header',
  props: {
    title: {
      type: String,
      required: true
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    backText: {
      type: String,
      default: 'Back to catalog'
    }
  },
  methods: {
    handleBack() {
      this.$emit('navigate-back');
    }
  }
};
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <button
          v-if="showBackButton"
          @click="handleBack"
          class="back-link"
      >
        <i class="pi pi-arrow-left"></i>
        <span>{{ backText }}</span>
      </button>
      <h1>{{ title }}</h1>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 1.5rem 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  background: none;
  border: 1px solid #e1e8ed;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.back-link:hover {
  background: #f0f8ff;
  color: #0079c2;
  border-color: #0079c2;
}

h1 {
  color: #0079c2;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  h1 {
    font-size: 1.5rem;
  }
}
</style>
