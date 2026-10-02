import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { db } from './index.ts'

// Applica le migrazioni in drizzle/ (generate con bun run db:generate).
await migrate(db, { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname })
console.log('Migrazioni applicate')
process.exit(0)
