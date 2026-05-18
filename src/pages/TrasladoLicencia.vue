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
        @click="router.back()"
      />

      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="ofi-header__title">Traslado de licencia</h1>
        <p class="ofi-header__sub">
          Selecciona un equipo origen con licencia asignada y un equipo destino para trasladarla.
        </p>
      </div>
    </div>

    <!-- BODY -->
    <div class="ofi-body">
      <div class="row q-col-gutter-md">

        <!-- ORIGEN (OFIMATICA) -->
        <div class="col-12 col-md-6">
          <div class="ofi-card">
            <p class="ofi-card__title">Equipo origen (Ofimática)</p>

            <q-select
              v-model="equipoOrigen"
              outlined
              dense
              use-input
              clearable
              input-debounce="400"
              label="Buscar equipo origen"
              :options="equiposOrigenFiltrados"
              option-label="nombre_equipo"
              option-value="nombre_equipo_id"
              :loading="loadingOrigen"
              @filter="buscarEquiposOrigen"
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

            <div v-if="equipoOrigen" class="q-mt-md">
              <div class="ofi-card__mini">
                <div class="text-subtitle2 text-weight-bold q-mb-sm">
                  Detalles
                </div>

                <div><b>Equipo:</b> {{ equipoOrigen.nombre_equipo }}</div>
                <div><b>Serial:</b> {{ equipoOrigen.serial || 'N/A' }}</div>
                <div><b>Software:</b> {{ equipoOrigen.software || 'N/A' }}</div>
                <div>
                  <b>Estado:</b>
                  <span :class="chipClass(equipoOrigen.estado)">
                    {{ equipoOrigen.estado || 'SIN ESTADO' }}
                  </span>
                </div>
                <div><b>Usuario:</b> {{ equipoOrigen.usuario || 'N/A' }}</div>
              </div>
            </div>

          </div>
        </div>

        <!-- DESTINO (EQUIPOS) -->
        <div class="col-12 col-md-6">
          <div class="ofi-card">
            <p class="ofi-card__title">Equipo destino (Inventario)</p>

            <q-select
              v-model="equipoDestino"
              outlined
              dense
              use-input
              clearable
              input-debounce="400"
              label="Buscar equipo destino"
              :options="equiposDestinoFiltrados"
              option-label="nombre_equipo"
              option-value="id"
              :loading="loadingDestino"
              @filter="buscarEquiposDestino"
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
                      Serial: {{ scope.opt.serial || 'N/A' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div v-if="equipoDestino" class="q-mt-md">
              <div class="ofi-card__mini">
                <div class="text-subtitle2 text-weight-bold q-mb-sm">
                  Detalles
                </div>

                <div><b>Equipo:</b> {{ equipoDestino.nombre_equipo }}</div>
                <div><b>Serial:</b> {{ equipoDestino.serial || 'N/A' }}</div>
              </div>
            </div>

            <q-input
              v-model="usuarioDestino"
              label="Usuario destino"
              class="q-mt-md"
              outlined
              dense
              @update:model-value="normalizarUsuarioDestino"
            />
          </div>
        </div>

      </div>

      <!-- DATOS TRASLADO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Datos del traslado</p>

        <div class="ofi-grid">
          <q-input
            v-model="ticket"
            label="Ticket traslado"
            type="number"
            class="no-spinner"
            inputmode="numeric"
            @keypress="soloNumeros"
            outlined
            dense
          />

          <q-input
            :model-value="usuarioLic"
            label="Usuario licenciamiento"
            readonly
            outlined
            dense
          />

          <q-input
            v-model="observacionorigen"
            label="Observación equipo origen (opcional)"
            type="textarea"
            outlined
            dense
            autogrow
            class="col-span-2"
          />

          <q-input
            v-model="observaciondestino"
            label="Observación equipo destino (opcional)"
            type="textarea"
            outlined
            dense
            autogrow
            class="col-span-2"
          />
        </div>

        <div v-if="mismoEquipo" class="q-mt-md ofi-error">
          El equipo de origen y destino no pueden ser el mismo.
        </div>

        <div v-if="equipoOrigen && equipoOrigen.estado !== 'Asignada'" class="q-mt-md ofi-error">
          El equipo origen debe estar en estado <b>ASIGNADA</b>.
        </div>

        <div class="ofi-actions">
          <q-btn
            flat
            label="Limpiar"
            class="ofi-btn--cancel"
            :disable="loadingTraslado"
            @click="limpiarFormulario"
          />

          <q-btn
            unelevated
            label="Realizar traslado"
            color="primary"
            class="ofi-btn"
            :loading="loadingTraslado"
            :disable="!formValido || mismoEquipo || loadingTraslado"
            @click="trasladarLicencia"
          />
        </div>
      </div>

      <!-- REGISTROS -->
      <div v-if="registroOrigen && registroDestino" class="ofi-card">
        <p class="ofi-card__title">Registros generados</p>

        <div class="q-mb-sm">
          <div class="text-weight-bold">Para el equipo de origen:</div>
          <div class="text-negative text-h6">{{ registroOrigen }}</div>
        </div>

        <q-separator class="q-my-md" />

        <div>
          <div class="text-weight-bold">Para el equipo de destino:</div>
          <div class="text-primary text-h6">{{ registroDestino }}</div>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed,  } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { useOfimatica } from 'src/composables/useOfimatica'
import { useEquipos } from 'src/composables/useEquipo'

const router = useRouter()
const $q = useQuasar()

// ===============================
// COMPOSABLES
// ===============================
const ofimaticaCrud = useOfimatica()
const equiposCrud = useEquipos()

// ===============================
// STATE
// ===============================
const usuarioLic = ref(localStorage.getItem('username') || '')

const equipoOrigen = ref(null)
const equipoDestino = ref(null)

const observacionorigen = ref('')
const observaciondestino = ref('')

const usuarioDestino = ref('')
const ticket = ref('')

const registroOrigen = ref('')
const registroDestino = ref('')

const equiposOrigenFiltrados = ref([])
const equiposDestinoFiltrados = ref([])

const loadingOrigen = ref(false)
const loadingDestino = ref(false)
const loadingTraslado = ref(false)

// ===============================
// HELPERS
// ===============================
function normalizarTexto(val) {
  return (val || '').replace(/\s+/g, ' ').trim()
}

function normalizarUsuarioDestino(val) {
  usuarioDestino.value = normalizarTexto(val)
}

function limpiarCampos() {
  equipoOrigen.value = null
  equipoDestino.value = null
  usuarioDestino.value = ''
  ticket.value = ''
  observacionorigen.value = ''
  observaciondestino.value = ''
  equiposOrigenFiltrados.value = []
  equiposDestinoFiltrados.value = []
}

// ===============================
// BUSCAR ORIGEN (OFIMATICA)
// ===============================
async function buscarEquiposOrigen(val, update, abort) {
  const texto = normalizarTexto(val)

  if (texto && texto.length < 2) {
    abort()
    return
  }

  update(async () => {
    loadingOrigen.value = true

    try {
      await ofimaticaCrud.listar({ search: texto, estado: 'Asignada' })

      equiposOrigenFiltrados.value = (ofimaticaCrud.registros.value || []).map(r => ({
        nombre_equipo_id: r.nombre_equipo_id,
        nombre_equipo: r.nombre_equipo,
        serial: r.serial,
        estado: r.estado,
        usuario: r.usuario,
        software: r.software,
        software_id: r.software_id
      }))

      if (!equiposOrigenFiltrados.value.length) {
        $q.notify({
          type: 'warning',
          message: 'No hay equipos con licencia asignada'
        })
      }

    } catch (error) {
      console.error('Error buscando equipos origen:', error)
      equiposOrigenFiltrados.value = []
      $q.notify({ type: 'negative', message: 'Error cargando equipos origen.' })
    } finally {
      loadingOrigen.value = false
    }
  })
}

// ===============================
// BUSCAR DESTINO (EQUIPOS)
// ===============================
async function buscarEquiposDestino(val, update, abort) {
  const texto = normalizarTexto(val)

  if (texto && texto.length < 2) {
    abort()
    return
  }

  update(async () => {
    loadingDestino.value = true

    try {
      await equiposCrud.listar(texto ? { search: texto } : {})

      equiposDestinoFiltrados.value = (equiposCrud.equipos.value || []).map(e => ({
        id: e.id,
        nombre_equipo: e.nombre_equipo,
        serial: e.serial
      }))

    } catch (error) {
      console.error('Error buscando equipos destino:', error)
      equiposDestinoFiltrados.value = []
      $q.notify({ type: 'negative', message: 'Error cargando equipos destino.' })
    } finally {
      loadingDestino.value = false
    }
  })
}

// ===============================
// VALIDACIONES
// ===============================
const mismoEquipo = computed(() => {
  return (
    equipoOrigen.value &&
    equipoDestino.value &&
    equipoOrigen.value.nombre_equipo_id === equipoDestino.value.id
  )
})

const origenValido = computed(() => {
  return equipoOrigen.value?.estado === 'Asignada'
})

const formValido = computed(() => {
  return (
    equipoOrigen.value &&
    equipoDestino.value &&
    usuarioDestino.value &&
    ticket.value &&
    origenValido.value
  )
})

// ===============================
// LIMPIAR FORM
// ===============================
function limpiarFormulario() {
  limpiarCampos()
  registroOrigen.value = ''
  registroDestino.value = ''
}

// ===============================
// TRASLADAR LICENCIA
// ===============================
async function trasladarLicencia() {
  if (mismoEquipo.value) {
    $q.notify({
      type: 'negative',
      message: 'El equipo de origen y destino no pueden ser el mismo.'
    })
    return
  }

  if (!formValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos antes de realizar el traslado.'
    })
    return
  }

  loadingTraslado.value = true

    const payload = {
      equipo_origen: equipoOrigen.value.nombre_equipo_id,
      equipo_destino: equipoDestino.value.id,
      ticket: String(ticket.value),
      usuario_destino: usuarioDestino.value,
      usuario_licenciamiento: usuarioLic.value,
      observacion_origen: observacionorigen.value || null,
      observacion_destino: observaciondestino.value || null
    }

    await ofimaticaCrud.trasladar(payload)

    const software = equipoOrigen.value.software || 'N/A'

    registroOrigen.value = `-T-${software}-TK${ticket.value}-${usuarioLic.value}`
    registroDestino.value = `-A-${software}-TK${ticket.value}-${usuarioLic.value}`

    // limpiar sin borrar registros
    limpiarCampos()
    loadingTraslado.value = false

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