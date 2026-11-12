<script>
import service from '../services/technician-portal.service.js';
import authService from '../../iam/services/auth.service.js';
import { formatDate } from '../../shared/format.js';

/** @component TechnicianProfilePage - technician details plus the closed-work history. */
export default {
  name: 'TechnicianProfilePage',
  data() { return { profile: null, history: [], loading: true, failed: false, user: authService.getCurrentUser() }; },
  computed: {
    tech() { return this.profile?.technicianProfile || null; },
    rows() {
      const t = this.tech; if (!t) return [];
      return [
        ['technician.profile.name', t.name], ['technician.profile.specialization', t.specialization], ['technician.profile.phone', t.phone],
        ['technician.profile.email', this.profile.email], ['technician.profile.company', t.companyName],
        ['technician.profile.member', formatDate(this.profile.memberSince, this.$i18n.locale)]
      ];
    }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try { [this.profile, this.history] = await Promise.all([service.getProfile(), service.getHistory()]); } catch { this.failed = true; } finally { this.loading = false; }
    },
    day(date) { return date ? formatDate(date, this.$i18n.locale) : ''; }
  }
};
</script>

<template>
  <div>
    <div class="tp-page-head"><h1>{{ $t('technician.profile.title') }}</h1><p>{{ $t('technician.profile.subtitle') }}</p></div>
    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed || !tech" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <template v-else>
      <div class="tp-card who">
        <span class="avatar" aria-hidden="true">{{ tech.name.charAt(0) }}</span>
        <div>
          <h2>{{ tech.name }}</h2>
          <div class="tp-meta"><op-status-badge kind="availability" :value="tech.availability" /><span><i class="pi pi-star-fill" aria-hidden="true"></i>{{ tech.averageRating.toFixed(1) }}</span></div>
        </div>
      </div>
      <div class="two">
        <div class="tp-card stat"><strong>{{ tech.activeOrders }}</strong><span>{{ $t('technician.profile.active') }}</span></div>
        <div class="tp-card stat"><strong>{{ tech.completedOrders }}</strong><span>{{ $t('technician.profile.done') }}</span></div>
      </div>
      <dl class="tp-card data">
        <div v-for="[label, value] in rows" :key="label"><dt>{{ $t(label) }}</dt><dd>{{ value }}</dd></div>
      </dl>

      <h2 class="tp-section-title">{{ $t('technician.profile.history') }}</h2>
      <p v-if="!history.length" class="muted">{{ $t('technician.profile.historyEmpty') }}</p>
      <ul v-else class="tp-card history">
        <li v-for="w in history" :key="w.id">
          <router-link :to="{ name: 'technician-order-detail', params: { id: w.id } }">
            <span class="tp-row"><strong>{{ w.title }}</strong><op-status-badge kind="workOrderStatus" :value="w.status" /></span>
            <small>{{ w.workOrderNumber }} · {{ w.equipment?.name }} · {{ day(w.actualCompletionDate || w.scheduledDate) }}<template v-if="w.cost"> · {{ $t('technician.profile.cost') }} USD {{ w.cost }}</template></small>
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.who { display: flex; align-items: center; gap: var(--op-space-4); }
.who h2 { font-size: 1.3rem; color: var(--op-text-strong); }
.avatar { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; background: var(--tp-ink); color: #fff; font-size: 1.5rem; font-weight: 800; }
.who i { color: var(--op-warn); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: var(--op-space-3); margin: var(--op-space-3) 0; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat strong { font-size: 1.8rem; color: var(--op-brand-strong); }
.stat span { font-size: 0.8rem; color: var(--op-text-muted); font-weight: 600; text-align: center; }
.data div { display: flex; justify-content: space-between; gap: var(--op-space-3); padding: var(--op-space-2) 0; border-bottom: 1px solid var(--op-border); }
.data div:last-child { border-bottom: 0; }
dt { color: var(--op-text-muted); }
dd { font-weight: 600; color: var(--op-text-strong); text-align: right; }
.muted { color: var(--op-text-muted); }
.history { list-style: none; padding: 0; overflow: hidden; }
.history li + li { border-top: 1px solid var(--op-border); }
.history a { display: flex; flex-direction: column; gap: 2px; padding: var(--op-space-3) var(--op-space-4); text-decoration: none; color: inherit; min-height: 56px; }
.history small { color: var(--op-text-muted); }
</style>
