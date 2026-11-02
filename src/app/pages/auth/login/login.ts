import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Ya no hay formulario propio: el inicio de sesión ocurre en la pantalla de Keycloak.
 * Esta ruta solo redirige hacia allá (o a la pantalla del usuario si ya inició sesión).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  template: `<p class="redirigiendo">Redirigiendo al inicio de sesión…</p>`,
  styles: [
    `
      .redirigiendo {
        text-align: center;
        color: #5f6368;
        padding: 48px 16px;
      }
    `,
  ],
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      void this.router.navigate(['/inicio']);
    } else {
      void this.authService.login();
    }
  }
}
