import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './no-autorizado.html',
  styleUrl: './no-autorizado.css',
})
export class NoAutorizado {}
