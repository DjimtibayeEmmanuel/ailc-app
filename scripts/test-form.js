#!/usr/bin/env node

// Script de test pour vérifier le formulaire de signalement

const testData = {
    // Champs obligatoires
    corruptionType: 'detournement',
    sector: 'administration',
    severity: 'eleve',
    incidentDate: '2024-12-01',
    location: 'N\'Djamena, Ministère des Finances',
    description: 'Test de signalement pour vérifier le bon fonctionnement du formulaire et de l\'API backend.',
    relationToFacts: 'Témoin direct des faits',
    anonymity: 'total',
    
    // Champs optionnels
    amountRange: '1000000_10000000',
    urgency: 'eleve',
    circumstances: 'Circonstances détaillées du test',
    frequency: 'unique',
    impact: 'Impact modéré sur les finances publiques',
    suspectNames: 'Suspect Test',
    suspectPositions: 'Directeur',
    suspectInstitution: 'Ministère Test',
    witnesses: 'Témoin 1, Témoin 2',
    witnessContacts: 'contact@test.td',
    
    // Informations du signaleur (vides pour anonymat total)
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    
    // Fichiers (simulation)
    files: [
        {
            name: 'preuve.pdf',
            size: 1024000,
            type: 'application/pdf'
        }
    ]
};

async function testReportSubmission() {
    console.log('🧪 Test de soumission de signalement');
    console.log('📋 Données de test:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:3000/api/reports/anonymous', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Test réussi!');
            console.log('📊 Résultat:', data);
            console.log(`🆔 Rapport ID: ${data.reportId}`);
            console.log(`🔍 Code de suivi: ${data.trackingCode}`);
        } else {
            console.log('❌ Test échoué');
            console.log('📋 Erreur:', data);
            
            if (data.details) {
                console.log('📝 Détails:', data.details.join('\n'));
            }
        }
        
    } catch (error) {
        console.log('❌ Erreur de connexion');
        console.log('📋 Détails:', error.message);
        console.log('💡 Assurez-vous que le serveur Next.js est en cours d\'exécution (npm run dev)');
    }
}

if (require.main === module) {
    testReportSubmission();
}

module.exports = { testData, testReportSubmission };