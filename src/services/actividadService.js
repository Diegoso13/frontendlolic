import { api } from 'src/boot/axios'

export const actividadService = {
  listar(params = {}) {
    return api.get('/actividades/', { params })
  },

  obtener(id) {
    return api.get(`/actividades/${id}/`)
  },

  crear(payload) {
    return api.post('/actividades/', payload)
  },

  actualizar(id, payload) {
    return api.put(`/actividades/${id}/`, payload)
  },

  parcial(id, payload) {
    return api.patch(`/actividades/${id}/`, payload)
  },

  eliminar(id) {
    return api.delete(`/actividades/${id}/`)
  }
}