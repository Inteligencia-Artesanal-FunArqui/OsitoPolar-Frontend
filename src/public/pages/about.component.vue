<script>
/**
 * @component about
 * @description About page: what OsitoPolar is, its mission and vision (all copy through i18n).
 */
export default {
  name: "about"
}
</script>

<template>
  <div class="about-page">
    <op-page-header :title="$t('about.title')" :subtitle="$t('about.intro')" />

    <div class="about-grid">
      <section class="op-card">
        <i class="pi pi-flag about-icon" aria-hidden="true"></i>
        <h2>{{ $t('about.missionTitle') }}</h2>
        <p>{{ $t('about.mission') }}</p>
      </section>

      <section class="op-card">
        <i class="pi pi-eye about-icon" aria-hidden="true"></i>
        <h2>{{ $t('about.visionTitle') }}</h2>
        <p>{{ $t('about.vision') }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page { max-width: 960px; margin: 0 auto; }
.about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: var(--op-space-5); }
.about-icon { font-size: 1.6rem; color: var(--op-brand); margin-bottom: var(--op-space-3); }
.about-grid h2 { font-size: 1.2rem; color: var(--op-text-strong); margin-bottom: var(--op-space-2); }
.about-grid p { color: var(--op-text); line-height: 1.65; }
</style>
