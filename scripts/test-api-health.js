#!/usr/bin/env node

// Test de santé de l'API pour diagnostiquer les erreurs JSON

async function testAPIHealth() {
    console.log('🏥 Test de santé de l\'API');
    
    try {
        // Test 1: Health endpoint
        console.log('\n1. Test endpoint de santé...');
        const healthResponse = await fetch('http://localhost:3000/api/health');
        const healthText = await healthResponse.text();
        
        console.log('Status:', healthResponse.status);
        console.log('Content-Type:', healthResponse.headers.get('content-type'));
        console.log('Response:', healthText.substring(0, 200));
        
        // Test 2: Minimal report data
        console.log('\n2. Test avec données minimales...');
        const minimalData = {
            corruptionType: 'autre',
            sector: 'autre', 
            severity: 'faible',
            incidentDate: '2024-12-01',
            location: 'Test Location',
            description: 'Test description for debugging purposes',
            relationToFacts: 'Test relation',
            anonymity: 'total'
        };
        
        const reportResponse = await fetch('http://localhost:3000/api/reports/anonymous', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(minimalData)
        });
        
        console.log('Status:', reportResponse.status);
        console.log('Content-Type:', reportResponse.headers.get('content-type'));
        
        // Lire la réponse comme texte d'abord
        const reportText = await reportResponse.text();
        console.log('Response text:', reportText.substring(0, 500));
        
        // Essayer de parser en JSON si possible
        if (reportResponse.headers.get('content-type')?.includes('application/json')) {
            try {
                const reportData = JSON.parse(reportText);
                console.log('JSON parsed successfully:', reportData);
            } catch (jsonError) {
                console.log('JSON parse failed:', jsonError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
    }
}

if (require.main === module) {
    testAPIHealth();
}

module.exports = { testAPIHealth };