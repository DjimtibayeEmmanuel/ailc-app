#!/usr/bin/env node

// Script de test pour reproduire différents scénarios d'erreur

const testScenarios = [
    {
        name: 'Données valides normales',
        data: {
            corruptionType: 'detournement',
            sector: 'administration',
            severity: 'eleve',
            incidentDate: '2024-12-01',
            location: 'N\'Djamena',
            description: 'Test normal avec données valides',
            relationToFacts: 'Témoin direct',
            anonymity: 'total'
        },
        shouldWork: true
    },
    {
        name: 'Données avec champs manquants',
        data: {
            corruptionType: '',
            sector: '',
            description: 'Test avec champs manquants'
        },
        shouldWork: false
    },
    {
        name: 'Données avec types incorrects',
        data: {
            corruptionType: 123,
            sector: null,
            severity: undefined,
            incidentDate: 'date-invalide',
            location: '',
            description: 'Test avec types incorrects',
            relationToFacts: '',
            anonymity: 'invalide'
        },
        shouldWork: false
    },
    {
        name: 'Données avec caractères spéciaux',
        data: {
            corruptionType: 'detournement',
            sector: 'administration',
            severity: 'eleve',
            incidentDate: '2024-12-01',
            location: 'N\'Djamena avec "quotes" et <html>',
            description: 'Test avec caractères spéciaux: éàèç & <script>alert("test")</script>',
            relationToFacts: 'Témoin avec caractères spéciaux: àéèç',
            anonymity: 'total'
        },
        shouldWork: true
    },
    {
        name: 'Données très longues',
        data: {
            corruptionType: 'detournement',
            sector: 'administration', 
            severity: 'eleve',
            incidentDate: '2024-12-01',
            location: 'A'.repeat(500),
            description: 'B'.repeat(10000),
            relationToFacts: 'C'.repeat(1000),
            anonymity: 'total'
        },
        shouldWork: false
    },
    {
        name: 'JSON malformé (simulé)',
        data: '{"invalid": json}',
        shouldWork: false,
        rawJSON: true
    },
    {
        name: 'Données avec fichiers undefined',
        data: {
            corruptionType: 'autre',
            sector: 'autre',
            severity: 'faible',
            incidentDate: '2024-12-01',
            location: 'Test',
            description: 'Test avec fichiers undefined',
            relationToFacts: 'Test',
            anonymity: 'total',
            files: undefined
        },
        shouldWork: true
    },
    {
        name: 'Données avec fichiers invalides',
        data: {
            corruptionType: 'autre',
            sector: 'autre',
            severity: 'faible',
            incidentDate: '2024-12-01',
            location: 'Test',
            description: 'Test avec fichiers invalides',
            relationToFacts: 'Test',
            anonymity: 'total',
            files: [
                { name: '', size: -1, type: null }
            ]
        },
        shouldWork: false
    }
];

async function testScenario(scenario, index) {
    console.log(`\n🧪 Test ${index + 1}/${testScenarios.length}: ${scenario.name}`);
    console.log(`📋 Devrait ${scenario.shouldWork ? 'réussir' : 'échouer'}`);
    
    try {
        const response = await fetch('http://localhost:3000/api/reports/anonymous', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: scenario.rawJSON ? scenario.data : JSON.stringify(scenario.data)
        });
        
        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
        
        // Toujours lire comme texte d'abord pour diagnostiquer
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ JSON valide reçu');
            
            if (response.ok) {
                console.log(`🎉 Succès: ${data.trackingCode || 'N/A'}`);
            } else {
                console.log(`❌ Erreur métier: ${data.error}`);
                if (data.details) {
                    data.details.forEach(detail => console.log(`   - ${detail}`));
                }
            }
            
            // Vérifier si le résultat correspond aux attentes
            const actualSuccess = response.ok;
            if (actualSuccess === scenario.shouldWork) {
                console.log('✅ Résultat conforme aux attentes');
            } else {
                console.log('⚠️ Résultat différent des attentes');
            }
            
        } catch (parseError) {
            console.log('❌ JSON INVALIDE REÇU:');
            console.log(responseText.substring(0, 200));
            console.log('❌ Erreur de parsing:', parseError.message);
        }
        
    } catch (networkError) {
        console.log('❌ Erreur réseau:', networkError.message);
    }
    
    // Petit délai entre les tests
    await new Promise(resolve => setTimeout(resolve, 100));
}

async function runAllTests() {
    console.log('🚀 Tests de scénarios d\'erreur - AILC Tchad');
    console.log('💡 Démarrez le serveur avec: npm run dev\n');
    
    for (let i = 0; i < testScenarios.length; i++) {
        await testScenario(testScenarios[i], i);
    }
    
    console.log('\n📊 Tests terminés');
    console.log('💡 Vérifiez les logs du serveur (console npm run dev) pour plus de détails');
}

if (require.main === module) {
    runAllTests();
}

module.exports = { testScenarios, testScenario, runAllTests };