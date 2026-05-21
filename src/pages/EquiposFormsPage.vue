<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <div>
        <span class="ofi-header__eyebrow">Licencias</span>

        <h1 class="ofi-header__title">
          {{ modo === 'crear' ? 'Crear Equipo' : 'Editar Equipo' }}
        </h1>

        <p class="ofi-header__sub">
          {{ modo === 'crear'
            ? 'Registra un nuevo equipo en el sistema.'
            : 'Actualiza información de un equipo existente.'
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

        <div v-if="modo === 'crear'">

          <p class="ofi-card__title">Crear equipo</p>

          <div class="ofi-grid">
            <q-select
              v-model="prefijo_creacion"
              :options="opcionesprefijo"
              label="Sede/Tipo"
              outlined
              dense
            />

            <q-input
              v-model="numeroPlaca"
              label="Número de placa"
              outlined
              dense
              type="number"
              inputmode="numeric"
              class="no-spinner"
              @keypress="soloNumeros"
            />
          </div>

          <q-input
            v-model="serial_creacion"
            label="Serial del equipo"
            outlined
            dense
            class="q-mt-md"
            @keypress="bloquearEspeciales"
            @update:model-value="
              (val) => (serial_creacion = val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
            "
          />

          <div class="ofi-actions">
            <q-btn
              unelevated
              label="Crear equipo"
              color="primary"
              class="ofi-btn"
              :loading="loading"
              :disable="!numeroPlaca"
              @click="crearEquipo"
            />
          </div>

        </div>

        <div v-else>

          <p class="ofi-card__title">Editar equipo</p>

          <q-input
            v-model="nombre_actual"
            label="Nombre actual"
            outlined
            dense
            readonly
          />

          <div class="ofi-grid q-mt-md">
            <q-select
              v-model="prefijo_edicion"
              :options="opcionesprefijo"
              label="Sede/Tipo"
              outlined
              dense
            />

            <q-input
              v-model="nuevo_numeroPlaca"
              label="Número de placa"
              outlined
              dense
              type="number"
              inputmode="numeric"
              class="no-spinner"
              @keypress="soloNumeros"
            />
          </div>

          <q-input
            v-model="serial_edicion"
            label="Serial del equipo"
            outlined
            dense
            class="q-mt-md"
            @keypress="bloquearEspeciales"
            @update:model-value="
              (val) => (serial_edicion = val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
            "
          />

          <div class="ofi-actions">
            <q-btn
              unelevated
              label="Actualizar"
              color="primary"
              class="ofi-btn"
              :loading="loading"
              :disable="!nuevo_numeroPlaca"
              @click="editarEquipo"
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
import { useEquipos } from 'src/composables/useEquipo'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const { listar, editar, crear, equipos, loading } = useEquipos()

// modo: crear o editar
const modo = ref(route.query.modo || 'crear')

// ===============================
// CREAR
// ===============================
const prefijo_creacion = ref('AXION')
const numeroPlaca = ref('')
const serial_creacion = ref('')

// ===============================
// EDITAR
// ===============================
const nombre_actual = ref('')
const equipo_id = ref('')
const prefijo_edicion = ref('AXION')
const nuevo_numeroPlaca = ref('')
const serial_edicion = ref('')

// opciones prefijo
const opcionesprefijo = [
  'NX',
  'AXION',
  'QRT',
  'VEL',
  'ZK',
  'ORV',
  'NOVA',
]

// ===============================
// FUNCIONES
// ===============================
function bloquearEspeciales(e) {
  const regex = new RegExp('^[a-zA-Z0-9]+$')
  const key = String.fromCharCode(!e.charCode ? e.which : e.charCode)

  if (!regex.test(key)) {
    e.preventDefault()
    return false
  }
}

function soloNumeros(e) {
  const regex = /^[0-9]$/
  const key = String.fromCharCode(e.which || e.keyCode)
  if (!regex.test(key)) {
    e.preventDefault()
  }
}

// ===============================
// CARGAR DATOS SI ES EDICIÓN
// ===============================
async function cargarEquipoEditar() {
  const equipoNombre = route.query.equipo

  if (!equipoNombre) {
    $q.notify({ type: 'negative', message: 'No se recibió equipo a editar' })
    router.push('/equipos')
    return
  }

  await listar({ search: equipoNombre })

  const equipo = equipos.value.find(e => e.nombre_equipo === equipoNombre)


  if (!equipo) {
    $q.notify({ type: 'negative', message: 'Equipo no encontrado' })
    router.push('/gestion')
    return
  }

  // llenar formulario
  nombre_actual.value = equipo.nombre_equipo
  equipo_id.value = equipo.id

  const partes = equipo.nombre_equipo.split('-')
  prefijo_edicion.value = partes[0] || 'AXION'
  nuevo_numeroPlaca.value = partes[1] || ''
  serial_edicion.value = equipo.serial || ''
}

// ===============================
// CREAR
// ===============================
async function crearEquipo() {
  const nombreCompleto = `${prefijo_creacion.value}-${numeroPlaca.value}`.replace(/\s+/g, '')

    await crear({
      nombre_equipo: nombreCompleto,
      serial: serial_creacion.value
    })
    volver()
}

// ===============================
// EDITAR
// ===============================
async function editarEquipo() {
  const nombreNuevo = `${prefijo_edicion.value}-${nuevo_numeroPlaca.value}`.replace(/\s+/g, '')

    await editar({
      nombre_actual: equipo_id.value,
      nombre_nuevo: nombreNuevo,
      serial_nuevo: serial_edicion.value
    })
    volver()
}

function volver() {
  router.push('/gestion')
}

// ===============================
// INIT
// ===============================
onMounted(async () => {
  if (modo.value === 'editar') {
    await cargarEquipoEditar()
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
  max-width: 900px;
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

.ofi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
  .ofi-grid {
    grid-template-columns: 1fr;
  }
}
</style>