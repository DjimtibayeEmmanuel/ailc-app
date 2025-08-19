import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { generateReportId, generateTrackingCode } from '@/lib/utils';
import { ReportSchema, validateInput, prepareSqlParams } from '@/lib/input-validation';

export async function POST(request: NextRequest) {
    // Wrapper global pour capturer TOUTES les erreurs
    try {
        console.log('📥 Nouveau signalement anonyme reçu (Next.js)');
        console.log('🌐 Headers:', Object.fromEntries(request.headers.entries()));
        
        // Parsing JSON avec protection
        let body;
        try {
            body = await request.json();
            console.log('📋 Données reçues:', JSON.stringify(body, null, 2));
        } catch (parseError: any) {
            console.error('❌ Erreur parsing JSON request:', parseError);
            return NextResponse.json({ 
                error: 'Données JSON invalides',
                details: ['Le format des données envoyées est incorrect']
            }, { status: 400 });
        }
        
        // Debug des données avant validation
        console.log('🔍 Analyse des données reçues:');
        Object.keys(body).forEach(key => {
            const value = body[key];
            console.log(`  ${key}: ${typeof value} = ${value === undefined ? 'UNDEFINED' : value === null ? 'NULL' : JSON.stringify(value).substring(0, 100)}`);
        });
        
        // Validation complète avec Zod
        console.log('🔍 Début validation Zod...');
        const validationResult = validateInput(ReportSchema, body);
        
        if (!validationResult.success) {
            console.log('❌ Validation Zod échouée - détails complets:');
            console.log('📋 Erreurs:', validationResult.errors);
            console.log('📋 Données qui ont échoué:', JSON.stringify(body, null, 2));
            
            return NextResponse.json({ 
                error: 'Données invalides',
                details: validationResult.errors
            }, { status: 400 });
        }
        
        console.log('✅ Validation Zod réussie');

        const validatedData = validationResult.data;
        const {
            corruptionType, sector, sectorName, severity, incidentDate, location, description,
            amountRange, suspectNames, suspectPositions, suspectInstitution, witnesses,
            relationToFacts, anonymity, reporterName, reporterPhone, reporterEmail,
            urgency, circumstances, frequency, impact, witnessContacts, files
        } = validatedData;
        
        // Mapper les montants vers des valeurs numériques pour la base de données
        let amount = null;
        if (amountRange) {
            const amountMapping: Record<string, number> = {
                'moins_100000': 50000,
                '100000_1000000': 500000,
                '1000000_10000000': 5000000,
                '10000000_100000000': 50000000,
                'plus_100000000': 200000000
            };
            amount = amountMapping[amountRange] || null;
        }
        
        // Mapper la gravité pour la base de données
        const severityMapping: Record<string, string> = {
            'faible': 'low',
            'moyen': 'medium', 
            'eleve': 'high',
            'critique': 'critical'
        };
        const mappedSeverity = severityMapping[severity] || severity;
        
        // Mapper l'anonymat pour la base de données
        const anonymityMapping: Record<string, string> = {
            'total': 'anonymous',
            'partiel': 'confidential',
            'aucun': 'public'
        };
        const mappedAnonymity = anonymityMapping[anonymity] || anonymity;
        
        console.log('✅ Validation sécurisée réussie pour nouveau signalement anonyme');

        // Générer IDs uniques (avec gestion d'erreur)
        let reportId, trackingCode;
        try {
            reportId = generateReportId();
            trackingCode = generateTrackingCode();
            console.log('🆔 IDs générés:', { reportId, trackingCode });
        } catch (idError: any) {
            console.error('❌ Erreur génération IDs:', idError.message);
            return NextResponse.json({ 
                error: 'Erreur de génération des identifiants',
                details: ['Impossible de générer les identifiants uniques']
            }, { status: 500 });
        }

        // Chiffrer les données personnelles si fournies (avec gestion d'erreur)
        let encryptedName = null;
        let encryptedPhone = null; 
        let encryptedEmail = null;
        
        try {
            encryptedName = reporterName ? encrypt(reporterName) : null;
            encryptedPhone = reporterPhone ? encrypt(reporterPhone) : null;
            encryptedEmail = reporterEmail ? encrypt(reporterEmail) : null;
            console.log('🔐 Chiffrement des données personnelles réussi');
        } catch (encryptionError: any) {
            console.error('❌ Erreur de chiffrement:', encryptionError.message);
            return NextResponse.json({ 
                error: 'Erreur de configuration de sécurité',
                details: ['Le système de chiffrement n\'est pas correctement configuré']
            }, { status: 503 });
        }

        // Informations de traçabilité (non personnelles)
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Traiter les fichiers
        const filesJson = files && Array.isArray(files) ? JSON.stringify(files) : JSON.stringify([]);

        console.log('💾 Insertion en base de données...');
        console.log('📊 Données mappées:', { 
            corruptionType, 
            sector, 
            severity: mappedSeverity, 
            anonymity: mappedAnonymity,
            amount 
        });

        console.log('💾 Insertion en base de données avec Prisma...');
        
        try {
            // Insérer le signalement avec Prisma
            const report = await prisma.report.create({
                data: {
                    id: reportId,
                    userId: null,
                    corruptionType,
                    sector,
                    severity: mappedSeverity,
                    incidentDate: new Date(incidentDate),
                    location,
                    description,
                    amount,
                    suspectNames: suspectNames || null,
                    suspectPositions: suspectPositions || null,
                    suspectInstitution: suspectInstitution || null,
                    witnesses: witnesses || null,
                    relationToFacts,
                    anonymityLevel: mappedAnonymity,
                    reporterNameEncrypted: encryptedName,
                    reporterPhoneEncrypted: encryptedPhone,
                    reporterEmailEncrypted: encryptedEmail,
                    trackingCode,
                    files: filesJson,
                    ipAddress,
                    userAgent
                }
            });

            console.log(`✅ Signalement anonyme Next.js créé: ${reportId} (Suivi: ${trackingCode})`);
            if (files && files.length > 0) {
                console.log(`📎 ${files.length} fichier(s) joint(s)`);
            }

            return NextResponse.json({
                message: 'Signalement soumis avec succès',
                reportId: reportId,
                trackingCode: trackingCode,
                status: 'new',
                filesCount: files ? files.length : 0,
                info: 'Conservez votre code de suivi pour suivre l\'évolution de votre signalement',
                currency: 'FCFA'
            });
        } catch (dbError: any) {
            console.error('❌ Erreur insertion signalement:', dbError);
            return NextResponse.json({ 
                error: 'Erreur lors de l\'enregistrement du signalement',
                details: ['Impossible d\'enregistrer le signalement en base de données']
            }, { status: 500 });
        }
    } catch (error: any) {
        // GESTION ULTIME DE TOUTES LES ERREURS POSSIBLES
        console.error('❌ ERREUR CRITIQUE INTERCEPTÉE:', error);
        console.error('📍 Stack trace complet:', error.stack);
        console.error('📋 Type d\'erreur:', typeof error);
        console.error('📋 Propriétés:', Object.getOwnPropertyNames(error));
        
        // Forcer la création d'une réponse JSON valide quoi qu'il arrive
        try {
            let errorMessage = 'Erreur serveur inconnue';
            let errorDetails = ['Une erreur inattendue s\'est produite'];
            let statusCode = 500;
            
            if (error instanceof Error) {
                errorMessage = error.message;
                
                // Classification des erreurs
                if (error.message.includes('SÉCURITÉ') || error.message.includes('ENCRYPTION_KEY')) {
                    errorMessage = 'Configuration de sécurité requise';
                    errorDetails = ['L\'application nécessite une configuration sécurisée'];
                    statusCode = 503;
                } else if (error.message.includes('Cannot read properties') || error.message.includes('undefined')) {
                    errorMessage = 'Erreur de traitement des données';
                    errorDetails = [`Propriété manquante: ${error.message}`];
                    statusCode = 400;
                } else if (error.message.includes('database') || error.message.includes('SQLITE')) {
                    errorMessage = 'Erreur de base de données';
                    errorDetails = ['Problème de connexion ou d\'accès à la base de données'];
                    statusCode = 500;
                } else if (error.message.includes('validation') || error.message.includes('schema')) {
                    errorMessage = 'Erreur de validation des données';
                    errorDetails = [error.message];
                    statusCode = 400;
                }
            }
            
            // GARANTIR une réponse JSON valide
            const response = NextResponse.json({ 
                error: errorMessage,
                details: errorDetails,
                timestamp: new Date().toISOString(),
                requestId: Math.random().toString(36).substr(2, 9)
            }, { status: statusCode });
            
            // Forcer le Content-Type JSON
            response.headers.set('Content-Type', 'application/json; charset=utf-8');
            
            return response;
            
        } catch (responseError: any) {
            // FALLBACK ULTIME - Si même la création de réponse JSON échoue
            console.error('❌ ERREUR CRITIQUE: Impossible de créer une réponse JSON:', responseError);
            
            // Réponse texte brute comme dernier recours
            return new Response(JSON.stringify({
                error: 'Erreur serveur critique',
                details: ['Le serveur ne peut pas traiter la requête'],
                fallback: true
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
        }
    }
}