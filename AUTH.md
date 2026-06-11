# 🔐 Autenticación JWT - Guía

## Cómo funciona

La aplicación usa **JWT (JSON Web Tokens)** para autenticación:

1. **Registro**: Usuario crea cuenta con nombre, email y contraseña
2. **Login**: Usuario inicia sesión con email y contraseña
3. **Token**: El backend retorna un token JWT válido por 24 horas
4. **Almacenamiento**: El token se guarda en localStorage
5. **Requests**: Cada request al API incluye el token en el header `Authorization: Bearer <token>`

## Endpoints de Auth

### POST /auth/register
Crear una nueva cuenta
```json
{
  "name": "Juan",
  "email": "juan@example.com",
  "password": "123456"
}
```
Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "juan@example.com",
    "name": "Juan",
    "email": "juan@example.com"
  }
}
```

### POST /auth/login
Iniciar sesión
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```
Response: (igual que register)

### GET /auth/verify
Verificar si un token es válido
Header: `Authorization: Bearer <token>`

## Endpoints Protegidos

Todos los endpoints excepto `/auth/*` requieren autenticación:
- Incluir header: `Authorization: Bearer <token>`
- Si no hay token o es inválido → 401 Unauthorized

## Frontend

### useAuth Hook
Hook de React para manejar autenticación:
```javascript
const { token, user, login, register, logout, isAuthenticated } = useAuth();

// Login
await login(email, password, apiService);

// Register
await register(name, email, password, apiService);

// Logout
logout();
```

El hook automáticamente:
- Guarda el token en localStorage
- Mantiene la sesión después de recargar
- Proporciona métodos para login/register/logout

### Flujo
1. Si no está autenticado → Mostrar AuthForm (login/register)
2. Si está autenticado → Mostrar app completa con predicciones
3. El token se incluye automáticamente en cada request API

## Seguridad

⚠️ **Importante**: Cambiar `JWT_SECRET` en producción
- Archivo: `backend/src/controllers/authController.js`
- Usar: `process.env.JWT_SECRET`

## Próximos pasos

- Agregar refresh tokens (extender expiración sin volver a login)
- Agregar 2FA (autenticación de dos factores)
- Integrar OAuth (Google, GitHub)
- Agregar roles (admin, user)
