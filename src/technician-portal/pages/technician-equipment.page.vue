<script>
import service from '../services/technician-portal.service.js';
import { equipmentTypeKey } from '../../shared/badge-tokens.js';
import { formatDate } from '../../shared/format.js';

/** @component TechnicianEquipmentPage - units that appear in the technician's work orders. */
export default {
  name: 'TechnicianEquipmentPage',
  data() { return { items: [], loading: true, failed: false }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try { this.items = await service.getEquipment(); } catch { this.failed = true; } finally { this.loading = false; }
    },
    typeLabel(type) { const key = equipmentTypeKey(type); return this.$te(key) ? this.$t(key) : type; },
    last(date) { return date ? formatDate(date, this.$i18n.locale) : this.$t('technician.equipment.never'); }
  }
};
</script>

<template>
  <div>
    <div class="tp-page-head"><h1>{{ $t('technician.equipment.title') }}</h1><p>{{ $t('technician.equipment.subtitle') }}</p></div>
    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <op-empty-state v-else-if="!items.length" icon="pi pi-box" :title="$t('technician.equipment.emptyTitle')" :message="$t('technician.equipment.emptyMessage')" />
    <div v-else class="tp-grid">
      <article v-for="e in items" :key="e.id" class="tp-card unit">
        <div class="tp-row"><h3>{{ e.name }}</h3><op-status-badge kind="temperature" :value="e.temperatureStatus" /></div>
        <p class="sub">{{ typeLabel(e.type) }} · {{ e.manufacturer }} {{ e.model }}</p>
        <p class="temp">{{ e.currentTemperature }} °C</p>
        <dl>
          <div><dt>{{ $t('technician.equipment.setpoint') }}</dt><dd>{{ e.setTemperature }} °C</dd></div>
          <div><dt>{{ $t('technician.equipment.range') }}</dt><dd>{{ e.optimalTemperatureMin }} / {{ e.optimalTemperatureMax }} °C</dd></div>
          <div><dt>{{ $t('technician.equipment.serial') }}</dt><dd>{{ e.serialNumber }}</dd></div>
          <div><dt>{{ $t('technician.equipment.openOrders') }}</dt><dd>{{ e.openOrders }}</dd></div>
          <div><dt>{{ $t('technician.equipment.lastService') }}</dt><dd>{{ last(e.lastServiceDate) }}</dd></div>
        </dl>
        <p class="tp-meta"><span><i class="pi pi-map-marker" aria-hidden="true"></i>{{ e.locationName }} · {{ e.locationAddress }}</span></p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.unit { display: flex; flex-direction: column; gap: var(--op-space-2); }
.unit h3 { font-size: 1.05rem; color: var(--op-text-strong); }
.sub { color: var(--op-text-muted); font-size: 0.88rem; }
.temp { font-size: 2rem; font-weight: 800; color: var(--op-brand-strong); line-height: 1.1; }
dl { display: grid; gap: 4px; }
dl div { display: flex; justify-content: space-between; gap: var(--op-space-3); font-size: 0.9rem; border-bottom: 1px dashed var(--op-border); padding: 2px 0; }
dt { color: var(--op-text-muted); }
dd { font-weight: 600; color: var(--op-text-strong); text-align: right; }
</style>
