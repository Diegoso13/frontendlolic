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
        <h1 class="ofi-header__title">Asignar licencia</h1>
        <p class="ofi-header__sub">
          Selecciona un equipo disponible y completa los datos para asignar la licencia.
        </p>
      </div>
    </div>

    <!-- BODY -->
    <div class="ofi-body">

      <!-- CARD EQUIPO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Equipo</p>

        <q-select
          v-model="equipoSeleccionado"
          outlined
          dense
          use-input
          clearable
          input-debounce="400"
          label="Buscar equipo"
          :options="equiposFiltrados"
          option-label="nombre_equipo"
          option-value="id"
          :loading="loadingEquipos"
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
                  Serial: {{ scope.opt.serial || 'N/A' }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="equipoSeleccionado" class="ofi-card__mini q-mt-md">
          <div><b>Equipo:</b> {{ equipoSeleccionado.nombre_equipo }}</div>
          <div><b>Serial:</b> {{ equipoSeleccionado.serial || 'N/A' }}</div>

          <div v-if="loadingRegistro" class="text-grey q-mt-sm">
            Cargando registro en ofimática...
          </div>

          <template v-else>
            <div v-if="hayRegistro">
              <div>
                <b>Estado:</b>
                <span :class="chipClass(registroOfimatica.estado)">
                  {{ registroOfimatica.estado }}
                </span>
              </div>

              <div><b>Usuario actual:</b> {{ registroOfimatica.usuario || 'N/A' }}</div>
              <div><b>Software actual:</b> {{ registroOfimatica.software || 'N/A' }}</div>
              <div><b>Sede:</b> {{ registroOfimatica.sede || 'N/A' }}</div>
              <div><b>Ciudad:</b> {{ registroOfimatica.ciudad || 'N/A' }}</div>
            </div>

            <div v-else class="text-grey q-mt-sm">
              Este equipo no tiene registro en ofimática.
            </div>
          </template>
        </div>
      </div>

      <!-- FORMULARIO -->
      <div class="ofi-card">
        <p class="ofi-card__title">Datos de asignación</p>

        <div class="ofi-grid">

          <q-input
            v-model="usuario"
            label="Usuario"
            outlined
            dense
            @update:model-value="normalizarUsuario"
          />

          <q-select
            v-model="software"
            use-input
            fill-input
            hide-selected
            input-debounce="400"
            option-label="label"
            option-value="value"
            label="Software"
            outlined
            dense
            :options="opcionesSoftware"
            :loading="softwareCrud.loading.value"
            @filter="filterSoftware"
          />

          <q-select
            v-model="propietario"
            use-input
            fill-input
            hide-selected
            input-debounce="400"
            option-label="label"
            option-value="value"
            label="Propietario"
            outlined
            dense
            :options="opcionesPropietario"
            :loading="propietarioCrud.loading.value"
            @filter="filterPropietario"
          />

          <q-select
            v-model="sede"
            use-input
            fill-input
            hide-selected
            input-debounce="400"
            option-label="label"
            option-value="value"
            label="Sede"
            outlined
            dense
            :options="opcionesSede"
            :loading="sedeCrud.loading.value"
            @filter="filterSede"
          />

          <q-select
            v-model="ciudad"
            use-input
            fill-input
            hide-selected
            input-debounce="400"
            option-label="label"
            option-value="value"
            label="Ciudad"
            outlined
            dense
            :options="opcionesCiudad"
            :loading="ciudadCrud.loading.value"
            @filter="filterCiudad"
          />

          <q-input
            v-model="ticket"
            label="Ticket asignación"
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

        <div class="ofi-actions">
          <q-btn
            flat
            label="Limpiar"
            class="ofi-btn--cancel"
            @click="limpiarFormulario"
          />

          <q-btn
            unelevated
            label="Asignar licencia"
            color="primary"
            class="ofi-btn"
            :loading="loadingAsignar"
            :disable="!formValido || loadingAsignar"
            @click="asignarLicencia"
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
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

import { useOfimatica } from 'src/composables/useOfimatica'
import { useEquipos } from 'src/composables/useEquipo'
import { useCiudad, usePropietario, useSede, useSoftware } from 'src/composables/useCatalogo'

const $q = useQuasar()

// ===============================
// COMPOSABLES
// ===============================
const { equipos, listar, loading: loadingEquipos } = useEquipos()
const { registros, asignar, listar: listarofimatica, loading: loadingAsignar } = useOfimatica()

const softwareCrud = useSoftware()
const propietarioCrud = usePropietario()
const sedeCrud = useSede()
const ciudadCrud = useCiudad()

// ===============================
// STATE
// ===============================
const equiposFiltrados = ref([])
const equipoSeleccionado = ref(null)

const registroOfimatica = ref({})
const loadingRegistro = ref(false)

const usuario = ref('')
const software = ref(null)
const propietario = ref(null)
const sede = ref(null)
const ciudad = ref(null)

const ticket = ref('')
const observacion = ref('')
const registroGenerado = ref('')

const usuarioLic = ref(localStorage.getItem('username') || '')

// ===============================
// OPCIONES SELECT
// ===============================
const opcionesSoftware = ref([])
const opcionesPropietario = ref([])
const opcionesSede = ref([])
const opcionesCiudad = ref([])

// ===============================
// COMPUTEDS
// ===============================
const hayRegistro = computed(() => Object.keys(registroOfimatica.value || {}).length > 0)

const formValido = computed(() => {
  return (
    equipoSeleccionado.value &&
    usuario.value &&
    software.value &&
    propietario.value &&
    sede.value &&
    ciudad.value &&
    ticket.value
  )
})

// ===============================
// HELPERS
// ===============================
function limpiarCampos() {
  usuario.value = ''
  software.value = null
  propietario.value = null
  sede.value = null
  ciudad.value = null
  ticket.value = ''
  observacion.value = ''
}

function limpiarTodo() {
  equipoSeleccionado.value = null
  equiposFiltrados.value = []
  registroOfimatica.value = {}
  limpiarCampos()
}

function normalizarUsuario(val) {
  usuario.value = (val || '').replace(/\s+/g, ' ').trim()
}

function soloNumeros(e) {
  const key = String.fromCharCode(e.which || e.keyCode)
  if (!/^[0-9]$/.test(key)) e.preventDefault()
}

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
// BUSCAR EQUIPOS
// ===============================
async function buscarEquipos(val, update, abort) {
  const texto = (val || '').trim()

  if (texto !== '' && texto.length < 2) {
    abort()
    return
  }

  update(async () => {
    await listar(texto ? { search: texto } : {})

    equiposFiltrados.value = (equipos.value || []).map(r => ({
      id: r.id,
      nombre_equipo: r.nombre_equipo,
      serial: r.serial
    }))
  })
}

// ===============================
// CARGAR REGISTRO OFIMATICA
// ===============================
async function cargarRegistroOfimatica() {
  if (!equipoSeleccionado.value?.id) {
    registroOfimatica.value = {}
    return
  }

  loadingRegistro.value = true

  try {
    await listarofimatica({ nombre_equipo_id: equipoSeleccionado.value.id })

    if (registros.value?.length > 0) {
      registroOfimatica.value = registros.value[0]
      cargarCamposDesdeRegistro() // sin await para no bloquear UI
    } else {
      registroOfimatica.value = {}
    }
  } catch (error) {
    console.error('Error cargando registro ofimatica:', error)
    registroOfimatica.value = {}
  } finally {
    loadingRegistro.value = false
  }
}

// ===============================
// CARGAR CAMPOS DESDE REGISTRO
// ===============================
async function cargarCamposDesdeRegistro() {
  if (!hayRegistro.value) return

  usuario.value = registroOfimatica.value.usuario || ''
  ticket.value = registroOfimatica.value.ticket_asignacion || ''

  const softwareTxt = registroOfimatica.value.software || ''
  const propietarioTxt = registroOfimatica.value.propietario || ''
  const sedeTxt = registroOfimatica.value.sede || ''
  const ciudadTxt = registroOfimatica.value.ciudad || ''

  await Promise.all([
    softwareTxt ? softwareCrud.listar({ search: softwareTxt }) : null,
    propietarioTxt ? propietarioCrud.listar({ search: propietarioTxt }) : null,
    sedeTxt ? sedeCrud.listar({ search: sedeTxt }) : null,
    ciudadTxt ? ciudadCrud.listar({ search: ciudadTxt }) : null
  ])

  if (softwareTxt) {
    const item = softwareCrud.items.value?.find(x => x.software?.trim().toLowerCase() === softwareTxt.trim().toLowerCase())
    if (item) software.value = { label: item.software, value: item.id }
  }

  if (propietarioTxt) {
    const item = propietarioCrud.items.value?.find(x => x.propietario?.trim().toLowerCase() === propietarioTxt.trim().toLowerCase())
    if (item) propietario.value = { label: item.propietario, value: item.id }
  }

  if (sedeTxt) {
    const item = sedeCrud.items.value?.find(x => x.sede?.trim().toLowerCase() === sedeTxt.trim().toLowerCase())
    if (item) sede.value = { label: item.sede, value: item.id }
  }

  if (ciudadTxt) {
    const item = ciudadCrud.items.value?.find(x => x.ciudad?.trim().toLowerCase() === ciudadTxt.trim().toLowerCase())
    if (item) ciudad.value = { label: item.ciudad, value: item.id }
  }
}

// ===============================
// WATCH EQUIPO
// ===============================
watch(equipoSeleccionado, async (nuevo) => {
  limpiarCampos()
  registroOfimatica.value = {}

  if (!nuevo?.id) return

  await cargarRegistroOfimatica()
})

// ===============================
// FILTROS GENERICOS PARA CATALOGOS
// ===============================
async function filtrarCatalogo(val, update, abort, crud, opcionesRef, campoLabel) {
  const texto = (val || '').trim()

  if (texto !== '' && texto.length < 2) {
    abort()
    return
  }

  await crud.listar(texto ? { search: texto } : {})

  update(() => {
    opcionesRef.value = (crud.items.value || []).map(x => ({
      label: x[campoLabel],
      value: x.id
    }))
  })
}

const filterSoftware = (val, update, abort) =>
  filtrarCatalogo(val, update, abort, softwareCrud, opcionesSoftware, 'software')

const filterPropietario = (val, update, abort) =>
  filtrarCatalogo(val, update, abort, propietarioCrud, opcionesPropietario, 'propietario')

const filterSede = (val, update, abort) =>
  filtrarCatalogo(val, update, abort, sedeCrud, opcionesSede, 'sede')

const filterCiudad = (val, update, abort) =>
  filtrarCatalogo(val, update, abort, ciudadCrud, opcionesCiudad, 'ciudad')

// ===============================
// LIMPIAR FORMULARIO
// ===============================
function limpiarFormulario() {
  limpiarTodo()
}

// ===============================
// ASIGNAR LICENCIA
// ===============================
async function asignarLicencia() {
  if (!formValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos antes de asignar.'
    })
    return
  }

  const payload = {
    nombre_equipo: equipoSeleccionado.value.id,
    usuario: usuario.value,
    software: software.value.value,
    propietario: propietario.value.value,
    sede: sede.value.value,
    ciudad: ciudad.value.value,
    ticket_asignacion: String(ticket.value),
    usuario_licenciamiento: usuarioLic.value,
    observacion: observacion.value || null
  }

  await asignar(payload)

  registroGenerado.value = `-A-${software.value.label}-TK${ticket.value}-${usuarioLic.value}`

  limpiarTodo()
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