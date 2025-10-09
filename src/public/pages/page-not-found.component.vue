<script>
/**
 * @component page-not-found
 * @description Error page displayed when a route is not found
 * Provides navigation back to valid application routes
 */
export default {
  name: "page-not-found",
  data() {
    return {
      unavailableRoute: null,
    }
  },
  created() {
    this.unavailableRoute = this.$route.path;
  }
}
</script>

<template>
  <div class="w-full">
    <h1>Page not found</h1>
    <p>The path {{ unavailableRoute }} is not available.</p>
    <router-link to="/home">Go to Home</router-link>
  </div>
</template>

<style scoped>

</style>