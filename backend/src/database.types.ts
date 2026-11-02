import type { Generated } from 'kysely';

export interface Database {
    users: {
        id: Generated<string>;
        google_sub: string;
        email: string;
        first_name: string | null;
        stretchability: number | null;
        created_at: Generated<Date>;
    };
    sessions: {
        id: Generated<string>;
        user_id: string;
        token_hash: string;
        expires_at: Date;
        created_at: Generated<Date>;
    };
}
