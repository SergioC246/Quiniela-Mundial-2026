# 🌍 Quiniela Mundial 2026

Aplicación web para hacer predicciones del Mundial de Fútbol 2026.

## 📦 Instalación

### Backend
```bash
cd backend
npm install
npm run dev
```
El backend corre en `http://localhost:3001`

### Frontend
```bash
npm install
npm run dev
```
El frontend corre en `http://localhost:5173`

## 🎯 Características

✅ **Crear predicciones** - Predice ganador o marcador exacto
✅ **Modo ganador** - Solo predice quién gana
✅ **Modo marcador** - Predice el marcador exacto  
✅ **Leaderboard** - Clasificación automática por puntos
✅ **Admin panel** - Ingresa resultados y calcula puntuaciones
✅ **Sincronización** - Datos persistidos en backend

## 📊 Sistema de Puntuación

| Predicción | Puntos |
|-----------|--------|
| Ganador correcto | 3 |
| Marcador exacto | 5 |
| Tendencia correcta | 2 |
| Incorrecto | 0 |

## 🛠 Endpoints API

### Jugadores
- `POST /players` - Crear jugador
- `GET /players` - Listar jugadores
- `GET /players/:id` - Obtener jugador
- `PUT /players/:id` - Actualizar jugador
- `DELETE /players/:id` - Eliminar jugador

### Predicciones
- `POST /players/:id/predictions` - Guardar predicciones
- `GET /players/:id/predictions` - Obtener predicciones

### Partidos
- `GET /matches` - Listar partidos
- `POST /matches/:id/result` - Guardar resultado
- `GET /matches/:id/result` - Obtener resultado

### Leaderboard
- `GET /leaderboard` - Obtener clasificación

Ver [backend/API.md](backend/API.md) para más detalles.

## 🚀 Uso

1. Inicia ambos servidores (frontend y backend)
2. Abre `http://localhost:5173` en el navegador
3. Ingresa tu nombre y email
4. Haz tus predicciones
5. Presiona "Guardar"
6. Ve el leaderboard en tiempo real
