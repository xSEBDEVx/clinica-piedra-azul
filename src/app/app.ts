import { LoginForm } from './login-form/login-form';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carrusel } from './carrusel/carrusel';
import { PacienteForm } from './paciente-form/paciente-form';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginForm, Carrusel, PacienteForm, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  seccionActiva: string = 'inicio';

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }
}