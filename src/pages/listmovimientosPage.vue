<template>
  <q-page class="page-bg">

    <!-- HEADER -->
    <div class="mov-header">
      <div>
        <span class="mov-header__eyebrow">Licencias</span>
        <h1 class="mov-header__title">Historial de Movimientos</h1>
        <p class="mov-header__sub">
          Consulta todas las asignaciones, recuperaciones, traslados y actualizaciones.
        </p>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="mov-filters">

      <q-input
        v-model="filtros.search"
        outlined
        dense
        debounce="400"
        placeholder="Buscar ticket, equipo, usuario o software..."
        class="mov-filters__search"
        @update:model-value="buscarConDebounce"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="operacion"
        :options="operaciones"
        outlined
        dense
        clearable
        label="Operación"
        class="mov-filters__select"
        @update:model-value="filtrarOperacion"
      />

    </div>

    <!-- TABLA -->
    <div class="mov-table-wrap">

      <q-table
        :rows="movimientos"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"

        v-model:pagination="pagination"
        @request="onRequest"

        :rows-per-page-options="[5,10,20,50]"
        no-data-label="Sin movimientos."
        class="mov-table"
      >

        <template #loading>
          <q-inner-loading showing>
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
        </template>

        <template #body-cell-operacion="props">
          <q-td :props="props">

            <q-badge
              :color="badgeColor(props.row.operacion)"
              outline
            >
              {{ props.row.operacion }}
            </q-badge>

          </q-td>
        </template>

        <template #body-cell-fecha="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha) }}
          </q-td>
        </template>

      </q-table>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMovimientos } from 'src/composables/useMovimientos'

const {
  movimientos,
  pagination,
  loading,
  filtros,
  listar,
  buscarConDebounce
} = useMovimientos()

const operacion = ref(null)

const operaciones = [
  'ASIGNACIÓN',
  'RECUPERACIÓN',
  'TRASLADO',
  'ACTUALIZACIÓN'
]

const columns = [
  {
    name: 'ticket',
    label: 'Ticket',
    field: 'ticket',
    align: 'left',
    sortable: true
  },
  {
    name: 'equipo',
    label: 'Equipo',
    field: 'equipo',
    align: 'left',
    sortable: true
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario',
    align: 'left',
    sortable: true
  },
  {
    name: 'software',
    label: 'Software',
    field: 'software',
    align: 'left',
    sortable: true
  },
  {
    name: 'usuario_lic',
    label: 'Usuario Lic.',
    field: 'usuario_lic',
    align: 'left'
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'operacion',
    label: 'Operación',
    field: 'operacion',
    align: 'left',
    sortable: true
  },
  
]

onMounted(async () => {
  await listar()
})

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
    : '-fecha'

  await listar()
}

async function filtrarOperacion(value) {
  await listar({
    operacion: value || null
  })
}

function badgeColor(tipo) {
  switch (tipo) {
    case 'ASIGNACIÓN':
      return 'positive'

    case 'RECUPERACIÓN':
      return 'negative'

    case 'TRASLADO':
      return 'warning'

    case 'ACTUALIZACIÓN':
      return 'primary'

    default:
      return 'grey'
  }
}

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleString('es-CO')
}
</script>

<style scoped>

.page-bg {
  background: #f0f2f7;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

/* =========================
   HEADER
========================= */

.mov-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 32px 24px;
  background: #1a3f73;
}

.mov-header__eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #8cc2ff;
  margin-bottom: 4px;
}

.mov-header__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.mov-header__sub {
  margin: 0;
  font-size: 13px;
  color: #c5d4ea;
}

/* =========================
   FILTROS
========================= */

.mov-filters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;

  padding: 24px 32px 0;
}

.mov-filters__search {
  width: 100%;
  max-width: 650px;
}

.mov-filters__select {
  width: 220px;
}

/* =========================
   TABLA
========================= */

.mov-table-wrap {
  padding: 24px 32px 32px;
}

.mov-table {
  border-radius: 14px;
  overflow: hidden;
  background: white;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.06);
}

.mov-table :deep(.q-table__top) {
  padding: 12px;
}

.mov-table :deep(.q-table thead tr th) {
  background: #fafafa;
  font-weight: 700;
  color: #374151;
}

.mov-table :deep(.q-table tbody tr:hover) {
  background: rgba(26, 63, 115, 0.03);
}

/* =========================
   BADGES
========================= */

.mov-table :deep(.q-badge) {
  font-weight: 600;
  padding: 4px 10px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 768px) {

  .mov-header {
    padding: 20px 16px;
  }

  .mov-filters {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .mov-filters__search,
  .mov-filters__select {
    width: 100%;
    max-width: 100%;
  }

  .mov-table-wrap {
    padding: 16px;
  }
}

</style>