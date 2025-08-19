import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'OK',
        message: 'AILC Tchad API Next.js fonctionne correctement',
        timestamp: new Date().toISOString(),
        version: '2.1.0-tchad-nextjs',
        currency: 'FCFA',
        features: ['anonymous_reporting', 'encryption', 'tracking', 'file_upload', '2fa_email']
    });
}