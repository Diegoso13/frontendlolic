<template>
  <q-page class="ofi-page">

    <!-- HEADER -->
    <div class="ofi-header">
      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="ofi-header__title">Equipos</h1>
        <p class="ofi-header__sub">{{ total }} registros</p>
      </div>
    </div>

    <!-- TOOLBAR (BOTONES IZQ + BUSCAR DER) -->
    <div class="ofi-toolbar">
      <div class="ofi-toolbar__left">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Crear equipo"
          @click="irCrear"
        />

        <q-btn
          unelevated
          color="orange"
          icon="edit"
          label="Editar"
          :disable="selected.length === 0"
          @click="irEditar"
        />

        <q-btn
          unelevated
          color="negative"
          icon="delete"
          label="Eliminar"
          :disable="selected.length === 0"
          @click="confirmarEliminar"
        />
      </div>

      <div class="ofi-toolbar__right">
        <q-input
          v-model="filtros.search"
          outlined
          dense
          debounce="0"
          placeholder="Buscar por equipo o serial..."
          class="ofi-toolbar__search"
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

        selection="single"
        v-model:selected="selected"

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
      </q-table>
    </div>

  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEquipos } from 'src/composables/useEquipo'

const router = useRouter()
const $q = useQuasar()



const { equipos,total, pagination, loading,filtros, listar, eliminar, buscarConDebounce } = useEquipos()

// SELECCIÓN CHECKBOX
const selected = ref([])

// FILTROS


// PAGINACIÓN

// COLUMNAS
const columnas = [
  { name: 'nombre_equipo', label: 'Equipo', field: 'nombre_equipo', align: 'left', sortable: true },
  { name: 'serial', label: 'Serial', field: 'serial', align: 'left', sortable: true }
]

// SERVER SIDE REQUEST
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

// CARGA INICIAL
onMounted(async () => {
  await listar()
})

// WATCH SEARCH
watch(
  () => filtros.value.search,
  () => {
    pagination.value.page = 1
    buscarConDebounce()
  }
)

// NAVEGACIÓN
function irCrear() {
  router.push({
    path: '/gestion/form',
    query: { modo: 'crear' }
  })
}

function irEditar() {
  if (selected.value.length === 0) return

  router.push({
    path: '/gestion/form',
    query: {
      modo: 'editar',
      equipo: selected.value[0].nombre_equipo
    }
  })
}

// ELIMINAR
function confirmarEliminar() {
  if (selected.value.length === 0) return

  const equipo = selected.value[0]

  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Desea eliminar el equipo ${equipo.nombre_equipo}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {

      await eliminar(equipo.id)
      selected.value = []

      await listar({
        search: filtros.value.search,
        ordering: filtros.value.ordering,
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage
      })

  })
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

/* HEADER */
.ofi-header {
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

/* TOOLBAR */
.ofi-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 18px 32px 10px;
}

.ofi-toolbar__left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ofi-toolbar__right {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}

.ofi-toolbar__search {
  width: 100%;
  max-width: 420px;
}

/* TABLA */
.ofi-table-wrap {
  flex: 1;
  padding: 10px 32px 20px;
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

/* SELECCIONADO */
.ofi-selected {
  padding: 0 32px 32px;
}

.ofi-selected-card {
  border: 1px solid #dde6f3;
  border-radius: 12px;
  background: #fff;
}

@media (max-width: 600px) {
  .ofi-header {
    padding: 20px 16px;
  }

  .ofi-toolbar {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .ofi-toolbar__search {
    max-width: 100%;
  }

  .ofi-table-wrap {
    padding: 12px 16px;
  }

  .ofi-selected {
    padding: 0 16px 16px;
  }
}
</style>