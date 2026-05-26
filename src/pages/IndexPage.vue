<template>
  <q-page class="bg-grey-1 page-wrapper">

    <!-- AGENDA: arriba derecha -->
    <div class="agenda-float" v-if="isPrivileged">

      <q-card class="agenda-card">

        <div class="agenda-header">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="event" color="white" size="16px" />
            <div>
              <div class="text-white text-weight-bold" style="font-size:13px">Agenda hoy</div>
              <div style="font-size:10px;color:rgba(255,255,255,0.55)">{{ fechaHoy }}</div>
            </div>
          </div>
          <q-btn flat round icon="launch" color="white" size="xs" to="/agenda" />
        </div>

        <q-card-section class="agenda-body">

          <q-inner-loading :showing="loading" />

          <template v-if="!loading && actividades.length">
            <div
              v-for="act in actividades"
              :key="act.id"
              class="agenda-item"
              :class="act.color === 'Realizado' ? 'done' : act.color === 'Urgente' ? 'urgent' : ''"
            >
              <div class="agenda-dot" :class="act.color === 'Realizado' ? 'dot-done' : act.color === 'Urgente' ? 'dot-urgent' : 'dot-pending'" />
              <div>
                <div class="agenda-title">{{ act.titulo }}</div>
                <div class="agenda-desc">{{ act.descripcion }}</div>
                <div class="agenda-time" v-if="act.hora">
                  {{ act.hora }}{{ act.color === 'Realizado' ? ' · Realizado' : act.color === 'Urgente' ? ' · Urgente' : '' }}
                </div>
              </div>
            </div>
          </template>

          <div v-else-if="!loading" class="empty">
            <q-icon name="event_available" size="36px" color="grey-5" />
            <div class="text-caption q-mt-sm">Sin actividades hoy</div>
          </div>

        </q-card-section>

      </q-card>

    </div>

    <div class="center-wrapper">

      <q-card class="hero-card q-mb-md">
        <q-card-section class="hero-body">
          <div class="hero-greeting">Bienvenido de nuevo</div>
          <div class="hero-title">LOLIC</div>

        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md mini-row">

        <div class="col-6">
          <q-card class="mini-card">
            <q-icon name="devices" size="32px" color="blue-8" />
            <div class="mini-label q-mt-sm">Equipos</div>
            <div class="text-caption text-grey-6">Control total</div>
          </q-card>
        </div>

        <div class="col-6">
          <q-card class="mini-card">
            <q-icon name="vpn_key" size="32px" color="green-7" />
            <div class="mini-label q-mt-sm">Licencias</div>
            <div class="text-caption text-grey-6">Asignación activa</div>
          </q-card>
        </div>

      </div>

    </div>

  </q-page>
</template>

<script>
import { computed } from 'vue'
import { useActividades } from 'src/composables/useActividad'

export default {
  setup() {
    const rol = localStorage.getItem('rol')
    const isPrivileged = ['admin', 'licenciamiento'].includes(rol)

    const { actividades, loading, listarHoy } = useActividades()

    if (isPrivileged) listarHoy()

    const fechaHoy = computed(() => {
      return new Date().toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    })

    return { actividades, loading, isPrivileged, fechaHoy }
  }
}
</script>

<style scoped>
.page-wrapper {
  position: relative;
  min-height: 100vh;
}

/* AGENDA */
.agenda-float {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 300px;
  z-index: 10;
}

.agenda-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}

.agenda-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #1e3a8a;
}

.agenda-body {
  padding: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.agenda-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px;
  border-radius: 8px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: background .12s;
}

.agenda-item:hover  { background: #f5f7ff; }
.agenda-item.done   { background: #f0fdf4; }
.agenda-item.urgent { background: #fef2f2; }

.agenda-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.dot-done    { background: #22c55e; }
.dot-pending { background: #3b82f6; }
.dot-urgent  { background: #ef4444; }

.agenda-title { font-size: 12px; font-weight: 600; color: #111; line-height: 1.3; }
.agenda-desc  { font-size: 11px; color: #6b7280; margin-top: 1px; }
.agenda-time  { font-size: 10px; color: #9ca3af; margin-top: 2px; }

.empty {
  text-align: center;
  padding: 24px;
  color: #9ca3af;
}

/* CENTRO */
.center-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  gap: 16px;
}

.hero-card {
  background: #0f1f4a;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 10px 30px rgba(0,0,0,.12);
}

.hero-body {
  padding: 56px 60px;
}

.hero-greeting {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 10px;
}

.hero-title {
  font-size: 32px;
  font-weight: 500;
  color: white;
  margin-bottom: 12px;
  line-height: 1.2;
}

.hero-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  line-height: 1.7;
}

.mini-row {
  width: 100%;
  max-width: 620px;
}

.mini-card {
  text-align: center;
  padding: 22px 16px;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
}

.mini-label {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}
</style>