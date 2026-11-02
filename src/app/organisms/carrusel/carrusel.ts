import { Component } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  templateUrl: './carrusel.html',
  styleUrl: './carrusel.css'
})
export class Carrusel {
  imagenes: string[] = [
    '/images/carrusel3.jpeg',
    '/images/carrusel2.jpg',
    '/images/logo.jpg'
  ];

  indiceActual: number = 0;

  siguiente() {
    if (this.indiceActual < this.imagenes.length - 1) {
      this.indiceActual++;
    } else {
      this.indiceActual = 0;
    }
  }

  anterior() {
    if (this.indiceActual > 0) {
      this.indiceActual--;
    } else {
      this.indiceActual = this.imagenes.length - 1;
    }
  }
}