// Gestionnaire d'erreur global pour l'API de signalement
import { NextResponse } from 'next/server';

export function handleAPIError(error: any): NextResponse {
    console.error('🔥 ERREUR SYSTÈME INTERCEPTÉE:', error);
    
    // Créer une réponse JSON garantie
    const errorResponse = {
        error: 'Erreur système critique',
        details: [
            'Le serveur a rencontré une erreur inattendue',
            'Veuillez réessayer dans quelques instants'
        ],
        timestamp: new Date().toISOString(),
        systemError: true
    };
    
    try {
        return NextResponse.json(errorResponse, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    } catch (responseError) {
        // Fallback ultime
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    }
}