const routes = [
  // Login route
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },

  // Main layout with child routes
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { roles: ['admin', 'licenciamiento', 'consulta', 'mesa'] },
      },
      {
        path: '/buscar',
        component: () => import('pages/BuscarLicenciaPage.vue'),
        meta: { roles: ['admin', 'licenciamiento', 'consulta', 'mesa'] },
      },
      {
        path: '/asignar',
        component: () => import('pages/AsignarLicenciaPage.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/actualizar',
        component: () => import('pages/ActualizarLicenciaPage.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/traslado',
        component: () => import('pages/TrasladoLicencia.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/recuperacion',
        component: () => import('pages/RecuperarLicencia.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/agenda',
        component: () => import('pages/AgendaPage.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/gestion',
        component: () => import('pages/GestionEquipos.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
      {
        path: '/gestion/form',
        component: () => import('pages/EquiposFormsPage.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },

      {
        path: '/usuarios',
        component: () => import('pages/GestionUsuariosPage.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: '/usuarios/form',
        component: () => import('pages/usuariosFormsPage.vue'),
        meta: { roles: ['admin'] },
      },
      {
        path: '/catalogos',
        component: () => import('pages/catalogoListPage.vue'),
        meta: { roles: ['admin', 'licenciamiento'] },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
