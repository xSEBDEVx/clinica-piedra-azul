import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { RegistroService } from '../../../core/services/registro.service';
import { ApiError } from '../../../core/models/auth.model';
import { PacienteDTO, UsuarioDTO } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly registroService = inject(RegistroService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly registroExitoso = signal(false);

  readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    cedulaIdentidad: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    // SC-2: valida que los campos requeridos hayan sido diligenciados correctamente.
    // SC-3: valida formato de correo electrónico (Validators.email).
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const { nombreCompleto, cedulaIdentidad, email, telefono, password } =
      this.form.getRawValue();

    const usuario: UsuarioDTO = {
      nombreCompleto: nombreCompleto!,
      login: email!,
      rol: 'paciente',
    };

    const paciente: PacienteDTO = {
      nombreCompleto: nombreCompleto!,
      cedulaIdentidad: cedulaIdentidad!,
      telefono: telefono!,
      email: email!,
    };

    this.registroService.registrarPaciente(usuario, paciente, password!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.registroExitoso.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        // SC-4: si el correo/login ya está registrado, el backend responde 409 (Conflict).
        if (err.status === 409) {
          this.errorMensaje.set('Este correo ya está registrado. Intenta iniciar sesión.');
          return;
        }
        const apiError = err.error as ApiError | undefined;
        this.errorMensaje.set(
          apiError?.mensaje ?? 'No fue posible completar el registro. Intenta nuevamente.',
        );
      },
    });
  }
}
