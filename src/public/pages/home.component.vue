<script>
import HomeDashboardSummary from '../components/home-dashboard-summary.component.vue';
import authService from '../../iam/services/auth.service.js';

/**
 * @component home
 * @description Home page component that serves as the main landing page
 * Displays welcome message and equipment summary sections
 */
export default {
  name: "home",
  components: {
    HomeDashboardSummary
  },
  computed: {
    // the summary calls protected endpoints, so anonymous visitors get a sign-in call to action instead
    isAuthenticated() {
      return authService.isAuthenticated();
    }
  }
}
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('home.welcome') }}</h1>
        <p class="hero-subtitle">
          {{ $t('home.subtitle') }}
        </p>
        <div class="hero-actions">
          <template v-if="isAuthenticated">
            <pv-button :label="$t('nav.dashboard')" icon="pi pi-chart-line" severity="secondary" @click="$router.push('/dashboard')" />
            <pv-button :label="$t('nav.equipment')" icon="pi pi-box" severity="secondary" @click="$router.push('/equipment')" />
          </template>
          <template v-else>
            <pv-button :label="$t('nav.signIn')" icon="pi pi-sign-in" severity="secondary" @click="$router.push('/sign-in')" />
            <pv-button :label="$t('nav.contact')" icon="pi pi-envelope" severity="secondary" @click="$router.push('/contact')" />
          </template>
        </div>
      </div>
    </div>

    <!-- Dashboard Summary -->
    <div class="summary-section" v-if="isAuthenticated">
      <home-dashboard-summary />
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-container">
        <h2 class="features-title">{{ $t('home.features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>{{ $t('home.features.monitoring') }}</h3>
            <p>{{ $t('home.features.monitoringDesc') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-bell"></i>
            </div>
            <h3>{{ $t('home.features.alerts') }}</h3>
            <p>{{ $t('home.features.alertsDesc') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-cog"></i>
            </div>
            <h3>{{ $t('home.features.management') }}</h3>
            <p>{{ $t('home.features.managementDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  border-radius: var(--op-radius-lg);
  overflow: hidden;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--op-space-3);
  margin-top: var(--op-space-6);
}

.hero-section {
  background: linear-gradient(135deg, var(--op-brand) 0%, #005a94 100%);
  color: white;
  padding: clamp(2rem, 6vw, 4rem) var(--op-space-5);
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(1.9rem, 1.2rem + 3vw, 3rem);
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.summary-section {
  background: var(--op-surface-muted);
  padding: 3rem 0;
}

.features-section {
  padding: 4rem 2rem;
  background: white;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-title {
  text-align: center;
  color: #333;
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
  font-weight: 600;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--op-brand);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--op-brand) 0%, #005a94 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.feature-icon i {
  font-size: 2rem;
  color: white;
}

.feature-card h3 {
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .features-section {
    padding: 3rem 1rem;
  }

  .features-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }

  .feature-icon i {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features-title {
    font-size: 1.6rem;
    margin-bottom: 2rem;
  }
}
</style>