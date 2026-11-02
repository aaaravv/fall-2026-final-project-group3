import { sql, type Kysely } from 'kysely';
import type { Database } from '../src/database.types.js';

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable('sessions')
        .addColumn('id', 'bigint', (column) =>
            column.generatedAlwaysAsIdentity().primaryKey()
        )
        .addColumn('user_id', 'bigint', (column) =>
            column.notNull().references('users.id').onDelete('cascade')
        )
        .addColumn('token_hash', 'text', (column) => column.notNull().unique())
        .addColumn('expires_at', 'timestamptz', (column) => column.notNull())
        .addColumn('created_at', 'timestamptz', (column) =>
            column.notNull().defaultTo(sql`now()`)
        )
        .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable('sessions').ifExists().execute();
}
