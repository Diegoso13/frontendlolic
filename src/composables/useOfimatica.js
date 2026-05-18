import { ref } from 'vue'
import { ofimaticaService } from 'src/services/ofimaticaService'
import { notifyError, notifySuccess } from 'src/utils/notify'

export function useOfimatica() {

  const registros = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    sortBy: null,
    descending: false,
    ordering: null
  })

  const filtros = ref({
    search: '',
    estado: null,
    sede: null,
    ciudad: null,
    software: null,
    propietario: null,
    ordering: null
  })

  let timeout = null

  // LISTAR
  const listar = async (params = {}) => {
    loading.value = true

    try {
      const { data } = await ofimaticaService.listar({
        search: filtros.value.search || null,
        estado: filtros.value.estado || null,
        sede: filtros.value.sede || null,
        ciudad: filtros.value.ciudad || null,
        software: filtros.value.software || null,
        propietario: filtros.value.propietario || null,
        ordering: filtros.value.ordering || null,

        // paginación DRF
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,

        ...params
      })

      registros.value = data.results ?? []
      total.value = data.count ?? 0

      pagination.value.rowsNumber = total.value

    } catch (e) {
      notifyError(e)
    } finally {
      loading.value = false
    }
  }

  // DEBOUNCE SEARCH
  const buscarConDebounce = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      pagination.value.page = 1
      listar()
    }, 400)
  }

  // ASIGNAR LICENCIA
  const asignar = async (payload) => {
    loading.value = true

    try {
      const { data } = await ofimaticaService.asignar(payload)

      notifySuccess(data?.mensaje || 'Licencia asignada correctamente')
      await listar()

      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // TRASLADAR LICENCIA
  const trasladar = async (payload) => {
    loading.value = true

    try {
      const { data } = await ofimaticaService.trasladar(payload)

      notifySuccess(data?.mensaje || 'Licencia trasladada correctamente')
      await listar()

      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // RECUPERAR LICENCIA
  const recuperar = async (payload) => {
    loading.value = true

    try {
      const { data } = await ofimaticaService.recuperar(payload)

      notifySuccess(data?.mensaje || 'Licencia recuperada correctamente')
      await listar()

      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ACTUALIZAR LICENCIA
  const actualizar = async (payload) => {
    loading.value = true

    try {
      const { data } = await ofimaticaService.actualizar(payload)

      notifySuccess(data?.mensaje || 'Licencia actualizada correctamente')
      await listar()

      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // EXPORTAR
  const exportar = async () => {
  try {

    const params = {
      search: filtros.value.search || null,
      estado: filtros.value.estado || null,
      sede: filtros.value.sede || null,
      ciudad: filtros.value.ciudad || null,
      software: filtros.value.software || null,
      propietario: filtros.value.propietario || null,
      ordering: filtros.value.ordering || null
    }
    const response = await ofimaticaService.exportar(params)

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'ofimatica.xlsx'

    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)

    notifySuccess('Excel exportado correctamente')
    
    console.log(response.headers['content-type'])

  } catch (e) {
    console.error(e)
    notifyError(e)
  }
}

  return {
    registros,
    total,
    pagination,
    loading,
    filtros,

    listar,
    buscarConDebounce,

    asignar,
    trasladar,
    recuperar,
    actualizar,
    exportar
  }
}