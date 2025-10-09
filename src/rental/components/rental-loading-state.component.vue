<script>
export default {
  name: 'rental-loading-state',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  }
}
</script>

<template>
  <div class="loading-state">
    <div class="loading-spinner"></div>
    <p>{{ message }}</p>
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
  border: 3px solid #e1e8ed;
  border-top: 3px solid #0079c2;
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