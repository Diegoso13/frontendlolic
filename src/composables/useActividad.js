import { ref } from 'vue'
import { actividadService } from 'src/services/actividadService'
import { date } from 'quasar'

export function useActividades() {
  const actividades = ref([])
  const loading = ref(false)

  const filtros = ref({
    search: '',
    fecha: null
  })

  // LISTAR
  const listar = async (params = {}) => {
    loading.value = true
    try {
      const res = await actividadService.listar(params)
      actividades.value = res.data.results || []
      return res
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LISTAR ACTIVIDADES HOY
  // =========================
  const listarHoy = async () => {
    const hoy = date.formatDate(Date.now(), 'YYYY-MM-DD')

    filtros.value.fecha = hoy

    return await listar({
      fecha: hoy,
      search: filtros.value.search || undefined
    })
  }



  // OBTENER
  const obtener = async (id) => {
    loading.value = true
    try {
      const res = await actividadService.obtener(id)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // CREAR
  const crear = async (payload) => {
    loading.value = true
    try {
      const res = await actividadService.crear(payload)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // EDITAR (PUT)
  const actualizar = async (id, payload) => {
    loading.value = true
    try {
      const res = await actividadService.actualizar(id, payload)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // EDITAR PARCIAL (PATCH)
  const parcial = async (id, payload) => {
    loading.value = true
    try {
      const res = await actividadService.parcial(id, payload)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // ELIMINAR
  const eliminar = async (id) => {
    loading.value = true
    try {
      const res = await actividadService.eliminar(id)
      return res.data
    } finally {
      loading.value = false
    }
  }

  return {
    actividades,
    filtros,
    loading,
    listar,
    listarHoy,
    obtener,
    crear,
    actualizar,
    parcial,
    eliminar
  }
}