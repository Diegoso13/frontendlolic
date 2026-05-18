import { useCrud } from 'src/composables/useCRUD'
import {ciudadService,propietarioService,sedeService,softwareService} from  'src/services/catalogoService'

////////////SEDE///////////////
export function useSede() {
  const crud = useCrud(sedeService, {
    msgCrear: 'Sede creada correctamente',
    msgEditar: 'Sede actualizada correctamente',
    msgEliminar: 'Sede eliminada correctamente',
    refrescarDespuesEliminar: true
  })

  return {
    sedes: crud.items,
    ...crud
  }
}

////////////SOFTWARE///////////////
export function useSoftware() {
  const crud = useCrud(softwareService, {
    msgCrear: 'Software creado correctamente',
    msgEditar: 'Software actualizado correctamente',
    msgEliminar: 'Software eliminado correctamente',
    refrescarDespuesEliminar: true
  })

  return {
    software: crud.items,
    ...crud
  }
}

////////////CIUDAD///////////////
export function useCiudad() {
  const crud = useCrud(ciudadService, {
    msgCrear: 'Ciudad creada correctamente',
    msgEditar: 'Ciudad actualizada correctamente',
    msgEliminar: 'Ciudad eliminada correctamente',
    refrescarDespuesEliminar: true
  })

  return {
    ciudades: crud.items,
    ...crud
  }
}

////////////PROPIETARIO///////////////
export function usePropietario() {
  const crud = useCrud(propietarioService, {
    msgCrear: 'Propietario creado correctamente',
    msgEditar: 'Propietario actualizado correctamente',
    msgEliminar: 'Propietario eliminado correctamente',
    refrescarDespuesEliminar: true
  })

  return {
    propietarios: crud.items,
    ...crud
  }
}

