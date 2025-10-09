<script>
export default {
  name: 'RatingDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    currentRating: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:visible', 'rating-submitted'],
  data() {
    return {
      selectedRating: this.currentRating
    };
  },
  watch: {
    currentRating(newVal) {
      this.selectedRating = newVal;
    },
    visible(newVal) {
      if (newVal) {
        this.selectedRating = this.currentRating;
      }
    }
  },
  methods: {
    submit() {
      if (this.selectedRating > 0) {
        this.$emit('rating-submitted', this.selectedRating);
        this.$emit('update:visible', false);
      } else {
        this.$toast.add({
          severity: 'warn',
          summary: this.$t('client.rating.warning'),
          detail: this.$t('client.rating.selectRatingPrompt'),
          life: 3000
        });
      }
    }
  }
};
</script>

<template>
  <pv-dialog
      :header="$t('client.rating.rateService')"
      :visible="visible"
      :modal="true"
      :style="{ width: '380px', 'max-width': '90vw' }"
      @update:visible="$emit('update:visible', $event)"
      class="rating-dialog-custom"
  >
    <div class="dialog-content">
      <p class="rating-prompt">{{ $t('client.rating.howWasService') }}</p>
      <pv-rating v-model="selectedRating" :cancel="false" :stars="5" class="custom-rating-stars" />
      <small v-if="selectedRating === 0" class="p-error rating-error-message">{{ $t('client.rating.required') }}</small>
    </div>
    <template #footer>
      <pv-button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text p-button-secondary" @click="$emit('update:visible', false)" />
      <pv-button :label="$t('client.rating.submitRating')" icon="pi pi-check" class="p-button-primary" @click="submit" />
    </template>
  </pv-dialog>
  <pv-toast />
</template>

<style scoped>

.custom-rating-stars :deep(.p-rating-icon) {
  font-size: 2.2rem;
  color: #cccccc;
  transition: color 0.2s ease;
}

.custom-rating-stars :deep(.p-rating-icon.pi-star-fill) {
  color: #FFC107;
}

.rating-error-message {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #e74c3c;
}

.p-button-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.p-button-secondary {
  color: #6c757d;
  border-color: transparent;
  background-color: transparent;
}

.p-button-secondary:hover {
  background-color: #e9ecef;
}
</style>