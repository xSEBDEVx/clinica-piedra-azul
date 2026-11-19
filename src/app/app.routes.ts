import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { inicioGuard } from './core/guards/inicio.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    // Destino de la redirección de Keycloak: envía al usuario a su pantalla según el rol.
    path: 'inicio',
    canActivate: [authGuard, inicioGuard],
    children: [],
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/paciente/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'agendar-cita',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente'] },
    loadComponent: () =>
      import('./pages/paciente/agendar-cita/agendar-cita').then((m) => m.AgendarCita),
  },
  {
    // HU-2.3: citas del paciente y cancelación con justificación
    path: 'mis-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente'] },
    loadComponent: () => import('./pages/paciente/mis-citas/mis-citas').then((m) => m.MisCitas),
  },
  {
    // HU-5.1: reporte gráfico de citas por mes y por médico
    path: 'reportes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesional', 'administrador'] },
    loadComponent: () => import('./pages/profesional/reportes/reportes').then((m) => m.Reportes),
  },
  {
    path: 'consulta-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesional', 'agendador', 'administrador'] },
    loadComponent: () =>
      import('./pages/agendador/consulta-citas/consulta-citas').then((m) => m.ConsultaCitas),
  },
  {
    // HU-4.1: historial de citas de un paciente por cédula
    path: 'historial-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesional', 'agendador', 'administrador'] },
    loadComponent: () =>
      import('./pages/agendador/historial-citas/historial-citas').then((m) => m.HistorialCitas),
  },
  {
    path: 'admin/configuracion-agenda',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('./pages/admin/configuracion-agenda/configuracion-agenda').then(
        (m) => m.ConfiguracionAgenda,
      ),
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./pages/shared/no-autorizado/no-autorizado').then((m) => m.NoAutorizado),
  },
  { path: '**', redirectTo: '' },
];
