export const environment = {
  production: true,
  apiUrl: '/api',
  // Ajusta la URL a donde publiques Keycloak (el realm importado ya admite redirecciones
  // a localhost; en producción agrega tu dominio en "Valid redirect URIs" del cliente).
  keycloak: {
    url: '/auth',
    realm: 'piedrazul',
    clientId: 'piedrazul-frontend',
  },
};
