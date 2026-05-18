<template>
  <q-layout view="lHh Lpr lff">

    <!-- ═══════════════════════════════════════
         HEADER
    ════════════════════════════════════════ -->
    <q-header elevated class="lolic-header">
      <q-toolbar style="height: 72px; padding: 0 16px;">

        <q-btn flat round dense icon="menu" color="white" @click="drawer = !drawer" />

        <q-toolbar-title class="text-center">
          <span class="lolic-title">LOLIC</span>
        </q-toolbar-title>

        <q-btn
          v-if="isAdmin"
          flat dense
          icon="manage_accounts"
          label="Gestión de usuarios"
          color="white"
          class="gt-xs"
          @click="router.push('/usuarios')"
        />
        <!-- Ícono solo en móvil para admin -->
        <q-btn
          v-if="isAdmin"
          flat round dense
          icon="manage_accounts"
          color="white"
          class="lt-sm"
          @click="router.push('/usuarios')"
        >
          <q-tooltip>Gestión de usuarios</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <!-- ═══════════════════════════════════════
         DRAWER (SIDEBAR)
    ════════════════════════════════════════ -->
    <q-drawer v-model="drawer" show-if-above :width="256" :breakpoint="600" elevated>

      <!-- Panel de usuario -->
      <div class="user-panel bg-blue-9 text-white q-pa-md">
        <q-avatar size="60px" class="user-avatar q-mb-sm">
          <q-icon name="person" size="36px" />
        </q-avatar>
        <div class="text-subtitle1 text-weight-bold ellipsis">{{ username }}</div>
        <div class="text-caption q-mb-md text-capitalize opacity-75">{{ rolLabel }}</div>
        <q-btn
          outline dense
          label="Cerrar sesión"
          icon="logout"
          color="white"
          class="full-width"
          @click="logout"
        />
      </div>

      <!-- Menú de navegación -->
      <q-scroll-area style="height: calc(100% - 200px)">
        <q-list padding class="nav-list">

          <!-- Inicio (todos los roles) -->
          <NavItem to="/" icon="home" label="Inicio" />

          <!-- Buscar (consulta, licenciamiento, admin) -->
          <NavItem
            v-if="canAccess(ROLES.CONSULTA)"
            to="/buscar"
            icon="search"
            label="Buscar"
          />

          <template v-if="canAccess(ROLES.LICENCIAMIENTO)">

            <!-- LICENCIAS -->
            <q-separator spaced inset />
            <q-item-label header class="text-caption text-grey-6 text-uppercase">Licencias</q-item-label>
            <NavItem to="/asignar"      icon="assignment_turned_in" label="Asignar" />
            <NavItem to="/traslado"     icon="swap_horiz"           label="Trasladar" />
            <NavItem to="/actualizar"   icon="autorenew"               label="Actualizar" />
            <NavItem to="/recuperacion" icon="restore"              label="Recuperar" />

            <!-- Gestiones -->
            <q-separator spaced inset />
            <NavItem to="/gestion"   icon="devices" label="Equipos" />
            <NavItem to="/catalogos" icon="menu_book"      label="Catálogos" />
            


            <q-separator spaced inset />
            <NavItem to="/agenda"    icon="event"          label="Agenda" />

          </template>

        </q-list>
      </q-scroll-area>

    </q-drawer>

    <!-- ═══════════════════════════════════════
         CONTENIDO PRINCIPAL
    ════════════════════════════════════════ -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import { useRouter} from 'vue-router'
import { QItem, QItemSection, QIcon } from 'quasar'

// ─── Router ──────────────────────────────────────────────────────────────────
const router = useRouter()

// ─── Estado ──────────────────────────────────────────────────────────────────
const drawer  = ref(false)
const rol     = ref(localStorage.getItem('rol') ?? '')
const username = ref(localStorage.getItem('username') ?? 'Usuario')

// ─── Roles ───────────────────────────────────────────────────────────────────
const ROLES = {
  CONSULTA:       ['licenciamiento', 'admin', 'consulta'],
  LICENCIAMIENTO: ['licenciamiento', 'admin'],
  ADMIN:          ['admin'],
}

const canAccess = (roles) => roles.includes(rol.value)
const isAdmin   = computed(() => canAccess(ROLES.ADMIN))

const rolLabel = computed(() => {
  const labels = { admin: 'Administrador', licenciamiento: 'Licenciamiento', consulta: 'Consulta' }
  return labels[rol.value] ?? rol.value
})


// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = () => {
  ['access', 'refresh', 'rol', 'username', 'ultimoAcceso'].forEach(k => localStorage.removeItem(k))
  router.push('/login')
}

// ─── Componente interno NavItem ───────────────────────────────────────────────
// Evita repetir la misma estructura en cada ítem del menú
const NavItem = defineComponent({
  props: { to: String, icon: String, label: String },
  setup(props) {
    return () => h(QItem, { clickable: true, to: props.to, activeClass: 'nav-item-active' }, () => [
      h(QItemSection, { avatar: true }, () => h(QIcon, { name: props.icon })),
      h(QItemSection, () => props.label),
    ])
  }
})
</script>

<style scoped>
/* ── Header ── */
.lolic-header {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
  box-shadow: 0 2px 12px rgba(13, 71, 161, 0.4);
}

.lolic-title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: 0.25em;
  color: #fff;
}

/* ── Panel de usuario ── */
.user-panel {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(160deg, #1976D2 0%, #0D47A1 100%);
}

.user-avatar {
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
}

/* ── Nav items ── */
.nav-list .q-item {
  border-radius: 8px;
  margin: 0px 8px;
  transition: background 0.2s;
}

.nav-item-active {
  background: rgba(25, 118, 210, 0.12) !important;
  color: #1565C0 !important;
  font-weight: 600;
}
</style>