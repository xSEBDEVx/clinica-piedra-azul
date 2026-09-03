import { LoginForm } from './login-form/login-form';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario en Angular 17+

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  // Variable que guarda el nombre de la sección actual
  seccionActiva: string = 'inicio';

  // Función que actualiza la variable cuando el usuario hace clic
  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }
}