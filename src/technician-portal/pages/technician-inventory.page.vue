<script>
import service from '../services/technician-portal.service.js';

/** @component TechnicianInventoryPage - synthetic field stock: tools and parts, with low-stock flags. */
export default {
  name: 'TechnicianInventoryPage',
  data() { return { items: [], loading: true, failed: false }; },
  computed: {
    groups() {
      return [
        { kind: 'tool', title: 'technician.inventory.tools', icon: 'pi pi-wrench', rows: this.items.filter(i => i.kind === 'tool') },
        { kind: 'part', title: 'technician.inventory.parts', icon: 'pi pi-cog', rows: this.items.filter(i => i.kind === 'part') }
      ].filter(g => g.rows.length);
    }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try { this.items = await service.getInventory(); } catch { this.failed = true; } finally { this.loading = false; }
    }
  }
};
</script>

<template>
  <div>
    <div class="tp-page-head"><h1>{{ $t('technician.inventory.title') }}</h1><p>{{ $t('technician.inventory.subtitle') }}</p></div>
    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <op-empty-state v-else-if="!items.length" icon="pi pi-wrench" :title="$t('technician.inventory.emptyTitle')" :message="$t('technician.inventory.emptyMessage')" />
    <template v-else>
      <section v-for="g in groups" :key="g.kind">
        <h2 class="tp-section-title"><i :class="g.icon" aria-hidden="true"></i> {{ $t(g.title) }}</h2>
        <ul class="tp-card list">
          <li v-for="i in g.rows" :key="i.id" :class="{ low: i.lowStock }">
            <div class="what"><strong>{{ i.name }}</strong><small>{{ i.sku }}</small></div>
            <div class="qty">
              <span class="n">{{ i.quantity }} {{ i.unit }}</span>
              <small>{{ $t('technician.inventory.minimum') }}: {{ i.minQuantity }}</small>
              <span v-if="i.lowStock" class="flag">{{ $t('technician.inventory.lowStock') }}</span>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.list { list-style: none; padding: 0; overflow: hidden; }
.list li { display: flex; justify-content: space-between; align-items: center; gap: var(--op-space-3); padding: var(--op-space-3) var(--op-space-4); min-height: 60px; }
.list li + li { border-top: 1px solid var(--op-border); }
.list li.low { background: var(--op-warn-soft); }
.what, .qty { display: flex; flex-direction: column; }
.qty { align-items: flex-end; }
small { color: var(--op-text-muted); font-size: 0.78rem; }
.n { font-weight: 800; color: var(--op-text-strong); }
.flag { margin-top: 2px; font-size: 0.72rem; font-weight: 700; color: var(--op-warn-text); background: var(--op-warn-soft); border: 1px solid var(--op-warn-border); border-radius: var(--op-radius-pill); padding: 0 8px; }
</style>
