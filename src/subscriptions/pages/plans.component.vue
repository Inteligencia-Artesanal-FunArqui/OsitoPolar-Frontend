<template>
  <div class="plans-container">
    <h1 class="plans-title">Choose Your Plan</h1>

    <!-- User Type Selector -->
    <div class="user-type-selector">
      <pv-button
          :class="['type-btn', { active: userType === 'user' }]"
          @click="switchUserType('user')"
          label="For Users" />
      <pv-button
          :class="['type-btn', { active: userType === 'provider' }]"
          @click="switchUserType('provider')"
          label="For Providers" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>Loading plans...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <pv-message severity="error" :closable="false">
        {{ error }}
      </pv-message>
      <pv-button @click="fetchPlans" label="Retry" />
    </div>

    <!-- Plans Grid -->
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

    <!-- No Plans State -->
    <div v-else class="no-plans">
      No plans available
    </div>

    <!-- Toast Messages -->
    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { subscriptionService } from '../services/subscription.service.js';
import PlanCard from '../components/plan-card.component.vue';

export default {
  name: 'Plans',
  components: {
    PlanCard
  },
  data() {
    return {
      plans: [],
      currentPlanId: null,
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
        console.log('Fetching plans for userType:', this.userType);
        this.plans = await subscriptionService.getPlans(this.userType);
        console.log('Plans loaded:', this.plans);

        if (this.plans.length === 0) {
          this.error = 'No plans available for this user type.';
        }
      } catch (error) {
        console.error('Error loading plans:', error);
        this.error = 'Failed to load plans. Check your server connection.';
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
        const userId = 1; // TODO: Get from auth

        console.log('Upgrading to plan:', plan);

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

        // Should redirect to Stripe, if we get here there was an error
        throw new Error('Failed to redirect to payment');

      } catch (error) {
        console.error('Error upgrading plan:', error);
        this.error = error.message || 'Failed to initiate payment. Please try again.';

        this.$refs.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error,
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
        console.log('Payment successful for session:', sessionId);

        this.$refs.toast.add({
          severity: 'success',
          summary: 'Payment Successful',
          detail: 'Your subscription has been updated successfully!',
          life: 5000
        });

        // Reload plans to show updated state
        await this.fetchPlans();
      } catch (error) {
        console.error('Error processing payment success:', error);
        this.$refs.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error processing payment confirmation',
          life: 5000
        });
      }

      // Clean up URL
      this.cleanupUrl();
    },

    async handlePaymentCancellation() {
      console.log('Payment was cancelled by user');

      this.$refs.toast.add({
        severity: 'warn',
        summary: 'Payment Cancelled',
        detail: 'You can upgrade your plan anytime',
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

<style scoped>
.plans-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.plans-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.user-type-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
}

.type-btn.active {
  background-color: #3498db;
  color: white;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.no-plans {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>