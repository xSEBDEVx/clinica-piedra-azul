# ClinicaPiedraAzul

Frontend en Angular 21 (standalone components) integrado con el backend en Spring Boot del repositorio [Piedrazul-software3](https://github.com/Juanp-UX/Piedrazul-software3). Implementa las historias de usuario HU-1.1, HU-2.1, HU-2.2, HU-3.1 y HU-3.2.

## Cómo levantar el proyecto completo (front + back)

### 1. Backend (Spring Boot)

Requiere Java 21, Maven y PostgreSQL corriendo localmente.

```bash
# Crear la base de datos (una sola vez)
createdb piedrazul
# o desde psql: CREATE DATABASE piedrazul;

cd backend
mvn spring-boot:run
```

El backend queda disponible en `http://localhost:8080`, con todos los endpoints bajo `/api/**`. `application.yaml` usa por defecto `postgres/postgres` como credenciales de la base de datos — ajústalas si tu instalación local usa otras. El esquema se crea automáticamente (`ddl-auto: update`); no hay datos precargados, así que el primer usuario administrador/profesional debe crearse manualmente (ver más abajo).

### 2. Frontend (Angular)

```bash
npm install
ng serve
```

Disponible en `http://localhost:4200`. El archivo `src/environments/environment.ts` ya apunta a `http://localhost:8080/api`; si tu backend corre en otro puerto, ajusta `apiUrl` ahí.

### 3. Crear el primer usuario administrador

El backend no trae un admin precargado. Para poder entrar a "Configurar agenda" (HU-3.1/HU-3.2), crea uno manualmente contra la API, por ejemplo con curl:

```bash
# 1) Crear el usuario base con rol administrador
curl -X POST http://localhost:8080/api/users/registro/usuario \
  -H "Content-Type: application/json" \
  -d '{"nombreCompleto":"Admin Clínica","login":"admin@piedrazul.com","rol":"administrador"}'
# Guarda el "id" que devuelve la respuesta (usuarioId)

# 2) Registrar sus credenciales de acceso
curl -X POST http://localhost:8080/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": <usuarioId>, "login":"admin@piedrazul.com", "password":"TuClaveSegura123"}'
```

Con esas credenciales ya puedes iniciar sesión desde `/login` en el frontend. Del mismo modo se crean profesionales (`POST /api/users/registro/profesional`), que luego aparecerán seleccionables en "Agendar cita" y "Consultar citas".

Los pacientes sí pueden autorregistrarse desde `/registro` (HU-2.1), sin intervención manual.

## Contrato de integración (resumen para el equipo)

- **Auth JWT**: `POST /api/auth/login` devuelve `accessToken`/`refreshToken`. El interceptor (`core/interceptors/auth.interceptor.ts`) adjunta el token a cada petición y renueva automáticamente en un 401.
- **Registro en dos pasos**: crear un `Usuario` (o `Usuario`+`Paciente`/`Profesional`) **no** crea credenciales de acceso. El frontend siempre encadena `POST /api/users/registro/...` → `POST /api/auth/registro` (ver `core/services/registro.service.ts`).
- **IDs no son intercambiables**: `CitaDTO.pacienteId` es el **usuarioId** del paciente (no el id de la tabla `pacientes`). `DisponibilidadSemanalDTO.profesionalId` sí es el id de la tabla `profesionales`. Revisa `core/models/scheduling.model.ts` si tienes dudas.
- **Estados de cita**: el backend maneja únicamente `programada`, `cancelada`, `completada` (en minúscula, tal como se muestran en la UI).
- **Roles**: `paciente`, `agendador`, `administrador`, `profesional`. Las rutas del frontend están protegidas con `authGuard` + `roleGuard` según el rol (`app.routes.ts`).

## Estructura relevante del frontend

```
src/app/
├── core/
│   ├── models/        # Interfaces TS que reflejan los DTOs del backend
│   ├── services/       # AuthService, CitaService, DisponibilidadService, etc.
│   ├── interceptors/    # authInterceptor (JWT + refresh automático)
│   └── guards/         # authGuard, roleGuard
└── features/
    ├── auth/login              # Login conectado al backend
    ├── paciente/registro       # HU-2.1: registro de paciente
    ├── paciente/agendar-cita   # HU-2.2: agendamiento de cita
    ├── agendador/consulta-citas # HU-1.1: consulta de citas por médico/fecha
    ├── admin/configuracion-agenda # HU-3.1 + HU-3.2: agenda y ventana de tiempo
    └── shared/no-autorizado
```

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.22.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
