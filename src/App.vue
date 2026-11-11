<script>
/**
 * @component App
 * @description Application shell: navbar, routed content, footer and the single global toast / confirm dialog.
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

  <main id="main-content" tabindex="-1">
    <div class="container">
      <router-view :key="$route.path" /><!-- remount when only a param changes (e.g. /equipment/6/analytics -> /equipment/9/analytics) -->
    </div>
  </main>

  <FooterComponent />

  <!-- one shared instance: pages just call this.$toast / this.$confirm -->
  <pv-toast position="top-right" />
  <pv-confirm-dialog />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: var(--op-bg);
  overflow-x: hidden;
}

main {
  flex: 1 0 auto;
  min-height: 60vh;
  background-color: var(--op-bg);
  padding: var(--op-space-6) 0 var(--op-space-8);
  outline: none;
}

.container {
  width: 100%;
  max-width: var(--op-page-max);
  margin: 0 auto;
  padding: 0 var(--op-space-4);
}

.page-title {
  color: var(--op-brand);
  text-align: center;
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
  margin-bottom: var(--op-space-6);
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--op-space-6); }
}
</style>
