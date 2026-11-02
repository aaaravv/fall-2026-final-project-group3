import { sql, type Kysely } from 'kysely';
import type { Database } from '../src/database.types.js';

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable('users')
        .addColumn('id', 'bigint', (column) =>
            column.generatedAlwaysAsIdentity().primaryKey()
        )
        .addColumn('google_sub', 'text', (column) => column.notNull())
        .addUniqueConstraint('users_google_sub_unique', ['google_sub'])
        .addColumn('email', 'text', (column) => column.notNull())
        .addColumn('first_name', 'text')
        .addColumn('stretchability', 'smallint')
        .addCheckConstraint(
            'users_stretchability_range',
            sql`stretchability BETWEEN 1 AND 5`
        )
        .addColumn('created_at', 'timestamptz', (column) =>
            column.notNull().defaultTo(sql`now()`)
        )
        .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable('users').ifExists().execute();
}
