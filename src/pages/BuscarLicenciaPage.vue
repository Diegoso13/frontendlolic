<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="ofi-header__title">Inventario Ofimática</h1>
        <p class="ofi-header__sub">{{ total }} registros</p>
      </div>

      <div class="ofi-header__actions">
        <q-btn
          v-if="isAdminLike"
          color="green"
          icon="download"
          label="Exportar"
          @click="exportar"
          unelevated
        />
      </div>
    </div>

    <!-- FILTROS -->
    <div class="ofi-filters">
      <div class="ofi-filters__bottom">
        <q-input
          v-model="filtros.search"
          outlined
          dense
          debounce="0"
          placeholder="Buscar por equipo, serial, usuario, software..."
          class="ofi-filters__search"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>

          <template #append>
            <q-icon
              v-if="filtros.search"
              name="close"
              size="16px"
              class="cursor-pointer"
              @click="filtros.search = ''"
            />
          </template>
        </q-input>

        <q-select
          v-if="isAdminLike"
          v-model="filtros.estado"
          :options="estados"
          label="Estado"
          outlined
          dense
          clearable
          placeholder="Estado"
          class="ofi-filters__estado"
        />

        <q-select
          v-if="isAdminLike"
          v-model="filtros.software"
          :options="softwares"
          label="Software"
          outlined
          dense
          clearable
          placeholder="Software"
          class="ofi-filters__estado"
        />

        <q-select
          v-if="isAdminLike"
          v-model="filtros.propietario"
          :options="propietarios"
          label="Propietario"
          outlined
          dense
          clearable
          class="ofi-filters__estado"
        />

        <q-select
          v-if="isAdminLike"
          v-model="filtros.sede"
          :options="sedes"
          label="Sede"
          outlined
          dense
          clearable
          class="ofi-filters__estado"
        />
      </div>
    </div>

    <!-- TABLA -->
    <div class="ofi-table-wrap">
      <q-table
        :rows="equipos"
        :columns="columnas"
        row-key="nombre_equipo"
        flat
        :loading="loading"

        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[10, 20, 50, 100]"
        binary-state-sort
        no-data-label="Sin registros."
        class="ofi-table"
      >
        <template #loading>
          <q-inner-loading showing>
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
        </template>

        <!-- BOTÓN DETALLES -->
        <template #body-cell-detalles="props">
          <q-td :props="props" class="text-center">
            <q-btn
              v-if="isAdminLike"
              flat
              round
              icon="visibility"
              color="primary"
              @click="verDetalles(props.row)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td :props="props">
            <span :class="chipClass(props.row.estado)">
              {{ props.row.estado || '—' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-fecha="props">
          <q-td :props="props">
            {{ formatFecha(props.row.fecha) }}
          </q-td>
        </template>

        <!-- NOTAS recortadas -->
        <template #body-cell-notes="props">
          <q-td :props="props">
            <span class="ofi-obs" :title="props.row.notes">
              {{ props.row.notes || '—' }}
            </span>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- DIALOG DETALLES -->
    <q-dialog v-model="showDetails" v-if="isAdminLike">
      <q-card style="width: 950px; max-width: 95vw">
        <q-card-section class="ofi-dialog-header row items-center">
          <div class="text-h6">
            Equipo:&nbsp;{{ selectedItem?.nombre_equipo }}
            &nbsp;&nbsp;&nbsp;
            Serial:&nbsp;{{ selectedItem?.serial }}
          </div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md scroll" style="max-height: 75vh">
          <!-- DATOS PRINCIPALES -->
          <div class="row q-col-gutter-md q-mb-md">

            <div class="col-12 col-md-6">
              <div class="ofi-dialog-label">Usuario</div>
              <div class="ofi-dialog-value">{{ selectedItem?.usuario || '—' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <div class="ofi-dialog-label">Software</div>
              <div class="ofi-dialog-value">{{ selectedItem?.software || '—' }}</div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Fecha</div>
              <div class="ofi-dialog-value">{{ selectedItem?.fecha || '—' }}</div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Nueva</div>
              <div class="ofi-dialog-value">{{ selectedItem?.nueva || '—' }}</div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Estado</div>
              <div class="ofi-dialog-value">
                <span :class="chipClass(selectedItem?.estado)">
                  {{ selectedItem?.estado || '—' }}
                </span>
              </div>
            </div>

          </div>

          <q-separator class="q-my-md" />

          <!-- TICKETS -->
          <div class="row q-col-gutter-md q-mb-md">

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Ticket Asignación</div>
              <div class="ofi-dialog-value">
                {{ selectedItem?.ticket_asignacion || '—' }}
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Ticket Traslado</div>
              <div class="ofi-dialog-value">
                {{ selectedItem?.ticket_traslado || '—' }}
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Ticket Retiro</div>
              <div class="ofi-dialog-value">
                {{ selectedItem?.ticket_retiro || '—' }}
              </div>
            </div>

          </div>

          <q-separator class="q-my-md" />

          <!-- DATOS EXTRA -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Propietario</div>
              <div class="ofi-dialog-value">{{ selectedItem?.propietario || '—' }}</div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Sede</div>
              <div class="ofi-dialog-value">{{ selectedItem?.sede || '—' }}</div>
            </div>

            <div class="col-12 col-md-4">
              <div class="ofi-dialog-label">Ciudad</div>
              <div class="ofi-dialog-value">{{ selectedItem?.ciudad || '—' }}</div>
            </div>

          </div>

          <q-separator class="q-my-md" />

          <!-- NOTES COMPLETO -->
          <div class="q-mb-md">
            <div class="ofi-dialog-label">Notas</div>

            <div class="ofi-notes-box">
              <pre class="ofi-notes-pre">{{ selectedItem?.notes || '—' }}</pre>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- OBSERVACION -->
          <div class="q-mb-md">
            <div class="ofi-dialog-label">Observación</div>

            <div class="ofi-notes-box">
              <pre class="ofi-notes-pre">{{ selectedItem?.observacion || '—' }}</pre>
            </div>
          </div>

        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch,computed} from 'vue'
import { useOfimatica } from 'src/composables/useOfimatica'
import { useSoftware, useSede, usePropietario } from 'src/composables/useCatalogo'


const rol = ref(localStorage.getItem('rol') || '')

const isAdminLike = computed(() => ['admin', 'licenciamiento'].includes(rol.value))
const isConsulta = computed(() => rol.value === 'consulta')

// ===============================
// OFIMATICA CRUD
// ===============================
const {
  registros: equipos,
  total,
  pagination,
  loading,
  filtros,
  listar,
  exportar,
  buscarConDebounce
} = useOfimatica()

// ===============================
// CATALOGOS CRUD
// ===============================
const softwareCrud = useSoftware()
const sedeCrud = useSede()
const propietarioCrud = usePropietario()

// ===============================
// OPTIONS SELECT (REALES)
// ===============================
const estados = ['Asignada', 'Recuperada', 'Trasladada']

const softwares = ref([])
const sedes = ref([])
const propietarios = ref([])

// ===============================
// DIALOG DETALLES
// ===============================
const showDetails = ref(false)
const selectedItem = ref({})

// columnas tabla
const columnas = computed(() => {
  // CONSULTA: solo ve lo mínimo
  if (isConsulta.value) {
    return [
      { name: 'nombre_equipo', label: 'Equipo', field: 'nombre_equipo', align: 'left', sortable: true },
      { name: 'serial', label: 'Serial', field: 'serial', align: 'left', sortable: true },
      { name: 'software', label: 'Software', field: 'software', align: 'left', sortable: true },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true }
    ]
  }

  // ADMIN / LICENCIAMIENTO: ve todo
  return [
    { name: 'nombre_equipo', label: 'Equipo', field: 'nombre_equipo', align: 'left', sortable: true },
    { name: 'serial', label: 'Serial', field: 'serial', align: 'left', sortable: true },
    { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left', sortable: true },
    { name: 'software', label: 'Software', field: 'software', align: 'left', sortable: true },
    { name: 'propietario', label: 'Propietario', field: 'propietario', align: 'left', sortable: true },
    { name: 'sede', label: 'Sede', field: 'sede', align: 'left', sortable: true },
    { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left', sortable: true },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
    { name: 'nueva', label: 'Nueva', field: 'nueva', align: 'left', sortable: true },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
    { name: 'detalles', label: 'Ver', field: 'detalles', align: 'center' }
  ]
})

// ===============================
// CARGAR CATALOGOS REALES
// ===============================
async function cargarCatalogos() {
  await Promise.all([
    softwareCrud.listar(),
    sedeCrud.listar(),
    propietarioCrud.listar()
  ])

  softwares.value = (softwareCrud.items.value || []).map(x => x.software)
  sedes.value = (sedeCrud.items.value || []).map(x => x.sede)
  propietarios.value = (propietarioCrud.items.value || []).map(x => x.propietario)
}

// ===============================
// REQUEST SERVER SIDE
// ===============================
const onRequest = async ({ pagination: pag }) => {
  pagination.value = {
    ...pagination.value,
    page: pag.page,
    rowsPerPage: pag.rowsPerPage,
    sortBy: pag.sortBy,
    descending: pag.descending
  }

  filtros.value.ordering = pag.sortBy
    ? (pag.descending ? `-${pag.sortBy}` : pag.sortBy)
    : null

  await listar()
}

// ===============================
// INIT
// ===============================
onMounted(async () => {
  if (rol.value !== 'consulta') {
    await cargarCatalogos()
  }

  await listar()
})

// ===============================
// SEARCH DEBOUNCE
// ===============================
watch(
  () => filtros.value.search,
  () => {
    pagination.value.page = 1
    buscarConDebounce()
  }
)

// ===============================
// FILTROS DIRECTOS
// ===============================
watch(
  () => [filtros.value.estado, filtros.value.sede, filtros.value.propietario, filtros.value.software],
  () => {
    pagination.value.page = 1
    listar()
  }
)

// ===============================
// DETALLES
// ===============================
function verDetalles(row) {
  if (!isAdminLike.value) return
  selectedItem.value = row
  showDetails.value = true
}



function chipClass(estado) {
  const base = 'ofi-chip'
  const map = {
    Asignada: 'ofi-chip--asignada',
    Recuperada: 'ofi-chip--recuperada',
    Trasladada: 'ofi-chip--trasladada'
  }
  return `${base} ${map[estado] ?? ''}`
}

function formatFecha(val) {
  if (!val) return '—'

  const parts = val.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return val
}
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
  font-size: 24px;
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

.ofi-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
  margin-top: 20px;
}

.ofi-filters__bottom {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 0 20px;
}

.ofi-filters__search {
  width: 100%;
  max-width: 650px;
}

.ofi-filters__estado {
  width: 170px;
}

.ofi-table-wrap {
  flex: 1;
  padding: 20px 32px 32px;
}

.ofi-table {
  border-radius: 12px;
  border: 1px solid #dde6f3;
  background: #fff;
}

:deep(.ofi-table thead th) {
  background: #f7f9fd;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6b87aa;
  white-space: nowrap;
  border-bottom: 2px solid #dde6f3;
}

:deep(.ofi-table tbody td) {
  font-size: 13px;
  color: #2c3e60;
  white-space: nowrap;
  border-bottom: 1px solid #f0f4fa;
}

:deep(.ofi-table tbody tr:hover td) {
  background: #f5f9ff;
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

.ofi-dialog-header {
  background: #1a3f73;
  color: #fff;
}

.ofi-dialog-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #6b87aa;
}

.ofi-dialog-value {
  font-size: 14px;
  color: #2c3e60;
  border-bottom: 1px solid #eef3fb;
  padding-bottom: 6px;
  margin-bottom: 8px;
}

.ofi-obs {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ofi-notes-box {
  background: #f7f9fd;
  border: 1px solid #dde6f3;
  border-radius: 10px;
  padding: 12px 14px;
  max-height: 250px;
  overflow: auto;
}

.ofi-notes-pre {
  margin: 0;
  font-size: 12px;
  color: #2c3e60;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
}

@media (max-width: 600px) {
  .ofi-header {
    padding: 20px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .ofi-table-wrap {
    padding: 12px 16px;
  }
}
</style>