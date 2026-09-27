import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import localeEsCOExtra from '@angular/common/locales/extra/es-CO';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Necesario para que el pipe `date` pueda formatear con locale 'es-CO'
// (usado en agendar-cita.html y consulta-citas.html). Sin este registro,
// Angular lanza un error en tiempo de ejecución y la hora no se renderiza.
registerLocaleData(localeEsCO, 'es-CO', localeEsCOExtra);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
