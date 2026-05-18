import { ref } from 'vue'
import { notifyError, notifySuccess } from 'src/utils/notify'

export function useCrud(service, options = {}) {

  const items = ref([])
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
      const { data } = await service.listar({
        search: filtros.value.search || null,
        ordering: filtros.value.ordering || null,

        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,


        ...params
      })

       items.value = Array.isArray(data) ? data : data.results ?? []
       total.value = data.count ?? items.value.length

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

  const crear = async (payload) => {
    loading.value = true

    try {
      const { data } = await service.crear(payload)

      items.value = [data, ...items.value]

      notifySuccess(options.msgCrear ?? 'Registro creado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const editar = async (id, payload) => {
    loading.value = true

    try {
      const { data } = await service.editar(id, payload)

      const idx = items.value.findIndex(x => x.id === id)
      if (idx !== -1) items.value[idx] = data

      notifySuccess(options.msgEditar ?? 'Registro actualizado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const eliminar = async (id) => {
    loading.value = true

    try {
      await service.eliminar(id)

      items.value = items.value.filter(x => x.id !== id)

      notifySuccess(options.msgEliminar ?? 'Registro eliminado correctamente')

      if (options.refrescarDespuesEliminar) {
        await listar()
      }

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    items,
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