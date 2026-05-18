<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        class="ofi-header__back"
        @click="$router.back()"
      />

      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="ofi-header__title">Actualizar asignación</h1>
        <p class="ofi-header__sub">
          Selecciona un equipo con licencia asignada y actualiza ticket o licencia.
        </p>
      </div>
    </div>

    <!-- BODY -->
    <div class="ofi-body">

      <!-- CARD EQUIPO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Equipo (Solo asignados)</p>

        <q-select
          v-model="equipoSeleccionado"
          outlined
          dense
          use-input
          clearable
          input-debounce="400"
          label="Buscar equipo asignado"
          :options="equiposFiltrados"
          option-label="nombre_equipo"
          option-value="id"
          :loading="loadingListar"
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
                  Software: {{ scope.opt.software || 'N/A' }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="equipoSeleccionado" class="ofi-card__mini q-mt-md">
          <div><b>Equipo:</b> {{ equipoSeleccionado.nombre_equipo }}</div>
          <div><b>Serial:</b> {{ equipoSeleccionado.serial || 'N/A' }}</div>
          <div><b>Usuario actual:</b> {{ equipoSeleccionado.usuario || 'N/A' }}</div>
          <div><b>Software actual:</b> {{ equipoSeleccionado.software || 'N/A' }}</div>
          <div><b>Sede:</b> {{ equipoSeleccionado.sede || 'N/A' }}</div>
          <div><b>Ciudad:</b> {{ equipoSeleccionado.ciudad || 'N/A' }}</div>
        </div>
      </div>

      <!-- FORMULARIO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Datos de actualización</p>

        <div class="ofi-grid">

          <q-input
            v-model="ticketUpdate"
            label="Ticket actualización"
            type="number"
            inputmode="numeric"
            class="no-spinner"
            outlined
            dense
            @keypress="soloNumeros"
          />

          <q-select
            v-model="softwareNuevo"
            use-input
            fill-input
            hide-selected
            input-debounce="400"
            label="Nueva licencia (Software)"
            outlined
            dense
            :options="opcionesSoftware"
            option-label="label"
            option-value="value"
            :loading="softwareCrud.loading.value"
            @filter="filterSoftware"
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

        <div class="ofi-actions">
          <q-btn
            flat
            label="Limpiar"
            class="ofi-btn--cancel"
            :disable="loadingActualizar"
            @click="limpiarFormulario"
          />

          <q-btn
            unelevated
            label="Actualizar asignación"
            color="primary"
            class="ofi-btn"
            :loading="loadingActualizar"
            :disable="!formValido || loadingActualizar"
            @click="actualizarAsignacion"
          />
        </div>
      </div>

      <!-- REGISTRO -->
      <div v-if="registroGenerado" class="ofi-card">
        <p class="ofi-card__title">Registro generado</p>

        <div class="text-weight-bold q-mb-sm">Movimiento:</div>
        <div class="text-primary text-h6">{{ registroGenerado }}</div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

import { useOfimatica } from 'src/composables/useOfimatica'
import { useSoftware } from 'src/composables/useCatalogo'

const $q = useQuasar()

// ===============================
// COMPOSABLES
// ===============================
const { listar, actualizar, registros, loading: loadingActualizar } = useOfimatica()
const softwareCrud = useSoftware()

// ===============================
// STATE
// ===============================
const equiposFiltrados = ref([])
const equipoSeleccionado = ref(null)

const softwareNuevo = ref(null)
const ticketUpdate = ref('')
const observacion = ref('')
const registroGenerado = ref('')

const usuarioLic = ref(localStorage.getItem('username') || '')

// ===============================
// OPCIONES SOFTWARE
// ===============================
const opcionesSoftware = ref([])

// ===============================
// LOADING
// ===============================
const loadingListar = ref(false)

// ===============================
// VALIDACIÓN FORM
// ===============================
const formValido = computed(() => {
  if (!equipoSeleccionado.value) return false
  if (!ticketUpdate.value) return false
  if (!softwareNuevo.value) return false

  const actual = (equipoSeleccionado.value.software || '').trim().toLowerCase()
  const nuevo = (softwareNuevo.value.label || '').trim().toLowerCase()

  return actual !== nuevo
})

// ===============================
// FILTRAR SOFTWARE
// ===============================
async function filterSoftware(val, update, abort) {
  const texto = (val || '').trim()

  if (texto !== '' && texto.length < 2) {
    abort()
    return
  }

  await softwareCrud.listar(texto ? { search: texto } : {})

  update(() => {
    opcionesSoftware.value = (softwareCrud.items.value || []).map(x => ({
      label: x.software,
      value: x.id
    }))
  })
}

// ===============================
// BUSCAR EQUIPOS ASIGNADOS
// ===============================
async function buscarEquipos(val, update, abort) {
  const texto = (val || '').trim()

  if (texto !== '' && texto.length < 2) {
    abort()
    return
  }

  loadingListar.value = true

  try {
    await listar({ search: texto, estado: 'Asignada' })

    update(() => {
      if (!registros.value || registros.value.length === 0) {
        $q.notify({
          type: 'warning',
          message: 'No hay equipos con licencia asignada'
        })
        equiposFiltrados.value = []
        return
      }

      equiposFiltrados.value = registros.value.map(r => ({
        id: r.nombre_equipo_id,
        nombre_equipo: r.nombre_equipo,
        serial: r.serial,
        estado: r.estado,
        usuario: r.usuario,
        software: r.software,
        sede: r.sede,
        ciudad: r.ciudad
      }))
    })
  } finally {
    loadingListar.value = false
  }
}

// ===============================
// LIMPIAR FORMULARIO
// ===============================
function limpiarFormulario() {
  equipoSeleccionado.value = null
  softwareNuevo.value = null
  ticketUpdate.value = ''
  observacion.value = ''
  equiposFiltrados.value = []
}

// ===============================
// ACTUALIZAR ASIGNACIÓN
// ===============================
async function actualizarAsignacion() {
  if (!formValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Complete los campos y seleccione una licencia diferente.'
    })
    return
  }

  const payload = {
    nombre_equipo: equipoSeleccionado.value.id,
    software: softwareNuevo.value.value,
    ticket_asignacion: String(ticketUpdate.value),
    usuario_licenciamiento: usuarioLic.value,
    observacion: observacion.value || null
  }

  await actualizar(payload)

  registroGenerado.value =
    `-U-${softwareNuevo.value.label}-TK${ticketUpdate.value}-${usuarioLic.value}`

  limpiarFormulario()
}

// ===============================
// SOLO NÚMEROS
// ===============================
function soloNumeros(e) {
  const key = String.fromCharCode(e.which || e.keyCode)
  if (!/^[0-9]$/.test(key)) {
    e.preventDefault()
  }
}
</script>

<style scoped>
/* (Tus estilos quedan igual, no los toqué) */
.ofi-page {
  background: #f0f4fa;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

.ofi-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 32px 24px;
  background: #1a3f73;
}

.ofi-header__back {
  flex-shrink: 0;
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