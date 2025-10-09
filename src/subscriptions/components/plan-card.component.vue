<script>
/**
 * @component plan-card
 * @description Displays a subscription plan card with details and upgrade option.
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
  methods: {

    handleUpgrade() {
      this.onUpgrade(this.plan);
    },
  },
};
</script>
<template>
  <pv-card>
    <template #content>
      <div class="card-content">
        <h3 class="plan-title">{{ plan.name }}</h3>
        <p class="plan-price">${{ plan.price.toFixed(2) }} USD/month</p>
        <p class="plan-limit" v-if="plan.maxEquipment">Up to {{ plan.maxEquipment }} units</p>
        <p class="plan-limit" v-if="plan.maxClients">Manage up to {{ plan.maxClients || 'Unlimited' }} clients</p>
        <ul class="feature-list">
          <li v-for="feature in plan.features" :key="feature" class="feature-item">
            <span class="checkmark">✔</span> {{ feature }}
          </li>
        </ul>
      </div>
      <div class="card-footer">
        <pv-button
            v-if="plan.id !== currentPlanId"
            @click="handleUpgrade"
            :disabled="upgrading"
            :label="$t('plans.upgrade')"
            :loading="upgrading && selectedPlanId === plan.id"
        />
        <p v-if="upgrading && selectedPlanId === plan.id" class="upgrading-message">
          {{ $t('plans.processingPayment')}}
        </p>
        <p v-else-if="plan.id === currentPlanId" class="current-plan-message">
          {{ $t('plans.currentPlan') }}</p>
      </div>
    </template>
  </pv-card>
</template>
<style scoped>
.p-card {
  display: flex;
  height: 100%;
  padding: 1rem;
  width: 480px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  transition: transform 0.2s;
  min-height: 550px;
}

.p-card:hover {
  transform: translateY(-5px);
}

.card-content {
  padding: 20px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 450px;
  overflow-y: auto;
}

.card-footer {
  padding: 10px 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  min-height: 60px;
}

.plan-price {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.plan-limit {
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
  text-align: left;
}

.feature-list li {
  margin: 10px 0;
  color: #666;
  font-size: 0.95rem;
}

.checkmark {
  color: #4CAF50;
  margin-right: 8px;
}

.p-button {
  display: block;
  width: 100%;
  background-color: #0079c2;
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.p-button:hover:not(:disabled) {
  background-color: #005f99;
}

.p-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.upgrading-message {
  color: #4CAF50;
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 10px;
}

.current-plan-message {
  font-size: large;
  color: #0079c2;
  font-weight: bold;
  margin-top: 10px;
}



</style>