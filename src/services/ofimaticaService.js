import { api } from 'src/boot/axios'

export const ofimaticaService = {

  asignar(payload) {
    return api.post('/ofimatica/asignar/', payload)
  },
  trasladar(payload) {
    return api.post('/ofimatica/trasladar/', payload)
  },
  recuperar(payload) {
    return api.post('/ofimatica/recuperar/', payload)
  },
  listar(params = {}){
    return api.get('/ofimatica/', { params })
  },
  exportar(params = {}){
    return api.get('/ofimatica/exportar/',{params, responseType: 'arraybuffer'})
  },
  actualizar(payload){
    return api.post('/ofimatica/actualizar/', payload)
  },
    
}