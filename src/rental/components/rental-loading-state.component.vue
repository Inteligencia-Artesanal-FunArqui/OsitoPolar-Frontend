<script>
export default {
  name: 'rental-loading-state',
  props: {
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<template>
  <div class="loading-state">
    <div class="loading-spinner"></div>
    <p>{{ message || $t('state.loading') }}</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--op-border);
  border-top: 3px solid var(--op-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  margin: 0;
  font-size: 1rem;
}
</style>