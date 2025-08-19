#!/usr/bin/env node

// Script pour simuler exactement les données envoyées par le formulaire UI

const testUIData = {
    // Simule exactement ce que le formulaire UI envoie
    corruptionType: 'detournement',
    sector: 'administration', 
    severity: 'eleve',
    incidentDate: '2024-12-01',
    location: 'N\'Djamena',
    description: 'Description détaillée du signalement test pour vérifier le bon fonctionnement.',
    relationToFacts: 'Témoin direct',
    anonymity: 'total',
    
    // Champs du formulaire qui peuvent être vides ou undefined
    amountRange: 'moins_100000',
    urgency: 'moyen',
    circumstances: '',
    frequency: '',
    impact: '',
    suspectNames: '',
    suspectPositions: '',
    suspectInstitution: '',
    witnesses: '',
    witnessContacts: '',
    
    // Informations signaleur (vides pour anonymat total)
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    
    // Fichiers - C'est ici qu'on teste le problème potentiel
    files: [] // Tableau vide plutôt qu'undefined
};

// Test avec fichiers undefined pour reproduire l'erreur
const testUIDataWithUndefinedFiles = {
    ...testUIData,
    files: undefined // Ceci pourrait causer l'erreur
};

async function testFormSubmission(testData, testName) {
    console.log(`\n🧪 ${testName}`);
    console.log('📋 Données:', JSON.stringify(testData, null, 2));
    
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
            console.log(`🆔 ID: ${data.reportId}`);
            console.log(`🔍 Code: ${data.trackingCode}`);
        } else {
            console.log('❌ Test échoué');
            console.log('📋 Erreur:', data.error);
            
            if (data.details) {
                console.log('📝 Détails:');
                data.details.forEach(detail => console.log(`  - ${detail}`));
            }
        }
        
    } catch (error) {
        console.log('❌ Erreur de connexion');
        console.log('📋 Détails:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Tests du formulaire de signalement');
    console.log('💡 Démarrez le serveur avec: npm run dev');
    
    // Test 1: Données normales
    await testFormSubmission(testUIData, 'Test avec données normales');
    
    // Test 2: Fichiers undefined (reproduire l'erreur)
    await testFormSubmission(testUIDataWithUndefinedFiles, 'Test avec fichiers undefined');
    
    // Test 3: Données minimales (seulement champs obligatoires)
    const minimalData = {
        corruptionType: 'autre',
        sector: 'autre',
        severity: 'faible',
        incidentDate: '2024-12-01',
        location: 'Test',
        description: 'Description minimale test',
        relationToFacts: 'Test',
        anonymity: 'total'
    };
    
    await testFormSubmission(minimalData, 'Test avec données minimales');
}

if (require.main === module) {
    runTests();
}

module.exports = { testUIData, testUIDataWithUndefinedFiles, testFormSubmission };