# Sistema de Gerenciamento de Alunos e Avaliações

## Role
Act as a senior TypeScript full-stack developer. Prioritize clean, modular, tested code.

## Stack
- Frontend: React 18 + TypeScript (Vite) in `sistema/frontend/`
- Backend: Node.js + Express + TypeScript in `sistema/backend/`
- Tests: Cucumber.js + Gherkin in `sistema/tests/`
- Persistence: JSON files in `sistema/backend/data/` — no database

## Assessment Grades
Use exactly these three values for grades:
- "MANA" = Meta Ainda Não Atingida
- "MPA"  = Meta Parcialmente Atingida
- "MA"   = Meta Atingida

## Code Standards
- Enable TypeScript strict mode on all packages
- Use async/await for all asynchronous operations
- Place route handlers in `src/routes/`, business logic in `src/services/`
- Write functional React components
- Define shared types in a `types.ts` file per module
- Write functions that do one thing, maximum 30 lines each
- Define file paths as named constants
- Validate all route inputs before processing
- Return explicit error messages with appropriate HTTP status codes

## Development Cycle
Follow this sequence for every feature:
1. Write the Gherkin scenario in `sistema/tests/features/`
2. Implement the backend route and service
3. Verify supertest tests pass before writing frontend code
4. Implement the frontend page and components
5. Write Selenium step definitions that verify UI behavior
6. Verify all tests pass before starting the next feature

## Testing
- Run tests after every backend change
- Use supertest for backend API tests (port 3001)
- Use Selenium WebDriver for frontend UI tests (port 5173)
- Use `selenium/standalone-chrome` as the Selenium container

## Docker
- Run the full system with `docker compose up` from the repo root
- Define three services: frontend (5173), backend (3001), selenium
- Mount `sistema/backend/data/` as a volume for JSON persistence
- Read the backend URL from env variable `VITE_API_URL`
  - Local: http://localhost:3001
  - Docker: http://backend:3001