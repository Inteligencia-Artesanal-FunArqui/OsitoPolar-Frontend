<script>
/**
 * @component page-not-found
 * @description 404 page with a way back to a valid route.
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
  <div class="not-found">
    <op-empty-state
        icon="pi pi-compass"
        :title="$t('notFound.title')"
        :message="$t('notFound.message', { path: unavailableRoute })">
      <pv-button :label="$t('notFound.goHome')" icon="pi pi-home" @click="$router.push('/home')" />
    </op-empty-state>
  </div>
</template>

<style scoped>
.not-found { max-width: 640px; margin: var(--op-space-8) auto; }
</style>
