import { api } from 'src/boot/axios'

export const usuarioService = {

  crear(payload) {
    return api.post('/usuario/crear/', payload)
  },
  editar(payload) {
    return api.post('/usuario/editar/', payload)
  },
  eliminar(username) {
    return api.delete('/usuario/eliminar/', { data: {username} })
  },
  listar(params = {}){
    return api.get('/usuario/', { params })
  },
  
}