import { ref } from 'vue'
import { movimientosService } from 'src/services/movimientoService'
import { notifyError} from 'src/utils/notify'

export function useMovimientos() {

  const movimientos = ref([])
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
    ordering: '-fecha'
  })

  let timeout = null

  const listar = async (params = {}) => {
    loading.value = true

    try {
      const { data } = await movimientosService.listar({
        search: filtros.value.search || null,
        ordering: filtros.value.ordering || '-fecha',

        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,

        ...params
      })

      movimientos.value = data.results ?? []
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

  const limpiarFiltros = () => {
    filtros.value = {
      search: '',
      ordering: '-fecha'
    }

    pagination.value.page = 1

    listar()
  }

  return {
    movimientos,
    total,
    pagination,
    loading,
    filtros,

    listar,
    buscarConDebounce,
    limpiarFiltros
  }
}