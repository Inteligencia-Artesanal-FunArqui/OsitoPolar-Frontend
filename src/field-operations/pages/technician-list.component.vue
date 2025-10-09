<script>
import { TechnicianService } from "../services/technician.service.js";
import TechnicianDetailComponent from "../components/technician-detail.component.vue";
import { Technician } from '../models/technician.entity.js';

export default {
  name: "technician-list",
  components: {
    TechnicianDetailModal: TechnicianDetailComponent,
  },
  data() {
    return {
      technicians: [],
      technicianService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      selectedTechnician: null,
    };
  },
  methods: {
    async loadTechnicians() {
      this.loading = true;
      this.hasError = false;

      try {
        const response = await this.technicianService.getAll();
        this.technicians = response.data.map(item => new Technician(item));
        this.loading = false;
      } catch (error) {
        console.error("Error loading technicians:", error);
        this.hasError = true;
        this.errorMessage = this.$t('common.errorLoadingData');
        this.loading = false;
      }
    },

    viewTechnicianDetail(technician) {
      this.selectedTechnician = technician;
      this.showDetailModal = true;
    },

    openNewTechnicianForm() {
      this.$toast.add({
        severity: 'info',
        summary: this.$t('common.info'),
        detail: this.$t('technicians.form.newTechnicianComingSoon'),
        life: 3000
      });
    },
  },
  created() {
    this.technicianService = new TechnicianService();
    this.loadTechnicians();
  }
};
</script>

<template>
  <div class="technician-list-container">
    <div class="page-header">
      <h1>{{ $t('technicians.title') }}</h1> <pv-button
        :label="$t('technicians.newTechnician')" icon="pi pi-plus"
        class="p-button-primary new-technician-button"
        @click="openNewTechnicianForm"
    />
    </div>

    <div class="loading" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('technicians.loading') }}</p> </div>

    <div class="error" v-else-if="hasError">
      <p class="error-message-text">{{ errorMessage }}</p>
      <pv-button :label="$t('technicians.retry')" @click="loadTechnicians" class="p-button-danger" /> </div>

    <div class="technician-grid" v-else>
      <pv-card
          v-for="tech in technicians"
          :key="tech.id"
          class="technician-card"
          @click="viewTechnicianDetail(tech)"
      >
        <template #title>
          <div class="card-title">
            <i class="pi pi-user card-icon"></i>
            <h3>{{ tech.name }}</h3>
          </div>
        </template>
        <template #subtitle>
          <div class="card-subtitle">
            <span class="pi pi-tag subtitle-icon"></span> {{ $t('technicians.specialization') }}: {{ tech.specialization }}
          </div>
        </template>
        <template #content>
          <div class="card-content">
            <p><i class="pi pi-phone content-icon"></i> <strong>{{ $t('technicians.phone') }}:</strong> {{ tech.phone }}</p>
            <p><i class="pi pi-at content-icon"></i> <strong>{{ $t('technicians.email') }}:</strong> {{ tech.email }}</p>
            <p><i class="pi pi-star content-icon"></i> <strong>{{ $t('technicians.averageRating') }}:</strong> {{ tech.getAverageRating() }}</p>
            <p><i class="pi pi-building content-icon"></i> <strong>{{ $t('technicians.company') }}:</strong> {{ tech.companyId }}</p>
            <p><i class="pi pi-globe content-icon"></i> <strong>{{ $t('technicians.availability') }}:</strong>
              <span :class="tech.getAvailabilityClass()">
                {{ tech.getAvailabilityStatus() }}
              </span>
            </p>
          </div>
        </template>
      </pv-card>
    </div>

    <TechnicianDetailModal
        :visible="showDetailModal"
        :technician="selectedTechnician"
        @update:visible="showDetailModal = $event"
    />
  </div>
</template>

<style scoped>
.technician-list-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #343a40;
  font-weight: 700;
  margin: 0;
}

.new-technician-button {
  background-color: #007bff;
  border: none;
  font-weight: 600;
  padding: 0.8rem 1.8rem;
  font-size: 1.05rem;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
  transition: all 0.3s ease;
}

.new-technician-button:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
  transform: translateY(-2px);
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  font-size: 1.1rem;
  color: #6c757d;
}

.error-message-text {
  color: #dc3545;
  font-weight: 600;
  margin-bottom: 1rem;
}

.p-button-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.technician-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.technician-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.technician-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.p-card-title {
  padding-bottom: 0.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.card-title h3 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #343a40;
  margin: 0;
}

.card-icon {
  font-size: 1.8rem;
  color: #007bff;
}

.p-card-subtitle {
  padding-top: 0;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.card-subtitle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: #6c757d;
}

.subtitle-icon {
  font-size: 1.1rem;
  color: #6c757d;
}

.card-content p {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  color: #495057;
  margin-bottom: 0.7rem;
}

.card-content p:last-child {
  margin-bottom: 0;
}

.content-icon {
  font-size: 1.1rem;
  color: #007bff;
}

.status-available {
  color: #28a745;
  font-weight: 600;
  background-color: #e6ffe6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-occupied {
  color: #ffc107;
  font-weight: 600;
  background-color: #fff9e6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-on-leave {
  color: #dc3545;
  font-weight: 600;
  background-color: #ffe6e6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-unknown {
  color: #6c757d;
  font-weight: 600;
  background-color: #f2f2f2;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}
</style>