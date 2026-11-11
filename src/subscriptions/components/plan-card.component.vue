<script>
/**
 * @component plan-card
 * @description Displays a subscription plan card with limits, features and upgrade action.
 */
export default {
  name: 'plan-card',
  props: {
    plan: {
      type: Object,
      required: true,
    },
    currentPlanId: {
      type: [String, Number, null],
      required: true,
    },
    upgrading: {
      type: Boolean,
      required: true,
    },
    selectedPlanId: {
      type: [String, Number, null],
      required: true,
    },
    onUpgrade: {
      type: Function,
      required: true,
    },
  },
  computed: {
    // plan features come from the backend in English: show the translated text when we have one, and drop the
    // leading "Up to N units / clients" line (the card already shows the limit in its own row)
    featureList() {
      const limitLine = /^(up to \d+ (units|clients)|manage up to \d+ clients|unlimited clients)$/i;
      return (this.plan.features || []).filter(f => !limitLine.test(f)).map(text => {
        const key = `plans.featureNames.${String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
        return { text, label: this.$te(key) ? this.$t(key) : text };
      });
    },
    isCurrent() {
      return this.currentPlanId !== null && String(this.plan.id) === String(this.currentPlanId);
    },
    // provider plans carry maxClients (null = unlimited); owner plans carry maxEquipment
    isProviderPlan() {
      // the real backend sends maxClients: null on owner plans too, so key off maxEquipment instead
      return !this.plan.maxEquipment;
    },
    limitText() {
      if (this.isProviderPlan) {
        return this.plan.maxClients ? this.$t('plans.maxClients', { count: this.plan.maxClients }) : this.$t('plans.unlimitedClients');
      }
      return this.plan.maxEquipment ? this.$t('plans.maxUnits', { count: this.plan.maxEquipment }) : this.$t('plans.unlimitedUnits');
    }
  },
  methods: {
    handleUpgrade() {
      this.onUpgrade(this.plan);
    },
  },
};
</script>

<template>
  <article class="plan-card op-card" :class="{ 'is-current': isCurrent }">
    <span v-if="isCurrent" class="current-ribbon">{{ $t('plans.currentPlan') }}</span>
    <div class="card-content">
      <h3 class="plan-title">{{ plan.name }}</h3>
      <p class="plan-price">
        <span class="amount">${{ plan.price.toFixed(2) }}</span>
        <span class="period">USD / {{ $t('plans.perMonth') }}</span>
      </p>
      <p class="plan-limit">{{ limitText }}</p>
      <ul class="feature-list">
        <li v-for="feature in featureList" :key="feature.text" class="feature-item">
          <i class="pi pi-check checkmark" aria-hidden="true"></i> {{ feature.label }}
        </li>
      </ul>
    </div>
    <div class="card-footer">
      <pv-button
          v-if="!isCurrent"
          @click="handleUpgrade"
          :disabled="upgrading"
          :label="$t('plans.upgrade')"
          :loading="upgrading && selectedPlanId === plan.id"
          class="w-full"
      />
      <p v-if="upgrading && selectedPlanId === plan.id" class="upgrading-message">
        {{ $t('plans.processingPayment') }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.plan-card:hover { transform: translateY(-4px); box-shadow: var(--op-shadow-md); }
.plan-card.is-current { border-color: var(--op-brand); box-shadow: 0 0 0 2px var(--op-brand-soft), var(--op-shadow-sm); }

.current-ribbon {
  position: absolute;
  top: var(--op-space-3);
  right: var(--op-space-3);
  background: var(--op-brand);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: var(--op-radius-pill);
}

.card-content { padding: var(--op-space-6); flex: 1; text-align: center; }
.plan-title { font-size: 1.25rem; color: var(--op-text-strong); margin-bottom: var(--op-space-2); }
.plan-price { margin-bottom: var(--op-space-2); }
.plan-price .amount { font-size: 2.2rem; font-weight: 700; color: var(--op-brand); }
.plan-price .period { display: block; font-size: 0.85rem; color: var(--op-text-muted); }
.plan-limit { font-weight: 600; color: var(--op-text-strong); margin-bottom: var(--op-space-4); }

.feature-list { list-style: none; padding: 0; margin: 0; text-align: left; display: grid; gap: var(--op-space-2); }
.feature-item { color: var(--op-text); font-size: 0.93rem; display: flex; gap: var(--op-space-2); align-items: flex-start; }
.checkmark { color: var(--op-success); margin-top: 0.2rem; font-size: 0.8rem; }

.card-footer { padding: var(--op-space-4) var(--op-space-6) var(--op-space-6); text-align: center; }
.upgrading-message { color: var(--op-success-text); font-style: italic; margin-top: var(--op-space-2); }
</style>
