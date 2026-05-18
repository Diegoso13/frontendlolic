<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="ofi-header__title">Recuperación de licencia</h1>
        <p class="ofi-header__sub">
          Selecciona un equipo con licencia asignada y registra el retiro.
        </p>
      </div>
    </div>

    <!-- BODY -->
    <div class="ofi-body">

      <!-- CARD EQUIPO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Equipo a recuperar</p>

        <q-select
          v-model="equipoSeleccionado"
          use-input
          input-debounce="400"
          label="Buscar equipo"
          :options="equiposFiltrados"
          option-label="nombre_equipo"
          :loading="loading"
          clearable
          outlined
          dense
          @filter="buscarEquipos"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay resultados
              </q-item-section>
            </q-item>
          </template>

          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.nombre_equipo }}</q-item-label>
                <q-item-label caption>
                  Serial: {{ scope.opt.serial || 'N/A' }} |
                  Estado: {{ scope.opt.estado || 'N/A' }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="equipoSeleccionado" class="q-mt-md">
          <div class="ofi-card__mini">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              Detalles
            </div>

            <div><b>Equipo:</b> {{ equipoSeleccionado.nombre_equipo }}</div>
            <div><b>Serial:</b> {{ equipoSeleccionado.serial || 'N/A' }}</div>
            <div><b>Usuario:</b> {{ equipoSeleccionado.usuario || 'N/A' }}</div>
            <div><b>Software:</b> {{ equipoSeleccionado.software || 'N/A' }}</div>

            <div>
              <b>Estado:</b>
              <span :class="chipClass(equipoSeleccionado.estado)">
                {{ equipoSeleccionado.estado || 'SIN ESTADO' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD DATOS -->
      <div class="ofi-card">
        <p class="ofi-card__title">Datos de recuperación</p>

        <div class="ofi-grid">
          <q-input
            :model-value="softwareActual"
            label="Licencia a recuperar"
            readonly
            outlined
            dense
          />

          <q-input
            v-model="ticket"
            label="Ticket de retiro"
            type="number"
            inputmode="numeric"
            class="no-spinner"
            outlined
            dense
            @keypress="soloNumeros"
          />

          <q-input
            v-model="observacion"
            label="Observación (opcional)"
            type="textarea"
            outlined
            dense
            autogrow
            class="col-span-2"
          />


        </div>

        <div v-if="equipoSeleccionado && !estadoValido" class="q-mt-md ofi-error">
          Solo se puede recuperar una licencia que esté en estado <b>ASIGNADA</b>.
        </div>

        <div class="ofi-actions">
          <q-btn
            flat
            label="Limpiar"
            class="ofi-btn--cancel"
            :disable="loadingRecuperar"
            @click="limpiarFormulario"
          />

          <q-btn
            unelevated
            label="Recuperar licencia"
            color="primary"
            class="ofi-btn"
            :loading="loadingRecuperar"
            :disable="!formValido || loadingRecuperar"
            @click="recuperarLicencia"
          />
        </div>
      </div>

      <!-- REGISTRO -->
      <div v-if="registroGenerado" class="ofi-card">
        <p class="ofi-card__title">Registro generado</p>

        <div class="text-weight-bold">Registro de recuperación:</div>
        <div class="text-negative text-h6">{{ registroGenerado }}</div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useOfimatica } from 'src/composables/useOfimatica'

const $q = useQuasar()

// ===============================
// COMPOSABLE
// ===============================
const { registros, loading, listar, recuperar } = useOfimatica()

// ===============================
// STATE
// ===============================
const usuarioLic = ref(localStorage.getItem('username') || '')

const equipoSeleccionado = ref(null)
const equiposFiltrados = ref([])
const observacion = ref('')
const ticket = ref('')
const registroGenerado = ref('')

const loadingRecuperar = ref(false)

// ===============================
// COMPUTEDS
// ===============================
const softwareActual = computed(() => equipoSeleccionado.value?.software || 'N/A')

const estadoValido = computed(() => equipoSeleccionado.value?.estado === 'Asignada')

const formValido = computed(() => {
  return (
    equipoSeleccionado.value &&
    ticket.value &&
    estadoValido.value
  )
})

// ===============================
// BUSCAR EQUIPOS
// ===============================
async function buscarEquipos(val, update, abort) {
  const texto = (val || '').trim()

  if (texto !== '' && texto.length < 2) {
    abort()
    return
  }

  try {
    await listar({ search: texto, estado: 'Asignada' })

    update(() => {
      equiposFiltrados.value = (registros.value || []).map(r => ({
        id: r.nombre_equipo_id,
        nombre_equipo: r.nombre_equipo,
        serial: r.serial,
        estado: r.estado,
        usuario: r.usuario,
        software: r.software,
        software_id: r.software_id
      }))

      if (!equiposFiltrados.value.length) {
        $q.notify({
          type: 'warning',
          message: 'No hay equipos con licencia asignada'
        })
      }
    })

  } catch (error) {
    console.error('Error buscando equipos:', error)
    equiposFiltrados.value = []
  }
}

// ===============================
// LIMPIAR
// ===============================
function limpiarFormulario() {
  equipoSeleccionado.value = null
  ticket.value = ''
  observacion.value = ''
  registroGenerado.value = ''
  equiposFiltrados.value = []
}

// ===============================
// RECUPERAR LICENCIA
// ===============================
async function recuperarLicencia() {
  if (!formValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos antes de recuperar.'
    })
    return
  }

  try {
    loadingRecuperar.value = true

    const payload = {
      nombre_equipo: equipoSeleccionado.value.id,
      software: equipoSeleccionado.value.software_id,
      ticket_retiro: String(ticket.value),
      usuario_licenciamiento: usuarioLic.value,
      observacion: observacion.value || null
    }

    await recuperar(payload)

    // REGISTRO GENERADO CORRECTO
    registroGenerado.value =
      `-R-${equipoSeleccionado.value.software}-TK${ticket.value}-${usuarioLic.value}`

    // limpiar sin borrar registro
    equipoSeleccionado.value = null
    ticket.value = ''
    observacion.value = ''

  } catch (error) {
    console.error('Error recuperando licencia:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al recuperar licencia.'
    })
  } finally {
    loadingRecuperar.value = false
  }
}

// ===============================
// CHIP CLASS
// ===============================
function chipClass(est) {
  const base = 'ofi-chip'
  const map = {
    Asignada: 'ofi-chip--asignada',
    Recuperada: 'ofi-chip--recuperada',
    Trasladada: 'ofi-chip--trasladada'
  }
  return `${base} ${map[est] ?? ''}`
}

// ===============================
// SOLO NUMEROS
// ===============================
function soloNumeros(e) {
  const key = String.fromCharCode(e.which || e.keyCode)
  if (!/^[0-9]$/.test(key)) e.preventDefault()
}
</script>
<style scoped>
.ofi-page {
  background: #f0f4fa;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

.ofi-header {
  padding: 28px 32px 24px;
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

.ofi-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

.ofi-card {
  background: #fff;
  border: 1px solid #dde6f3;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.ofi-card__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6b87aa;
  margin: 0 0 14px;
}

.ofi-card__mini {
  background: #f7f9fd;
  border: 1px solid #e2e9f5;
  border-radius: 10px;
  padding: 12px 14px;
}

.ofi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.col-span-2 {
  grid-column: span 2;
}

.ofi-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.ofi-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0 24px;
  height: 40px;
}

.ofi-btn--cancel {
  border-radius: 8px;
  font-weight: 600;
  color: #555;
}

.ofi-error {
  background: #fff0f0;
  color: #c0392b;
  border-left: 3px solid #e74c3c;
  padding: 10px 12px;
  border-radius: 10px;
}

.ofi-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.ofi-chip--asignada {
  background: #e8f2ff;
  color: #1556c0;
}

.ofi-chip--recuperada {
  background: #fde8e8;
  color: #c0392b;
}

.ofi-chip--trasladada {
  background: #fff4db;
  color: #a66a00;
}

@media (max-width: 600px) {
  .ofi-header {
    padding: 20px 16px;
  }

  .ofi-body {
    padding: 16px 12px 40px;
  }

  .ofi-grid {
    grid-template-columns: 1fr;
  }
}
</style>