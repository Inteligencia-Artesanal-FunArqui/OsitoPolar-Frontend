<script>
import { TechnicianService } from "../services/technician.service.js";
import TechnicianDetailComponent from "../components/technician-detail.component.vue";
import TechnicianFormDialog from "../components/technician-form-dialog.component.vue";
import { Technician } from '../models/technician.entity.js';

export default {
  name: "technician-list",
  components: {
    TechnicianDetailModal: TechnicianDetailComponent,
    TechnicianFormDialog,
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
      showFormDialog: false,
      editingTechnician: null,
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

    openCreate() {
      this.editingTechnician = null;
      this.showFormDialog = true;
    },

    openEdit(technician) {
      this.editingTechnician = technician;
      this.showFormDialog = true;
    },

    confirmDelete(technician) {
      this.$confirm.require({
        message: this.$t('technicians.confirmDelete', { name: technician.name }),
        header: this.$t('technicians.confirmDeleteHeader'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: async () => {
          try {
            await this.technicianService.deleteTechnician(technician.id);
            this.technicians = this.technicians.filter(t => t.id !== technician.id);
            this.$toast.add({ severity: 'success', summary: this.$t('technicians.deletedTitle'), detail: this.$t('technicians.deletedDetail', { name: technician.name }), life: 3500 });
          } catch (error) {
            this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: error.response?.data?.message || this.$t('technicians.deleteError'), life: 5000 });
          }
        }
      });
    },

    onSaved() {
      // reload so ids / defaults assigned by the API are what the cards show
      this.loadTechnicians();
    },

    viewTechnicianDetail(technician) {
      this.selectedTechnician = technician;
      this.showDetailModal = true;
    }
  },
  created() {
    this.technicianService = new TechnicianService();
    this.loadTechnicians();
  }
};
</script>

<template>
  <div class="technician-list-container">
    <op-page-header :title="$t('technicians.title')" :subtitle="$t('technicians.subtitle')">
      <pv-button :label="$t('technicians.newTechnician')" icon="pi pi-plus" @click="openCreate" />
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('technicians.loading')" />
    <op-error-state v-else-if="hasError" :message="errorMessage" @retry="loadTechnicians" />
    <op-empty-state
        v-else-if="technicians.length === 0"
        icon="pi pi-users"
        :title="$t('technicians.noTechnicians')"
        :message="$t('technicians.emptyMessage')">
      <pv-button :label="$t('technicians.newTechnician')" icon="pi pi-plus" @click="openCreate" />
    </op-empty-state>

    <div class="op-grid" v-else>
      <article
          v-for="tech in technicians"
          :key="tech.id"
          class="op-card technician-card"
          tabindex="0"
          role="button"
          @click="viewTechnicianDetail(tech)"
          @keydown.enter="viewTechnicianDetail(tech)">
        <header class="technician-card__head">
          <span class="technician-card__avatar" aria-hidden="true"><i class="pi pi-user"></i></span>
          <div class="technician-card__who">
            <h3>{{ tech.name }}</h3>
            <p>{{ tech.specialization }}</p>
          </div>
          <op-status-badge kind="availability" :value="tech.availability" />
        </header>
        <dl class="technician-card__facts">
          <div><dt><i class="pi pi-phone" aria-hidden="true"></i> {{ $t('technicians.phone') }}</dt><dd>{{ tech.phone }}</dd></div>
          <div><dt><i class="pi pi-at" aria-hidden="true"></i> {{ $t('technicians.email') }}</dt><dd class="technician-card__email">{{ tech.email }}</dd></div>
          <div><dt><i class="pi pi-star" aria-hidden="true"></i> {{ $t('technicians.averageRating') }}</dt><dd>{{ tech.getAverageRating() }}</dd></div>
        </dl>
        <footer class="technician-card__actions" @click.stop @keydown.enter.stop>
          <pv-button icon="pi pi-pencil" :label="$t('technicians.edit')" size="small" severity="secondary" outlined @click="openEdit(tech)" />
          <pv-button icon="pi pi-trash" :label="$t('technicians.delete')" size="small" severity="danger" outlined @click="confirmDelete(tech)" />
        </footer>
      </article>
    </div>

    <TechnicianFormDialog
        v-model:visible="showFormDialog"
        :technician="editingTechnician"
        @saved="onSaved"
    />

    <TechnicianDetailModal
        :visible="showDetailModal"
        :technician="selectedTechnician"
        @update:visible="showDetailModal = $event"
    />
  </div>
</template>

<style scoped>
.technician-card { cursor: pointer; display: flex; flex-direction: column; gap: var(--op-space-4); transition: box-shadow 0.2s ease, transform 0.2s ease; }
.technician-card:hover { box-shadow: var(--op-shadow-md); transform: translateY(-2px); }
.technician-card__head { display: flex; align-items: center; gap: var(--op-space-3); }
.technician-card__avatar {
  width: 2.75rem; height: 2.75rem; flex-shrink: 0; border-radius: 50%;
  display: grid; place-items: center; background: var(--op-brand-soft); color: var(--op-brand); font-size: 1.2rem;
}
.technician-card__who { flex: 1; min-width: 0; }
.technician-card__who h3 { font-size: 1.05rem; color: var(--op-text-strong); }
.technician-card__who p { color: var(--op-text-muted); font-size: 0.88rem; }
.technician-card__facts { display: grid; gap: var(--op-space-2); margin: 0; }
.technician-card__facts > div { display: flex; justify-content: space-between; gap: var(--op-space-3); font-size: 0.9rem; }
.technician-card__facts dt { color: var(--op-text-muted); display: flex; gap: var(--op-space-2); align-items: center; white-space: nowrap; }
.technician-card__facts dd { margin: 0; text-align: right; min-width: 0; }
.technician-card__actions { display: flex; gap: var(--op-space-2); justify-content: flex-end; border-top: 1px solid var(--op-border, #e1e8ed); padding-top: var(--op-space-3); }
.technician-card__email { overflow-wrap: anywhere; }
</style>
