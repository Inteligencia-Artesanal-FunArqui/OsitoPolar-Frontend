<script>
import HomeDashboardSummary from '../components/home-dashboard-summary.component.vue';

/**
 * @component home
 * @description Home page component that serves as the main landing page
 * Displays welcome message and equipment summary sections
 */
export default {
  name: "home",
  title: "Home",
  components: {
    HomeDashboardSummary
  }
}
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('home.welcome') || 'Bienvenido a OsitoPolar' }}</h1>
        <p class="hero-subtitle">
          {{ $t('home.subtitle') || 'Gestión inteligente de equipos de refrigeración' }}
        </p>
      </div>
    </div>

    <!-- Dashboard Summary -->
    <div class="summary-section">
      <home-dashboard-summary />
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-container">
        <h2 class="features-title">{{ $t('home.features.title') || 'Monitorea tus Equipos' }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>{{ $t('home.features.monitoring') || 'Monitoreo en Tiempo Real' }}</h3>
            <p>{{ $t('home.features.monitoringDesc') || 'Controla temperatura, consumo energético y recibe alertas instantáneas.' }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-bell"></i>
            </div>
            <h3>{{ $t('home.features.alerts') || 'Alertas Inteligentes' }}</h3>
            <p>{{ $t('home.features.alertsDesc') || 'Notificaciones automáticas ante cualquier anomalía en tus equipos.' }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-cog"></i>
            </div>
            <h3>{{ $t('home.features.management') || 'Gestión Centralizada' }}</h3>
            <p>{{ $t('home.features.managementDesc') || 'Administra todos tus equipos desde una sola plataforma.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #0079c2 0%, #005a94 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
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
  background: #f8f9fa;
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
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  border-color: #0079c2;
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0079c2 0%, #005a94 100%);
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