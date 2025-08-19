// Fonction pour générer un code de suivi unique
export function generateTrackingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Fonction pour générer un ID de rapport unique
export function generateReportId(): string {
    return `TCHREP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

// Fonction pour valider un email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Types pour TypeScript
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
    created_at: string;
}

export interface Report {
    id: string;
    user_id?: number;
    corruption_type: string;
    sector: string;
    severity: string;
    incident_date: string;
    location: string;
    description: string;
    amount?: number;
    suspect_names?: string;
    suspect_positions?: string;
    suspect_institution?: string;
    witnesses?: string;
    relation_to_facts: string;
    anonymity_level: string;
    tracking_code: string;
    status: string;
    files?: string;
    created_at: string;
    updated_at: string;
}

export interface TempCode {
    id: number;
    email: string;
    code: string;
    expires_at: string;
    used: boolean;
    created_at: string;
}