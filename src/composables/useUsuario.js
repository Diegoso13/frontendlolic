import { ref } from 'vue'
import { usuarioService } from 'src/services/usuarioService'
import { notifyError, notifySuccess } from 'src/utils/notify'

export function useUsuarios() {

  const usuarios = ref([])
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

  // ==========================
  // LISTAR
  // ==========================
  const listar = async (params = {}) => {
    loading.value = true

    try {
      const { data } = await usuarioService.listar({
        search: filtros.value.search || null,
        ordering: filtros.value.ordering || null,

        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,

        ...params
      })

      usuarios.value = data.results ?? []
      total.value = data.count ?? 0

      pagination.value.rowsNumber = total.value

    } catch (e) {
      notifyError(e)
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // DEBOUNCE SEARCH
  // ==========================
  const buscarConDebounce = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      pagination.value.page = 1
      listar()
    }, 400)
  }

  // ==========================
  // CREAR
  // ==========================
  const crear = async (payload) => {
    loading.value = true

    try {
      const { data } = await usuarioService.crear(payload)

      usuarios.value = [data, ...usuarios.value]

      notifySuccess('Usuario creado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // EDITAR
  // ==========================
  const editar = async (payload) => {
    loading.value = true

    try {
      const { data } = await usuarioService.editar(payload)

      const idx = usuarios.value.findIndex(u => u.id === data.id)
      if (idx !== -1) usuarios.value[idx] = data

      notifySuccess('Usuario actualizado correctamente')
      return data

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // ELIMINAR
  // ==========================
  const eliminar = async (username) => {
    loading.value = true

    try {
       await usuarioService.eliminar(username)
       usuarios.value = usuarios.value.filter(u => u.username !== username)
      notifySuccess('Usuario eliminado correctamente')

    } catch (e) {
      notifyError(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    usuarios,
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