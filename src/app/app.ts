import { Component } from '@angular/core';
import { LayoutPrincipal } from './templates/layout-principal/layout-principal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutPrincipal],
  template: `<app-layout-principal></app-layout-principal>`,
})
export class App {}
