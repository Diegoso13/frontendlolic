import { api } from 'src/boot/axios'

////////////////////////////////////////////////// SOFTWARE //////////////
export const softwareService = {

  listar(params = {}) {
    return api.get('/software/', { params })
  },
  crear(payload){
    return api.post('/software/', payload)
  },
  editar(software, payload) {
    return api.put(`/software/${software}/`, payload)
  },
  eliminar(software) {
    return api.delete(`/software/${software}/`)
  }
  
}

////////////////////////////////////////////////// SEDE //////////////

export const sedeService = {

  listar(params = {}) {
    return api.get('/sede/', { params })
  },
  crear(payload){
    return api.post('/sede/', payload)
  },
  editar(sede, payload) {
    return api.put(`/sede/${sede}/`, payload)
  },
  eliminar(sede) {
    return api.delete(`/sede/${sede}/`)
  }
  
}

//////////////////////////////////////////////////  CIUDAD //////////////

export const ciudadService = {

  listar(params = {}) {
    return api.get('/ciudad/', { params })
  },
  crear(payload){
    return api.post('/ciudad/', payload)
  },
  editar(ciudad, payload) {
    return api.put(`/ciudad/${ciudad}/`, payload)
  },
  eliminar(ciudad) {
    return api.delete(`/ciudad/${ciudad}/`)
  } 
  
}

//////////////////////////////////////////////////  CIUDAD //////////////

export const propietarioService = {

  listar(params = {}) {
    return api.get('/propietario/', { params })
  },
  crear(payload){
    return api.post('/propietario/', payload)
  },
  editar(propietario, payload) {
    return api.put(`/propietario/${propietario}/`, payload)
  },
  eliminar(propietario) {
    return api.delete(`/propietario/${propietario}/`)
  } 
  
}