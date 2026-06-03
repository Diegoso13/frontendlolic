import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000//licencias/',
  //baseURL: 'https://backendlolic.onrender.com/licencias/',
})

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})


// ===============================
// INTERCEPTOR REQUEST
// ===============================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')

    // No agregar token en login o refresh
    if (config.url.includes('login') || config.url.includes('refresh')) {
      return config
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ===============================
// INTERCEPTOR RESPONSE (AUTO REFRESH)
// ===============================
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // si es 401 y no hemos reintentado
    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login') &&
  !originalRequest.url.includes('refresh')) {
      originalRequest._retry = true

      // Si ya se está refrescando, encolamos
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const refresh = localStorage.getItem('refresh')

        if (!refresh) {
          throw new Error('No refresh token')
        }

        const res = await api.post('refresh/', { refresh })

        const newAccess = res.data.access
        localStorage.setItem('access', newAccess)

        processQueue(null, newAccess)

        originalRequest.headers.Authorization = 'Bearer ' + newAccess
        return api(originalRequest)

      } catch (err) {
        processQueue(err, null)

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('rol')
        localStorage.removeItem('username')

        Notify.create({
          type: 'warning',
          message: 'Sesión expirada, inicia sesión nuevamente.',
          position: 'top',
          timeout: 4000,
        })

        window.location.href = '/#/login'
        return Promise.reject(err)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export { api }
