import { ref } from 'vue'
import { equipoService } from 'src/services/equiposService'
import { notifyError, notifySuccess } from 'src/utils/notify'

export function useEquipos() {

  const equipos = ref([])
  const loading = ref(false)
  const total = ref(0)

   const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
    sortBy: null,
    descending: false,
    ordering: null
  })

  const filtros = ref({
    search: '',
    ordering: null
  })

  let timeout = null

  const listar = async (params = {}) => {
    loading.value = true

    try {
      const { data } = await equipoService.listar({
        search: filtros.value.search || null, 
        ordering: filtros.value.ordering || null, 
      
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,

        ...params
      
      })

      equipos.value = data.results ?? []
      total.value = data.count ?? 0

      pagination.value.rowsNumber = total.value

    } catch (e) {
      notifyError(e)
    } finally {
      loading.value = false
    }
  }

  const buscarConDebounce = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      pagination.value.page = 1
      listar()
    }, 400)
  }


  // CREAR EQUIPO
  const crear = async (payload) => {
    loading.value = true

    try {
      const { data } = await equipoService.crear(payload)

      equipos.value = [data, ...equipos.value]

      notifySuccess('Equipo creado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  //  EDITAR EQUIPO
  const editar = async (payload) => {
    loading.value = true

    try {
      const { data } = await equipoService.editar(payload)

      const idx = equipos.value.findIndex(e => e.id === data.id)
      if (idx !== -1) equipos.value[idx] = data

      notifySuccess('Equipo actualizado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const eliminar = async (nombre_equipo) => {
    loading.value = true
    try {
      await equipoService.eliminar(nombre_equipo)
      equipos.value = equipos.value.filter(e => e.nombre_equipo !== nombre_equipo)
      notifySuccess('Equipo eliminado correctamente')
    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }


  return {
    equipos,
    total,
    pagination,
    loading,
    filtros,

    listar,
    crear,
    editar,
    eliminar,
    buscarConDebounce
  }
}