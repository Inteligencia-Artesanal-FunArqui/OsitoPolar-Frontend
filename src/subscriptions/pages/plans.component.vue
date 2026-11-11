<script>
import { subscriptionService } from '../services/subscription.service.js';
import PlanCard from '../components/plan-card.component.vue';
import authService from '../../iam/services/auth.service.js';

export default {
  name: 'Plans',
  components: {
    PlanCard
  },
  data() {
    return {
      plans: [],
      // plan the signed-in account is on (sign-in payload carries planId on the real backend)
      currentPlanId: authService.getCurrentUser()?.planId ?? null,
      userType: 'user',
      loading: false,
      upgrading: false,
      selectedPlanId: null,
      error: null
    };
  },
  computed: {
    currentPlan() {
      return this.plans.find(plan => String(plan.id) === String(this.currentPlanId));
    }
  },
  async created() {
    await this.fetchPlans();
    this.checkPaymentResult();
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      this.error = null;

      try {
        this.plans = await subscriptionService.getPlans(this.userType);
      } catch (error) {
        console.error('Error loading plans:', error);
        this.error = this.$t('plans.loadError');
      } finally {
        this.loading = false;
      }
    },

    async switchUserType(userType) {
      if (this.userType !== userType) {
        this.userType = userType;
        await this.fetchPlans();
      }
    },

    async handleUpgrade(plan) {
      this.selectedPlanId = plan.id;
      this.upgrading = true;
      this.error = null;

      try {
        const userId = authService.getCurrentUser()?.id ?? 1;

        // Create Stripe checkout session
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/plans?payment=success`;
        const cancelUrl = `${baseUrl}/plans?payment=cancelled`;

        await subscriptionService.createCheckoutSession(
            userId,
            plan.id,
            successUrl,
            cancelUrl
        );

        // createCheckoutSession navigates the browser to Stripe; nothing else to do on success.
      } catch (error) {
        console.error('Error upgrading plan:', error);
        this.error = null;

        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: error.response?.data?.message || this.$t('plans.paymentError'),
          life: 5000
        });
      } finally {
        this.upgrading = false;
        this.selectedPlanId = null;
      }
    },

    checkPaymentResult() {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      if (paymentStatus === 'success' && sessionId) {
        this.handlePaymentSuccess(sessionId);
      } else if (paymentStatus === 'cancelled') {
        this.handlePaymentCancellation();
      }
    },

    async handlePaymentSuccess(sessionId) {
      try {
        this.$toast.add({
          severity: 'success',
          summary: this.$t('plans.paymentSuccess'),
          detail: this.$t('plans.paymentSuccessDetail'),
          life: 5000
        });

        // Reload plans to show updated state
        await this.fetchPlans();
      } catch (error) {
        console.error('Error processing payment success:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('plans.paymentConfirmError'),
          life: 5000
        });
      }

      // Clean up URL
      this.cleanupUrl();
    },

    async handlePaymentCancellation() {
      this.$toast.add({
        severity: 'warn',
        summary: this.$t('plans.paymentCancelled'),
        detail: this.$t('plans.paymentCancelledDetail'),
        life: 5000
      });

      // Clean up URL
      this.cleanupUrl();
    },

    cleanupUrl() {
      const url = new URL(window.location);
      url.searchParams.delete('payment');
      url.searchParams.delete('session_id');
      url.searchParams.delete('plan_id');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }
};
</script>

<template>
  <div class="plans-container">
    <op-page-header :title="$t('plans.heading')" :subtitle="$t('plans.subtitle')" />

    <div class="user-type-selector" role="tablist">
      <pv-button
          role="tab"
          :aria-selected="userType === 'user'"
          :label="$t('plans.forUsers')"
          icon="pi pi-user"
          :severity="userType === 'user' ? undefined : 'secondary'"
          :outlined="userType !== 'user'"
          @click="switchUserType('user')" />
      <pv-button
          role="tab"
          :aria-selected="userType === 'provider'"
          :label="$t('plans.forProviders')"
          icon="pi pi-building"
          :severity="userType === 'provider' ? undefined : 'secondary'"
          :outlined="userType !== 'provider'"
          @click="switchUserType('provider')" />
    </div>

    <op-loading-state v-if="loading" :label="$t('plans.loading')" />
    <op-error-state v-else-if="error" :message="error" @retry="fetchPlans" />

    <div v-else-if="plans.length > 0" class="plans-grid">
      <plan-card
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="currentPlanId"
          :upgrading="upgrading && selectedPlanId === plan.id"
          :selected-plan-id="selectedPlanId"
          :on-upgrade="handleUpgrade"
      />
    </div>

    <op-empty-state v-else icon="pi pi-credit-card" :title="$t('plans.noPlans')" />
  </div>
</template>

<style scoped>
.user-type-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--op-space-3);
  margin-bottom: var(--op-space-6);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--op-space-5);
  align-items: stretch;
}
</style>
