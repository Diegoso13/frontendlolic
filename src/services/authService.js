import { api } from 'src/boot/axios'

export const authService = {

  login(payload) {
    // payload = { username, password }
    return api.post('/login/', payload)
  },

  refresh(payload) {
    // payload = { refresh: "token" }
    return api.post('/refresh/', payload)
  },

  perfil() {
    return api.get('/auth/perfil/')
  }

}       