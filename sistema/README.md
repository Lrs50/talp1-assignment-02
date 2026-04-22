# Academic Assessment System

A web app for professors to manage students, classes, and assessment grades (MANA / MPA / MA), with daily email notifications when grades are updated.

## Requirements

- Node.js ≥ 18
- npm

## Run

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## Tests

API tests:

```bash
cd sistema/tests && npm test
```

UI tests (Selenium):

```bash
cd sistema/tests && npm run test:ui
```

Watch the browser live at http://localhost:7900 (password: `secret`)
