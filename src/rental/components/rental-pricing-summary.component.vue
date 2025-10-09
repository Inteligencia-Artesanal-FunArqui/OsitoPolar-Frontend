<script>
import { RentalPricingService } from '../services/rental-pricing.service.js';
import { RentalRequestService } from '../services/rental-request.service.js';
import { RentalPaymentService } from '../services/rental-payment.service.js';

export default {
  name: 'rental-pricing-summary',
  props: {
    equipment: {
      type: Object,
      default: null
    },
    configuration: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pricing: null,
      monthlyTotal: 0,
      setupTotal: 0,
      firstPayment: 0,
      isSubmitting: false,

      pricingService: null,
      requestService: null,
      paymentService: null
    };
  },
  computed: {
    discountPercentage() {
      if (!this.pricing?.discounts || !this.configuration?.rentalMonths || this.configuration.rentalMonths < 3) return 0;
      return this.pricingService.getApplicableDiscount(this.configuration.rentalMonths, this.pricing.discounts);
    },

    originalMonthlyPrice() {
      if (!this.pricing || !this.configuration) return 0;
      return this.pricing.baseMonthlyPrice * this.configuration.quantity;
    },

    canSubmit() {
      return this.configuration?.deliveryAddress?.trim() &&
          this.configuration?.preferredDate &&
          !this.isSubmitting;
    }
  },
  watch: {
    equipment: {
      immediate: true,
      handler() {
        if (this.equipment) {
          this.loadPricing();
        }
      }
    },
    configuration: {
      deep: true,
      handler() {
        if (this.configuration && this.pricing) {
          this.calculateTotals();
        }
      }
    }
  },
  created() {
    this.pricingService = new RentalPricingService();
    this.requestService = new RentalRequestService();
    this.paymentService = new RentalPaymentService();
  },
  methods: {
    async loadPricing() {
      try {
        const response = await this.pricingService.getRentalPricing(this.equipment.id);
        this.pricing = response.data[0];
        if (this.configuration) {
          this.calculateTotals();
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
      }
    },

    calculateTotals() {
      if (!this.pricing || !this.configuration) return;

      const discount = this.pricingService.getApplicableDiscount(
          this.configuration.rentalMonths,
          this.pricing.discounts || []
      );

      const baseMonthly = this.pricing.baseMonthlyPrice * this.configuration.quantity;
      this.monthlyTotal = this.pricingService.calculateDiscountedPrice(baseMonthly, discount);

      this.setupTotal = (this.pricing.setupFee + this.pricing.deliveryFee) * this.configuration.quantity;
      this.firstPayment = this.monthlyTotal + this.setupTotal;

      this.$emit('pricing-update', {
        monthlyTotal: this.monthlyTotal,
        setupTotal: this.setupTotal,
        firstPayment: this.firstPayment,
        discountPercentage: this.discountPercentage
      });
    },

    async submitCheckout() {
      if (!this.canSubmit) {
        this.showValidationErrors();
        return;
      }

      try {
        this.isSubmitting = true;

        const requestData = {
          userId: this.$store.state.user?.id || '1',
          rentalEquipmentId: this.equipment.id,
          quantity: this.configuration.quantity,
          rentalPeriodMonths: this.configuration.rentalMonths,
          deliveryAddress: this.configuration.deliveryAddress,
          preferredStartDate: this.configuration.preferredDate.toISOString(),
          notes: this.configuration.notes || '',
          totalMonthlyPrice: this.monthlyTotal,
          totalSetupCost: this.setupTotal,
          status: 'draft'
        };

        // 1. Create rental request
        const response = await this.requestService.createRentalRequest(requestData);

        if (response.data.id) {
          // 2. Submit request for approval
          await this.requestService.submitRentalRequest(response.data.id);

          // 3. Get Stripe checkout URL from C# backend
          const checkoutResponse = await this.paymentService.getCheckoutUrl(response.data.id);

          // 4. Redirect to Stripe hosted checkout
          if (checkoutResponse.data.checkoutUrl && checkoutResponse.data.checkoutUrl !== '#payment-simulation') {
            window.location.href = checkoutResponse.data.checkoutUrl;
          } else {
            // For demo purposes, show success message
            this.$toast.add({
              severity: 'success',
              summary: 'Solicitud Enviada',
              detail: 'Tu solicitud de alquiler ha sido enviada exitosamente',
              life: 5000
            });

            this.$emit('checkout-submit', response.data);
          }
        }
      } catch (error) {
        console.error('Error submitting rental request:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar tu solicitud',
          life: 3000
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    showValidationErrors() {
      if (!this.configuration?.deliveryAddress?.trim()) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Required Fields',
          detail: 'Please enter a delivery address',
          life: 3000
        });
        return;
      }

      if (!this.configuration?.preferredDate) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Required Fields',
          detail: 'Please select a preferred start date',
          life: 3000
        });
        return;
      }
    }
  }
}
</script>

<template>
  <div class="summary-card">
    <div class="card-header">
      <h2>{{ $t('rental.summary.costSummary') }}</h2>
    </div>

    <div class="price-breakdown">
      <div class="price-item">
        <span>{{ $t('rental.summary.monthlyRent') }}</span>
        <div class="price-value">
              <span v-if="discountPercentage > 0" class="original-price">
             ${{ originalMonthlyPrice.toFixed(2) }}
          </span>
          <span class="current-price">${{ monthlyTotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="price-item">
        <span>{{ $t('rental.summary.setupAndDelivery') }}</span>
        <span class="price-value current-price">${{ setupTotal.toFixed(2) }}</span>
      </div>

      <div v-if="discountPercentage > 0" class="discount-applied">
        <i class="pi pi-tag"></i>
        <span>{{ $t('rental.summary.discount') }} {{ discountPercentage }}%</span>
      </div>

      <div class="price-divider"></div>

      <div class="price-item total">
        <span>{{ $t('rental.summary.firstMonthTotal') }}</span>
        <span class="price-value total-price">${{ firstPayment.toFixed(2) }}</span>
      </div>
    </div>

    <div class="payment-info">
      <div class="info-badge">
        <i class="pi pi-info-circle"></i>
        <span>{{ $t('rental.summary.monthlyCharge', { amount: monthlyTotal.toFixed(2) }) }}</span>
      </div>
    </div>

    <button
        @click="submitCheckout"
        :disabled="!canSubmit"
        class="proceed-button"
    >
      <span v-if="isSubmitting">{{ $t('rental.summary.processing') }}</span>
      <span v-else>{{ $t('rental.summary.proceedToPayment') }}</span>
      <i v-if="!isSubmitting" class="pi pi-arrow-right"></i>
      <div v-else class="button-spinner"></div>
    </button>
  </div>
</template>

<style scoped>
.summary-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e1e8ed;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #0079c2 0%, #005a94 100%);
  color: white;
  padding: 1.5rem 2rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.price-breakdown {
  padding: 2rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.price-item:last-child {
  border-bottom: none;
}

.price-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.original-price {
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
}

.current-price {
  font-weight: 600;
  color: #333;
}

.discount-applied {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #27ae60;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.75rem 0;
}

.price-divider {
  border-top: 2px solid #e1e8ed;
  margin: 1rem 0;
}

.price-item.total {
  font-size: 1.1rem;
  font-weight: 600;
  padding-top: 1rem;
}

.total-price {
  font-size: 1.5rem;
  color: #0079c2;
  font-weight: 700;
}

.payment-info {
  padding: 0 2rem 2rem;
}

.info-badge {
  background: #f0f8ff;
  border: 1px solid #cce7ff;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.info-badge i {
  color: #0079c2;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.info-badge span {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
}

.proceed-button {
  width: 100%;
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 2rem 2rem;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.proceed-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.proceed-button:active {
  transform: translateY(0);
}

.proceed-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  background: #ccc;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>