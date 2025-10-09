<script>
export default {
  name: 'rental-filter-bar',
  data() {
    return {
      selectedType: 'all',
      priceRange: [0, 1000],
      sortBy: 'price_asc',
      showMobileFilters: false
    };
  },
  computed: {
    equipmentTypes() {
      return [
        { value: 'all', label: this.$t('rental.filter.allEquipment') },
        { value: 'freezer', label: this.$t('rental.filter.freezer', 'Freezers') },
        { value: 'cold_room', label: this.$t('rental.filter.coldRoom', 'Cold Rooms') },
        { value: 'refrigerator', label: this.$t('rental.filter.refrigerator', 'Refrigerators') }
      ];
    },
    sortOptions() {
      return [
        { value: 'price_asc', label: this.$t('rental.filter.sortOptions.lowToHigh', 'Price: Low to High') },
        { value: 'price_desc', label: this.$t('rental.filter.sortOptions.highToLow', 'Price: High to Low') },
        { value: 'name_asc', label: this.$t('rental.filter.sortOptions.nameAZ', 'Name: A-Z') }
      ];
    },
    selectedTypeLabel() {
      return this.equipmentTypes.find(type => type.value === this.selectedType)?.label || 'Todos los equipos';
    },
    selectedSortLabel() {
      return this.sortOptions.find(option => option.value === this.sortBy)?.label || 'Precio: Menor a Mayor';
    }
  },
  methods: {
    applyFilters() {
      this.$emit('filter-change', {
        type: this.selectedType,
        minPrice: this.priceRange[0],
        maxPrice: this.priceRange[1],
        sortBy: this.sortBy
      });
    },

    selectEquipmentType(type) {
      this.selectedType = type;
      this.applyFilters();
    },

    selectSortOption(option) {
      this.sortBy = option;
      this.applyFilters();
    },

    updatePriceRange(event) {
      this.priceRange = [event.target.value, this.priceRange[1]];
      this.applyFilters();
    },

    updateMaxPrice(event) {
      this.priceRange = [this.priceRange[0], event.target.value];
      this.applyFilters();
    },

    clearFilters() {
      this.selectedType = 'all';
      this.priceRange = [0, 1000];
      this.sortBy = 'price_asc';
      this.applyFilters();
    },

    toggleMobileFilters() {
      this.showMobileFilters = !this.showMobileFilters;
    }
  },
  watch: {
    selectedType() {
      this.applyFilters();
    },
    sortBy() {
      this.applyFilters();
    }
  }
}
</script>

<template>
  <div class="filter-bar">
    <!-- Mobile Filter Toggle -->
    <div class="mobile-filter-toggle">
      <button @click="toggleMobileFilters" class="filter-toggle-btn">
        <i class="pi pi-filter"></i>
        {{ $t('rental.filter.title') }}
        <i :class="['pi', showMobileFilters ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
      </button>
    </div>

    <!-- Filter Content -->
    <div :class="['filter-content', { 'mobile-visible': showMobileFilters }]">
      <!-- Equipment Type Filter -->
      <div class="filter-section">
        <label class="filter-label">{{ $t('rental.filter.equipmentType') }}</label>
        <div class="custom-dropdown">
          <div class="dropdown-selected" @click="$refs.typeDropdown.classList.toggle('open')">
            <span>{{ selectedTypeLabel }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div ref="typeDropdown" class="dropdown-options">
            <div
                v-for="type in equipmentTypes"
                :key="type.value"
                @click="selectEquipmentType(type.value); $refs.typeDropdown.classList.remove('open')"
                :class="['dropdown-option', { active: selectedType === type.value }]"
            >
              {{ type.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="filter-section">
        <label class="filter-label">{{ $t('rental.filter.priceRange') }}</label>
        <div class="price-range-container">
          <div class="price-inputs">
            <div class="price-input-group">
              <span class="currency">$</span>
              <input
                  type="number"
                  :value="priceRange[0]"
                  @input="updatePriceRange"
                  min="0"
                  max="1000"
                  class="price-input"
                  placeholder="Mín"
              >
            </div>
            <span class="range-separator">-</span>
            <div class="price-input-group">
              <span class="currency">$</span>
              <input
                  type="number"
                  :value="priceRange[1]"
                  @input="updateMaxPrice"
                  min="0"
                  max="1000"
                  class="price-input"
                  placeholder="Máx"
              >
            </div>
          </div>

          <!-- Custom Range Slider -->
          <div class="range-slider-container">
            <input
                type="range"
                :value="priceRange[0]"
                @input="updatePriceRange"
                min="0"
                max="1000"
                step="50"
                class="range-slider range-min"
            >
            <input
                type="range"
                :value="priceRange[1]"
                @input="updateMaxPrice"
                min="0"
                max="1000"
                step="50"
                class="range-slider range-max"
            >
          </div>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="filter-section">
        <label class="filter-label">{{ $t('rental.filter.sortBy') }}</label>
        <div class="custom-dropdown">
          <div class="dropdown-selected" @click="$refs.sortDropdown.classList.toggle('open')">
            <span>{{ selectedSortLabel }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div ref="sortDropdown" class="dropdown-options">
            <div
                v-for="option in sortOptions"
                :key="option.value"
                @click="selectSortOption(option.value); $refs.sortDropdown.classList.remove('open')"
                :class="['dropdown-option', { active: sortBy === option.value }]"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <div class="filter-section filter-actions">
        <button @click="clearFilters" class="clear-filters-btn">
          <i class="pi pi-refresh"></i>
          {{ $t('rental.filter.clean') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #e1e8ed;
}

.mobile-filter-toggle {
  display: none;
  margin-bottom: 1rem;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #0079c2;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.filter-toggle-btn:hover {
  background: #005a94;
  transform: translateY(-1px);
}

.filter-content {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-section {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.filter-actions {
  min-width: auto;
  flex: 0;
}

.filter-label {
  display: block;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

/* Custom Dropdown Styles */
.custom-dropdown {
  position: relative;
}

.dropdown-selected {
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-selected:hover {
  border-color: #0079c2;
  background: #f0f8ff;
}

.dropdown-selected:focus-within {
  outline: none;
  border-color: #0079c2;
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  margin-top: 4px;
  z-index: 1000;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dropdown-options.open {
  max-height: 300px;
  border-color: #0079c2;
}

.dropdown-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f3f4;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: #f0f8ff;
  color: #0079c2;
}

.dropdown-option.active {
  background: #0079c2;
  color: white;
  font-weight: 500;
}

/* Price Range Styles */
.price-range-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-input-group {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 0 0.75rem;
  transition: all 0.2s ease;
  flex: 1;
}

.price-input-group:focus-within {
  border-color: #0079c2;
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
}

.currency {
  color: #666;
  font-weight: 500;
  margin-right: 0.25rem;
}

.price-input {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  font-size: 0.9rem;
  width: 100%;
  outline: none;
}

.range-separator {
  color: #666;
  font-weight: 500;
}

.range-slider-container {
  position: relative;
  height: 6px;
  background: #e1e8ed;
  border-radius: 3px;
  margin: 0.5rem 0;
}

.range-slider {
  position: absolute;
  top: 0;
  width: 100%;
  height: 6px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #0079c2;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #0079c2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Clear Filters Button */
.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #666;
  border: 2px solid #e1e8ed;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.clear-filters-btn:hover {
  background: #f8f9fa;
  border-color: #0079c2;
  color: #0079c2;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 968px) {
  .filter-content {
    gap: 1.5rem;
  }

  .filter-section {
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .mobile-filter-toggle {
    display: block;
  }

  .filter-content {
    display: none;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .filter-content.mobile-visible {
    display: flex;
  }

  .filter-section {
    width: 100%;
    min-width: unset;
  }

  .price-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .range-separator {
    display: none;
  }

  .filter-bar {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .filter-bar {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .dropdown-selected {
    padding: 0.625rem 0.75rem;
    font-size: 0.85rem;
  }

  .price-input-group {
    padding: 0 0.5rem;
  }

  .price-input {
    padding: 0.625rem 0;
    font-size: 0.85rem;
  }
}</style>