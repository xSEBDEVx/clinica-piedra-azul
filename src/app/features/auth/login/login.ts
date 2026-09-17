import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  readonly form = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const { login, password } = this.form.getRawValue();

    this.authService.login({ login: login!, password: password! }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.redirigirSegunRol(res.rol);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const apiError = err.error as ApiError | undefined;
        this.errorMensaje.set(
          apiError?.mensaje ?? 'No fue posible iniciar sesión. Verifica tus credenciales.',
        );
      },
    });
  }

  private redirigirSegunRol(rol: string): void {
    switch (rol) {
      case 'paciente':
        this.router.navigate(['/agendar-cita']);
        break;
      case 'agendador':
        this.router.navigate(['/consulta-citas']);
        break;
      case 'administrador':
        this.router.navigate(['/admin/configuracion-agenda']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
