# Database Management

## Current Workflow: Push-Based (Recommended for Development)

This project uses **Drizzle's push workflow** for database schema management.

### Commands

- **`bun run db:push`** - Sync schema changes to database (recommended)
- **`bun run db:seed`** - Seed the database with initial data
- **`bun run db:generate`** - Generate migration files (for production only)

### How to Make Schema Changes

1. Edit the schema in `drizzle/schema.ts`
2. Run `bun run db:push` to sync changes to database
3. The command will show you what changes will be made
4. Confirm to apply the changes

### Push vs Migrations

**Current Setup: Push-Based ✅**
- Best for development
- Automatically syncs schema changes
- No migration file management needed
- Direct schema synchronization

**Migration-Based (Not currently used)**
- Better for production deployments
- Requires generating and managing migration files
- More complex but gives more control

### Migration Files

The `migrations/` directory contains historical migration files but they are **not actively used**.
The database schema is managed via `db:push` instead.

### Important Notes

⚠️ **Do not use `bun run db:migrate`** - This will fail because we're using push-based workflow.

✅ **Always use `bun run db:push`** for schema changes.

### Troubleshooting

If you see errors about types or tables already existing:
1. Check your schema in `drizzle/schema.ts` matches your needs
2. Run `bun run db:push` to sync
3. If there are conflicts, `db:push` will show you a diff

### Switching to Migration-Based (Advanced)

If you need to switch to migration-based workflow for production:
1. Ensure schema is in sync: `bun run db:push`
2. Delete old migrations: `rm -rf drizzle/migrations/*`
3. Generate fresh migrations: `bun run db:generate`
4. Review generated SQL files
5. Update your deployment process to use `bun run db:migrate`
