import { api } from 'src/boot/axios'

export const equipoService = {

  crear(payload) {
    return api.post('/equipos/crear/', payload)
  },

  editar(payload) {
    return api.post('/equipos/editar/', payload)
  },
  listar(params = {}){
    return api.get('/equipos/', { params })
  },
  eliminar(nombre_equipo){
    return api.delete('/equipos/eliminar/', { data:{nombre_equipo} })
  }
    
}