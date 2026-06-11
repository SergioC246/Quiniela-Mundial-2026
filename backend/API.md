# Backend API - Quiniela Mundial 2026

## Endpoints

### Players

#### POST /players
Crear un nuevo jugador
```json
{
  "name": "Juan",
  "email": "juan@example.com"
}
```

#### GET /players
Listar todos los jugadores

#### GET /players/:id
Obtener detalles de un jugador específico

#### PUT /players/:id
Actualizar información del jugador
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com"
}
```

#### DELETE /players/:id
Eliminar un jugador

### Predictions

#### POST /players/:playerId/predictions
Guardar predicciones de un jugador
```json
{
  "predictions": {
    "1": {
      "mode": "winner",
      "winner": "home"
    },
    "2": {
      "mode": "score",
      "homeScore": 2,
      "awayScore": 1
    }
  }
}
```

#### GET /players/:playerId/predictions
Obtener predicciones de un jugador

### Matches

#### GET /matches
Listar todos los partidos con sus resultados

#### POST /matches/:matchId/result
Guardar resultado de un partido (admin)
```json
{
  "homeScore": 2,
  "awayScore": 1,
  "winner": "home"
}
```

#### GET /matches/:matchId/result
Obtener resultado de un partido específico

### Leaderboard

#### GET /leaderboard
Obtener leaderboard con puntuaciones

## Scoring System

- **Predicción correcta de ganador**: 3 puntos
- **Predicción correcta de marcador**: 5 puntos
- **Predicción correcta de tendencia** (más goles de un equipo): 2 puntos
- **Predicción incorrecta**: 0 puntos

## Modes

- **winner**: Solo se predice quién gana
- **score**: Se predice el marcador exacto

## Testing

```bash
npm run dev
```

El servidor corre en `http://localhost:3001`
