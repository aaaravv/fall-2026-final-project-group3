import { createHash, randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { resolve } from 'node:path';
import type { Request } from 'express';
import type { Database } from './database.types.js';

const backendRoot = resolve(import.meta.dirname, '..');
const projectRoot = resolve(backendRoot, '..');
config({ path: resolve(projectRoot, '.env.local') });

const requiredEnvironment = ['GOOGLE_CLIENT_ID', 'POSTGRES_PASSWORD'] as const;
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
    throw new Error(
        `Missing required environment variables in project-root .env.local: ${missingEnvironment.join(', ')}`
    );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port number.');
}

const isProduction = process.env.NODE_ENV === 'production';
const sessionDurationSeconds = 7 * 24 * 60 * 60;
const sessionCookieName = 'stretchmaster_session';
const googleClient = new OAuth2Client(googleClientId);
const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'stretchmaster',
    user: process.env.POSTGRES_USER ?? 'stretchmaster',
    password: process.env.POSTGRES_PASSWORD
});
const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool })
});

const app = express();
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));

function getSessionToken(request: Request): string | null {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    const sessionCookie = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${sessionCookieName}=`));

    return sessionCookie?.slice(sessionCookieName.length + 1) || null;
}

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/auth/google', async (req, res, next) => {
    const body: unknown = req.body;
    if (
        typeof body !== 'object' ||
        body === null ||
        !('credential' in body) ||
        typeof body.credential !== 'string' ||
        body.credential.length === 0
    ) {
        res.status(400).json({ error: 'A Google credential is required.' });
        return;
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: body.credential,
            audience: googleClientId
        });
        payload = ticket.getPayload();
    } catch {
        res.status(401).json({ error: 'Google sign-in could not be verified.' });
        return;
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        res.status(401).json({ error: 'Google account has no verified email address.' });
        return;
    }

    const sessionToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const expiresAt = new Date(Date.now() + sessionDurationSeconds * 1000);
    const firstName = payload.given_name ?? payload.name?.split(/\s+/)[0] ?? null;

    try {
        const user = await db.transaction().execute(async (transaction) => {
            const savedUser = await transaction
                .insertInto('users')
                .values({
                    google_sub: payload.sub,
                    email: payload.email!,
                    first_name: firstName
                })
                .onConflict((conflict) =>
                    conflict.column('google_sub').doUpdateSet({
                        email: payload.email!,
                        first_name: firstName
                    })
                )
                .returning(['id', 'email', 'first_name'])
                .executeTakeFirstOrThrow();

            await transaction
                .insertInto('sessions')
                .values({
                    user_id: savedUser.id,
                    token_hash: tokenHash,
                    expires_at: expiresAt
                })
                .execute();

            return savedUser;
        });

        res.cookie(sessionCookieName, sessionToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: sessionDurationSeconds * 1000
        });
        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name
            }
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/profile', async (req, res, next) => {
    if (req.get('origin') !== frontendOrigin) {
        res.status(403).json({ error: 'Profile updates must come from the configured frontend.' });
        return;
    }

    const body: unknown = req.body;
    if (
        typeof body !== 'object' ||
        body === null ||
        !('firstName' in body) ||
        typeof body.firstName !== 'string' ||
        !('stretchability' in body) ||
        typeof body.stretchability !== 'number' ||
        !Number.isInteger(body.stretchability)
    ) {
        res.status(400).json({ error: 'A name and integer stretchability from 1 to 5 are required.' });
        return;
    }

    const firstName = body.firstName.trim();
    if (firstName.length === 0 || firstName.length > 100) {
        res.status(400).json({ error: 'Name must be between 1 and 100 characters.' });
        return;
    }
    if (body.stretchability < 1 || body.stretchability > 5) {
        res.status(400).json({ error: 'Stretchability must be between 1 and 5.' });
        return;
    }

    const sessionToken = getSessionToken(req);
    if (!sessionToken) {
        res.status(401).json({ error: 'Sign in with Google before saving your profile.' });
        return;
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    try {
        const session = await db
            .selectFrom('sessions')
            .innerJoin('users', 'users.id', 'sessions.user_id')
            .select(['users.id as userId', 'users.email'])
            .where('sessions.token_hash', '=', tokenHash)
            .where('sessions.expires_at', '>', new Date())
            .executeTakeFirst();

        if (!session) {
            res.clearCookie(sessionCookieName, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                path: '/'
            });
            res.status(401).json({ error: 'Your sign-in session expired. Please sign in again.' });
            return;
        }

        const user = await db
            .updateTable('users')
            .set({
                first_name: firstName,
                stretchability: body.stretchability
            })
            .where('id', '=', session.userId)
            .returning(['id', 'email', 'first_name', 'stretchability'])
            .executeTakeFirstOrThrow();

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                stretchability: user.stretchability
            }
        });
    } catch (error) {
        next(error);
    }
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({ error: 'Request body must be valid JSON.' });
        return;
    }

    if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
        res.status(413).json({ error: 'Request body is too large.' });
        return;
    }

    console.error('API request failed:', error);
    res.status(500).json({ error: 'The server could not complete the request.' });
};
app.use(errorHandler);

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`StretchMaster API listening on port ${port}`);
});

async function shutdown(): Promise<void> {
    server.close();
    await db.destroy();
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
