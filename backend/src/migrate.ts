import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import { Kysely, Migrator, PostgresDialect, type Migration, type MigrationProvider } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './database.types.js';

const backendRoot = resolve(import.meta.dirname, '..');
const projectRoot = resolve(backendRoot, '..');
config({ path: resolve(projectRoot, '.env.local') });

const password = process.env.POSTGRES_PASSWORD;
if (!password) {
    throw new Error('POSTGRES_PASSWORD is missing. Set it in the project root .env.local file.');
}

const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'stretchmaster',
    user: process.env.POSTGRES_USER ?? 'stretchmaster',
    password
});

const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool })
});

class TypeScriptMigrationProvider implements MigrationProvider {
    async getMigrations(): Promise<Record<string, Migration>> {
        const migrationsDirectory = resolve(backendRoot, 'migrations');
        const files = await readdir(migrationsDirectory, { withFileTypes: true });
        const migrationFiles = files
            .filter((file) => file.isFile() && /^\d+_.+\.ts$/.test(file.name))
            .map((file) => file.name)
            .sort();

        const migrations: Record<string, Migration> = {};
        for (const file of migrationFiles) {
            const name = file.slice(0, -'.ts'.length);
            const migrationUrl = pathToFileURL(resolve(migrationsDirectory, file)).href;
            migrations[name] = await import(migrationUrl) as Migration;
        }

        return migrations;
    }
}

async function main(): Promise<void> {
    const direction = process.argv[2] ?? 'up';
    const migrator = new Migrator({
        db,
        provider: new TypeScriptMigrationProvider()
    });

    let migrationResult;
    if (direction === 'up') {
        migrationResult = await migrator.migrateToLatest();
    } else if (direction === 'down') {
        migrationResult = await migrator.migrateDown();
    } else {
        throw new Error(`Unknown migration direction "${direction}". Use "up" or "down".`);
    }

    for (const result of migrationResult.results ?? []) {
        console.log(`${result.direction} ${result.migrationName}: ${result.status}`);
    }

    if (migrationResult.error) {
        throw migrationResult.error;
    }
}

try {
    await main();
} catch (error) {
    console.error('Database migration failed:', error);
    process.exitCode = 1;
} finally {
    await db.destroy();
}
