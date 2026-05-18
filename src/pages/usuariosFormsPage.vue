<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <div>
        <span class="ofi-header__eyebrow">Usuarios</span>

        <h1 class="ofi-header__title">
          {{ modo === 'crear' ? 'Crear Usuario' : 'Editar Usuario' }}
        </h1>

        <p class="ofi-header__sub">
          {{ modo === 'crear'
            ? 'Registra un nuevo Usuario en el sistema.'
            : 'Actualiza información de un Usuario existente.'
          }}
        </p>
      </div>

      <div class="ofi-header__actions">
        <q-btn
          flat
          icon="arrow_back"
          label="Volver"
          color="white"
          @click="volver"
        />
      </div>
    </div>

    <!-- FORM -->
    <div class="ofi-body">

      <div class="ofi-card">

        <!-- CREAR -->
        <div v-if="modo === 'crear'">
          <p class="ofi-card__title">Crear Usuario</p>

          <q-input
            v-model="usuario_crear"
            label="Usuario"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="password_crear"
            label="Contraseña"
            type="password"
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="rol_crear"
            :options="roles"
            label="Rol"
            outlined
            dense
            class="q-mb-md"
          />

          <div class="ofi-actions">
            <q-btn
              unelevated
              label="Crear Usuario"
              color="primary"
              class="ofi-btn"
              :loading="loading"
              :disable="!usuario_crear || !password_crear || !rol_crear"
              @click="crearUsuario"
            />
          </div>
        </div>

        <!-- EDITAR -->
        <div v-else>
          <p class="ofi-card__title">Editar Usuario</p>

          <q-input
            v-model="usuario_actual"
            label="Usuario"
            outlined
            dense
            readonly
            class="q-mb-md"
          />

          <q-input
            v-model="password_editar"
            label="Nueva Contraseña (opcional)"
            type="password"
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="rol_editar"
            :options="roles"
            label="Rol"
            outlined
            dense
            class="q-mb-md"
          />

          <div class="ofi-actions">
            <q-btn
              unelevated
              label="Actualizar Usuario"
              color="primary"
              class="ofi-btn"
              :loading="loading"
              :disable="!rol_editar"
              @click="editarUsuario"
            />
          </div>
        </div>

      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUsuarios } from 'src/composables/useUsuario'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const { listar, editar, crear, usuarios, loading } = useUsuarios()

const modo = ref(route.query.modo || 'crear')

// ===============================
// ROLES
// ===============================
const roles = ['admin', 'licenciamiento', 'consulta']

// ===============================
// CREAR
// ===============================
const usuario_crear = ref('')
const password_crear = ref('')
const rol_crear = ref(null)

// ===============================
// EDITAR
// ===============================
const usuario_actual = ref('')
const rol_editar = ref(null)
const password_editar = ref('')
const usuario_id = ref('')

// ===============================
// CARGAR DATOS SI ES EDICIÓN
// ===============================
async function cargarUsuarioEditar() {
  const usuarioQuery = route.query.username

  if (!usuarioQuery) {
    $q.notify({ type: 'negative', message: 'No se recibió usuario a editar' })
    volver()
    return
  }

  await listar({ search: usuarioQuery })

  const usuario = usuarios.value.find(u => u.username === usuarioQuery)

  if (!usuario) {
    $q.notify({ type: 'negative', message: 'Usuario no encontrado' })
    volver()
    return
  }

  usuario_id.value = usuario.id
  usuario_actual.value = usuario.username
  rol_editar.value = usuario.rol

}

// ===============================
// CREAR
// ===============================
async function crearUsuario() {
    await crear({
      username: usuario_crear.value,
      password: password_crear.value,
      rol: rol_crear.value
    })
    volver()
}

// ===============================
// EDITAR
// ===============================
async function editarUsuario() {
    await editar({
      username: usuario_id.value,
      password: password_editar.value || null,
      rol: rol_editar.value
    })

    volver()
}

function volver() {
  router.push('/usuarios')
}

// ===============================
// INIT
// ===============================
onMounted(async () => {
  if (modo.value === 'editar') {
    await cargarUsuarioEditar()
  }
})
</script>

<style scoped>
.ofi-page {
  background: #f0f4fa;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

.ofi-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 28px 32px 20px;
  background: #1a3f73;
}

.ofi-header__eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #8cc2ff;
  margin-bottom: 4px;
}

.ofi-header__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.ofi-header__sub {
  margin: 0;
  font-size: 13px;
  color: #b7cbe4;
}

.ofi-header__actions {
  display: flex;
  align-items: center;
}

.ofi-body {
  max-width: 700px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

.ofi-card {
  background: #fff;
  border: 1px solid #dde6f3;
  border-radius: 12px;
  padding: 20px 24px;
}

.ofi-card__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6b87aa;
  margin: 0 0 14px;
}

.ofi-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.ofi-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 0 24px;
  height: 40px;
}

@media (max-width: 600px) {
  .ofi-body {
    padding: 18px 12px 40px;
  }
}
</style>