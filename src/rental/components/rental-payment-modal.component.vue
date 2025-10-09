<script>
export default {
  name: 'rental-payment-modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    rentalDetails: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      paymentMethod: 'card',
      acceptTerms: false,
      processing: false
    };
  },
  computed: {
    canProceed() {
      return this.acceptTerms && !this.processing;
    }
  },
  methods: {
    async processPayment() {
      if (!this.canProceed) return;

      this.processing = true;

      try {
        this.$emit('process-payment', {
          paymentMethod: this.paymentMethod,
          rentalDetails: this.rentalDetails
        });
      } catch (error) {
        console.error('Payment processing error:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error processing payment',
          life: 3000
        });
      } finally {
        this.processing = false;
      }
    },

    closeModal() {
      this.$emit('update:visible', false);
      this.resetForm();
    },

    resetForm() {
      this.paymentMethod = 'card';
      this.acceptTerms = false;
      this.processing = false;
    }
  }
}
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="closeModal"
      :modal="true"
      :closable="!processing"
      :header="$t('rental.payment.confirmRental')"
      :style="{ width: '500px' }"
  >
    <div class="payment-modal-content">
      <div class="rental-summary">
        <h3>{{ $t('rental.payment.rentalSummary') }}</h3>
        <div class="summary-item">
          <span>{{ $t('rental.payment.equipment') }}:</span>
          <span>{{ rentalDetails.equipmentName }}</span>
        </div>
        <div class="summary-item">
          <span>Period:</span>
          <span>{{ rentalDetails.months }} months</span>
        </div>
        <div class="summary-item">
          <span>Monthly price:</span>
          <span>${{ rentalDetails.monthlyPrice }}</span>
        </div>
        <div class="summary-item total">
          <span>First month total:</span>
          <span>${{ rentalDetails.firstPayment }}</span>
        </div>
      </div>

      <div class="payment-methods">
        <h3>Payment Method</h3>
        <pv-radiobutton
            v-model="paymentMethod"
            inputId="card"
            value="card"
        />
        <label for="card" class="payment-option">
          <i class="pi pi-credit-card"></i>
          Credit/Debit Card
        </label>

        <pv-radiobutton
            v-model="paymentMethod"
            inputId="transfer"
            value="transfer"
        />
        <label for="transfer" class="payment-option">
          <i class="pi pi-building"></i>
          Bank Transfer
        </label>
      </div>

      <div class="terms-section">
        <pv-checkbox
            v-model="acceptTerms"
            inputId="terms"
            :binary="true"
        />
        <label for="terms">
          I accept the <a href="#" @click.prevent>terms and conditions</a> of the rental service
        </label>
      </div>
    </div>

    <template #footer>
      <pv-button
          label="Cancel"
          @click="closeModal"
          class="p-button-text"
          :disabled="processing"
      />
      <pv-button
          label="Confirm and Pay"
          @click="processPayment"
          class="p-button-success"
          :loading="processing"
          :disabled="!canProceed"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>

.payment-modal-content {
  padding: 1rem 0;
}

.rental-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.rental-summary h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item.total {
  border-bottom: none;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #dee2e6;
  font-weight: 600;
  font-size: 1.1rem;
}

.payment-methods {
  margin-bottom: 2rem;
}

.payment-methods h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.payment-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  margin-right: 1.5rem;
  cursor: pointer;
}

.terms-section {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.terms-section label {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms-section a {
  color: #0079c2;
  text-decoration: none;
}

.terms-section a:hover {
  text-decoration: underline;
}
</style>