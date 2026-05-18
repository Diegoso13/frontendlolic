<template>
  <q-page class="act-page">

    <!-- HEADER -->
    <div class="act-header">
      <div>
        <span class="act-header__eyebrow">Agenda</span>
        <h1 class="act-header__title">Calendario de Actividades</h1>
        <p class="act-header__sub">
          {{ actividades.length }} actividades registradas
        </p>
      </div>

      <div class="act-header__actions">
        <q-btn
          color="primary"
          icon="add"
          label=" Actividad"
          unelevated
          @click="showDialog = true"
        />
      </div>
    </div>

    <!-- BODY -->
    <div class="act-body">

      <div class="row q-col-gutter-md">

        <!-- CALENDARIO -->
        <div class="col-12 col-md-4">
          <div class="act-card">
            <p class="act-card__title">Calendario</p>

            <q-date
              v-model="selectedDate"
              :events="eventDates"
              event-color="orange"
              flat
              full-width
              class="act-calendar"
              @update:model-value="filterActivities"
            />
          </div>
        </div>

        <!-- LISTA -->
        <div class="col-12 col-md-8">
          <div class="act-card">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <p class="act-card__title q-mb-xs">Actividades</p>
                <div class="text-subtitle1 text-weight-bold">
                  {{ selectedDate || '...' }}
                </div>
              </div>

              <q-btn
                outline
                color="negative"
                icon="restart_alt"
                label="Limpiar"
                @click="resetForm"
              />
            </div>

            <q-separator class="q-mb-md" />

            <q-list v-if="filteredActivities.length > 0" separator>
              <q-item
                v-for="act in filteredActivities"
                :key="act.id"
                class="q-py-md"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="act.color === 'Realizado' ? 'check_circle' : 'event_available'"
                    :color="act.color === 'Realizado' ? 'positive' : 'primary'"
                    size="md"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label
                    class="text-weight-bold"
                    :class="{ 'text-strike text-grey-6': act.color === 'Realizado' }"
                  >
                    {{ act.titulo }}
                  </q-item-label>

                  <q-item-label caption class="text-grey-7">
                    {{ act.descripcion }}
                  </q-item-label>

                  <div class="q-mt-sm">
                    <span :class="chipClass(act.color)">
                      {{ act.color === 'Realizado' ? 'REALIZADO' : 'PENDIENTE' }}
                    </span>
                  </div>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-xs no-wrap">
                    <q-btn
                      flat
                      round
                      dense
                      :icon="act.color === 'Realizado' ? 'task_alt' : 'radio_button_unchecked'"
                      :color="act.color === 'Realizado' ? 'positive' : 'grey-7'"
                      @click="toggleDone(act)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="primary"
                      @click="editActivity(act)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      @click="confirmDelete(act)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="column flex-center q-pa-xl text-grey-6">
              <q-icon name="event_busy" size="70px" />
              <div class="text-h6 q-mt-md">No hay actividades para esta fecha</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- DIALOG -->
    <q-dialog v-model="showDialog">
      <q-card class="act-dialog">

        <q-card-section class="act-dialog__header">
          <div class="text-h6">
            {{ isEditing ? 'Editar Actividad' : 'Registrar Actividad' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input outlined dense v-model="newActivity.titulo" label="Título" />
          <q-input outlined dense v-model="newActivity.descripcion" label="Descripción" type="textarea" />

          <q-input outlined dense v-model="newActivity.fecha" label="Fecha" mask="date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="newActivity.fecha">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated label="Guardar" color="primary" @click="saveActivity" />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useActividades } from 'src/composables/useActividad'

const $q = useQuasar()

const { actividades, listar, crear, actualizar, parcial, eliminar } = useActividades()

const selectedDate = ref(date.formatDate(Date.now(), 'YYYY/MM/DD'))
const showDialog = ref(false)

const filteredActivities = ref([])
const isEditing = ref(false)
const currentId = ref(null)

const newActivity = ref({
  titulo: '',
  descripcion: '',
  fecha: date.formatDate(Date.now(), 'YYYY/MM/DD'),
  color: 'Normal'
})

const eventDates = computed(() => {
  return actividades.value.map((a) => a.fecha.replace(/-/g, '/'))
})

function filterActivities() {
  const selected = selectedDate.value.replace(/\//g, '-')
  filteredActivities.value = actividades.value.filter((a) => a.fecha === selected)
}

async function fetchActivities() {
  try {
    await listar()
    filterActivities()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar agenda' })
  }
}

function editActivity(act) {
  isEditing.value = true
  currentId.value = act.id

  newActivity.value = {
    titulo: act.titulo,
    descripcion: act.descripcion,
    fecha: act.fecha.replace(/-/g, '/'),
    color: act.color
  }

  showDialog.value = true
}

async function toggleDone(act) {
  try {
    const nuevoEstado = act.color === 'Realizado' ? 'Normal' : 'Realizado'
    await parcial(act.id, { color: nuevoEstado })

    act.color = nuevoEstado
    filterActivities()

    $q.notify({ type: 'positive', message: 'Estado actualizado', timeout: 800 })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el estado' })
  }
}

async function saveActivity() {
  try {
    const dataToSend = {
      titulo: newActivity.value.titulo,
      descripcion: newActivity.value.descripcion,
      fecha: newActivity.value.fecha.replace(/\//g, '-'),
      color: newActivity.value.color
    }

    if (isEditing.value) {
      await actualizar(currentId.value, dataToSend)
      $q.notify({ type: 'positive', message: 'Actividad actualizada' })
    } else {
      await crear(dataToSend)
      $q.notify({ type: 'positive', message: 'Actividad registrada' })
    }

    resetForm()
    await fetchActivities()

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'No se pudo guardar la actividad' })
  }
}

function confirmDelete(act) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${act.titulo}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await eliminar(act.id)
      $q.notify({ type: 'positive', message: 'Actividad eliminada' })
      await fetchActivities()
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error eliminando actividad' })
    }
  })
}

function resetForm() {
  showDialog.value = false
  isEditing.value = false
  currentId.value = null

  newActivity.value = {
    titulo: '',
    descripcion: '',
    fecha: date.formatDate(Date.now(), 'YYYY/MM/DD'),
    color: 'Normal'
  }
}

function chipClass(color) {
  const base = 'act-chip'
  const map = {
    Realizado: 'act-chip--done',
    Normal: 'act-chip--pending'
  }
  return `${base} ${map[color] ?? 'act-chip--pending'}`
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.act-page {
  background: #f0f4fa;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.act-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 28px 32px 20px;
  background: #1a3f73;
  flex-shrink: 0;
}

.act-header__eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #8cc2ff;
  margin-bottom: 4px;
}

.act-header__title {
  margin: 0 0 2px;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}

.act-header__sub {
  margin: 0;
  font-size: 13px;
  color: #b7cbe4;
}

.act-header__actions {
  display: flex;
  align-items: center;
}

/* BODY */
.act-body {
  max-width: 1300px;
  margin: 0 auto;
  padding: 28px 24px 48px;
  width: 100%;
}

/* CARD */
.act-card {
  background: #fff;
  border: 1px solid #dde6f3;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
}

.act-card__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6b87aa;
  margin: 0 0 14px;
}

/* CALENDAR */
.act-calendar {
  width: 100% !important;
  max-width: none !important;
  min-height: 430px;
}

:deep(.q-date__calendar-item) {
  padding: 4px;
}

:deep(.q-date__calendar-days-container) {
  min-height: 300px;
}

/* CHIP */
.act-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.act-chip--done {
  background: #e6f9f0;
  color: #1a8a55;
}

.act-chip--pending {
  background: #e8f2ff;
  color: #1556c0;
}

/* DIALOG */
.act-dialog {
  width: 420px;
  border-radius: 14px;
}

.act-dialog__header {
  background: #1a3f73;
  color: white;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .act-header {
    padding: 20px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .act-body {
    padding: 16px 12px 40px;
  }
}
</style>