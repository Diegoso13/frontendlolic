<template>
  <q-page class="page-bg">

    <!-- HEADER -->
    <div class="reasig-header">
      <div>
        <span class="ofi-header__eyebrow">Licencias</span>
        <h1 class="reasig-header__title">Catálogos Ofimática</h1>
        <p class="reasig-header__sub">
          Administra software, propietarios, sedes y ciudades del sistema.
        </p>
      </div>

      <div class="total-box">
        <div class="total-label">Total</div>
        <div class="total-value">{{ totalRegistros }}</div>
      </div>
    </div>

    <!-- TABS -->
    <q-card class="q-mb-md shadow-card rounded-card">
      <q-separator />

      <q-card-section class="q-py-sm">
        <q-tabs
          v-model="tab"
          dense
          align="left"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="software" label="Software" />
          <q-tab name="propietario" label="Propietarios" />
          <q-tab name="sede" label="Sedes" />
          <q-tab name="ciudad" label="Ciudades" />
        </q-tabs>
      </q-card-section>
    </q-card>

    <!-- ACCIONES -->
    <q-card class="q-mb-md shadow-card rounded-card">
      <q-card-section class="row items-center q-col-gutter-sm">

        <!-- CREAR -->
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo"
            unelevated
            class="btn-action"
            @click="abrirDialogCrear"
          />
        </div>

        <q-separator vertical class="q-mx-md" />

        <!-- EDITAR -->
        <div class="col-auto">
          <q-btn
            color="warning"
            icon="edit"
            label="Actualizar"
            unelevated
            class="btn-action"
            :disable="!registroSeleccionado"
            @click="abrirDialogEditar"
          />
        </div>

        <!-- ELIMINAR -->
        <div class="col-auto">
          <q-btn
            color="negative"
            icon="delete"
            label="Eliminar"
            unelevated
            class="btn-action"
            :disable="!registroSeleccionado"
            @click="eliminarRegistro"
          />
        </div>

        <div class="col-grow" />

        <!-- BUSCADOR -->
        <div class="usu-filters">
          <q-input
            v-model="config.crud.filtros.value.search"
            outlined
            dense
            debounce="0"
            placeholder="Buscar..."
            class="usu-filters__search"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>

            <template #append>
              <q-icon
                v-if="config.crud.filtros.value.search"
                name="close"
                size="16px"
                class="cursor-pointer"
                @click="config.crud.filtros.value.search = ''"
              />
            </template>
          </q-input>
        </div>

      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card class="shadow-card rounded-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="rowsActuales"
          :columns="columns"
          row-key="valor"
          :loading="loadingActual"
          selection="single"
          v-model:selected="selected"
          flat
          bordered
          separator="horizontal"
          class="custom-table"

          v-model:pagination="config.crud.pagination.value"
          @request="onRequest"
          :rows-per-page-options="[5, 10, 20,50]"
          binary-state-sort
          no-data-label="Sin registros."
        >
        <template #loading>
          <q-inner-loading showing>
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
        </template>

        </q-table>
      </q-card-section>
    </q-card>

    <!-- DIALOG CREAR/EDITAR -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 460px" class="rounded-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">
            {{ modoEdicion ? `Editar ${tituloActual}` : `Nuevo ${tituloActual}` }}
          </div>

          <q-btn dense flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="form.valor"
            outlined
            dense
            :label="tituloActual"
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="folder" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            :label="modoEdicion ? 'Actualizar' : 'Guardar'"
            @click="guardarRegistro"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

import { useSoftware, usePropietario, useSede, useCiudad } from 'src/composables/useCatalogo'

const $q = useQuasar()

const tab = ref('software')

// CRUDS
const softwareCrud = useSoftware()
const propietarioCrud = usePropietario()
const sedeCrud = useSede()
const ciudadCrud = useCiudad()

// tabla selección
const selected = ref([])
const registroSeleccionado = computed(() => selected.value[0] || null)

// dialog
const dialog = ref(false)
const modoEdicion = ref(false)

// form
const form = ref({
  valor: ''
})

// config dinámica
const config = computed(() => {
  const map = {
    software: {
      titulo: 'Software',
      crud: softwareCrud,
      field: 'software'
    },
    propietario: {
      titulo: 'Propietario',
      crud: propietarioCrud,
      field: 'propietario'
    },
    sede: {
      titulo: 'Sede',
      crud: sedeCrud,
      field: 'sede'
    },
    ciudad: {
      titulo: 'Ciudad',
      crud: ciudadCrud,
      field: 'ciudad'
    }
  }

  return map[tab.value]
})

const tituloActual = computed(() => config.value.titulo)
const loadingActual = computed(() => config.value.crud.loading.value)

const onRequest = async ({ pagination: pag }) => {
  config.value.crud.pagination.value = {
    ...config.value.crud.pagination.value,
    page: pag.page,
    rowsPerPage: pag.rowsPerPage,
    sortBy: pag.sortBy,
    descending: pag.descending
  }
  config.value.crud.filtros.value.ordering = pag.sortBy
    ? (pag.descending ? `-${pag.sortBy}` : pag.sortBy)
    : null

  await listarActual()
}

// rows tabla
const rowsActuales = computed(() => {
  return config.value.crud.items.value.map(x => ({
    valor: x[config.value.field]
  }))
})

const totalRegistros = computed(() => rowsActuales.value.length)

// columnas tabla
const columns = computed(() => [
  {
    name: config.value.field,
    label: tituloActual.value,
    field: 'valor',
    align: 'left',
    sortable: true
  }
])

// listar actual
async function listarActual() {
  await config.value.crud.listar()
}

onMounted(async () => {
  await listarActual()
})

// cambiar tab
watch(tab, async () => {
  selected.value = []
  await listarActual()
})

// debounce search
watch(
  () => config.value.crud.filtros.value.search,
  () => config.value.crud.buscarConDebounce()
)

// abrir dialog crear
function abrirDialogCrear() {
  modoEdicion.value = false
  form.value.valor = ''
  dialog.value = true
}

// abrir dialog editar
function abrirDialogEditar() {
  if (!registroSeleccionado.value) return

  modoEdicion.value = true
  form.value.valor = registroSeleccionado.value.valor
  dialog.value = true
}

// guardar
async function guardarRegistro() {
  const valor = form.value.valor.trim()
  if (!valor) return

  const field = config.value.field

  try {
    if (modoEdicion.value && registroSeleccionado.value) {
      const anterior = registroSeleccionado.value.valor
      await config.value.crud.editar(anterior, { [field]: valor })
    } else {
      await config.value.crud.crear({ [field]: valor })
    }

    dialog.value = false
    selected.value = []
    await listarActual()

  } catch (error) {
    // useCrud ya notifica, pero igual lo dejamos
    console.error(error)
  }
}

// eliminar
function eliminarRegistro() {
  if (!registroSeleccionado.value) return

  $q.dialog({
    title: 'Confirmar',
    message: `¿Deseas eliminar "${registroSeleccionado.value.valor}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await config.value.crud.eliminar(registroSeleccionado.value.valor)
    selected.value = []
    await listarActual()
  })

}
</script>

<style scoped>
.reasig-header {
  display: flex;
  align-items: center;
  gap: 16px;
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

.reasig-header__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.reasig-header__sub {
  margin: 0;
  font-size: 13px;
  color: #7a8faf;
}

.page-bg {
  background: #f0f2f7;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

.rounded-card {
  border-radius: 14px;
}

.shadow-card {
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.06);
}

.btn-action {
  border-radius: 10px;
  padding-left: 14px;
  padding-right: 14px;
  font-weight: 600;
}

.total-box {
  margin-left: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px 14px;
  min-width: 90px;
  text-align: center;
}

.total-label {
  font-size: 12px;
  color: #6b7280;
  line-height: 14px;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.custom-table :deep(.q-table__top) {
  padding: 12px;
}

.custom-table :deep(.q-table thead tr th) {
  background: #fafafa;
  font-weight: 700;
  color: #374151;
}

.usu-filters__search {
  width: 320px;
  border-radius: 12px;
}
</style>