import { defineConfig } from 'drizzle-kit'

// drizzle-kit serve solo a generare le migrazioni dallo schema; le applica src/db/migrate.ts.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  casing: 'snake_case',
})
