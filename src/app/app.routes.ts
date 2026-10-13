import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/paciente/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'agendar-cita',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente'] },
    loadComponent: () =>
      import('./features/paciente/agendar-cita/agendar-cita').then((m) => m.AgendarCita),
  },
  {
    path: 'consulta-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesional', 'agendador', 'administrador'] },
    loadComponent: () =>
      import('./features/agendador/consulta-citas/consulta-citas').then((m) => m.ConsultaCitas),
  },
  {
    // HU-4.1: historial de citas de un paciente por cédula
    path: 'historial-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesional', 'agendador', 'administrador'] },
    loadComponent: () =>
      import('./features/agendador/historial-citas/historial-citas').then((m) => m.HistorialCitas),
  },
  {
    path: 'admin/configuracion-agenda',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('./features/admin/configuracion-agenda/configuracion-agenda').then(
        (m) => m.ConfiguracionAgenda,
      ),
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./features/shared/no-autorizado/no-autorizado').then((m) => m.NoAutorizado),
  },
  { path: '**', redirectTo: '' },
];
