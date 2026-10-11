# PlantNest 🌱 – Plant Care & Reminder System (MERN)

## Run
1. Start MongoDB locally (or use Atlas).
2. Backend: `cd server && cp .env.example .env && npm install && npm run dev`
3. Frontend: `cd client && npm install && npm run dev` → http://localhost:5173

## Features
- JWT auth (register/login)
- Plant CRUD with watering interval
- "Watered" button recalculates next watering date
- Daily 8 AM cron email reminders (console log if SMTP not set)

## API
POST /api/auth/register | /login
GET/POST /api/plants · PUT/DELETE /api/plants/:id · POST /api/plants/:id/water · GET /api/plants/due
