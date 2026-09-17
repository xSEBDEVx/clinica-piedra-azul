import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { AuthResponse } from './auth.models';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  @Input() tipoUsuario: string = '';

  /** Se emite cuando el login fue exitoso, con la respuesta completa del backend. */
  @Output() loginExitoso = new EventEmitter<AuthResponse>();

  formulario: FormGroup;
  cargando = signal(false);
  errorMensaje = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.formulario = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get loginControl() {
    return this.formulario.get('login');
  }

  get passwordControl() {
    return this.formulario.get('password');
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.authService.login(this.formulario.value).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.loginExitoso.emit(respuesta);
      },
      error: (err: Error) => {
        this.cargando.set(false);
        this.errorMensaje.set(err.message);
      },
    });
  }
}
