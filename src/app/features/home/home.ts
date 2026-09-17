import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carrusel } from '../../carrusel/carrusel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Carrusel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
