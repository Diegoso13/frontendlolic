import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'

export function useAuth() {
  const router = useRouter()
  const $q = useQuasar()

  const loading = ref(false)
  const user = ref(null)

  async function login(username, password) {
    loading.value = true

    try {
      const res = await authService.login({ username, password })

      const access = res.data.access
      const refresh = res.data.refresh

      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)

      // traer perfil real (username/rol)
      const perfilRes = await authService.perfil()

      localStorage.setItem('username', perfilRes.data.username)
      localStorage.setItem('rol', perfilRes.data.rol)

      user.value = perfilRes.data

      $q.notify({
        type: 'positive',
        message: 'Sesión iniciada correctamente'
      })

      router.push('/')

      return res.data

    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.detail || 'Credenciales incorrectas'
      })
      throw error

    } finally {
      loading.value = false
    }
  }

  async function refreshToken() {
    try {
      const refresh = localStorage.getItem('refresh')
      if (!refresh) throw new Error('No refresh token')

      const res = await authService.refresh({ refresh })

      localStorage.setItem('access', res.data.access)

      return res.data.access

    } catch (error) {
      logout()
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    localStorage.removeItem('rol')

    user.value = null

    router.push('/login')
  }

  async function cargarPerfil() {
    try {
      const res = await authService.perfil()
      user.value = res.data

      localStorage.setItem('username', res.data.username)
      localStorage.setItem('rol', res.data.rol)

      return res.data
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    loading,
    user,
    login,
    logout,
    refreshToken,
    cargarPerfil
  }
}