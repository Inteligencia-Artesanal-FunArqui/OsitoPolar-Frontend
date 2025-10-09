<script>
/**
 * @component App
 * @description Main application component
 */
import Navbar from "./public/components/navbar.component.vue";
import FooterComponent from "./public/components/footer-content.component.vue";

export default {
  name: 'App',
  components: { Navbar, FooterComponent }
}
</script>

<template>
  <Navbar />

  <main>
    <div class="container">
      <router-view />
    </div>
  </main>

  <FooterComponent />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

main {
  min-height: 80vh;
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.container {
  max-width: 85%;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  color: #0079c2;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}
</style>