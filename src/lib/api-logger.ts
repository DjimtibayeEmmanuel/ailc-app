// Logger centralisé pour les APIs
import { NextRequest } from 'next/server';

export interface LogContext {
    method: string;
    url: string;
    timestamp: string;
    headers: Record<string, string>;
    requestId: string;
}

export function createLogContext(request: NextRequest): LogContext {
    return {
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(request.headers.entries()),
        requestId: Math.random().toString(36).substr(2, 9)
    };
}

export function logRequest(context: LogContext, additionalData?: any) {
    console.log(`📨 [${context.requestId}] ${context.method} ${context.url}`);
    console.log(`⏰ [${context.requestId}] ${context.timestamp}`);
    
    if (additionalData) {
        console.log(`📋 [${context.requestId}] Data:`, JSON.stringify(additionalData, null, 2));
    }
}

export function logResponse(context: LogContext, status: number, success: boolean, data?: any) {
    const emoji = success ? '✅' : '❌';
    console.log(`📤 [${context.requestId}] ${emoji} Response: ${status}`);
    
    if (data) {
        console.log(`📋 [${context.requestId}] Response data:`, JSON.stringify(data, null, 2));
    }
}

export function logError(context: LogContext, error: any, stage: string) {
    console.error(`💥 [${context.requestId}] ERROR at ${stage}:`, error);
    console.error(`📍 [${context.requestId}] Stack:`, error.stack);
    console.error(`🔍 [${context.requestId}] Type:`, typeof error);
    
    if (error.cause) {
        console.error(`🔗 [${context.requestId}] Cause:`, error.cause);
    }
}