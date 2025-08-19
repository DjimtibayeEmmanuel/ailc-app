const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration de la base de données
const dbPath = path.join(__dirname, '..', 'ailc_tchad_database.db');

console.log('🔄 Migration: Ajout de la colonne sector_name...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur lors de l\'ouverture de la base de données:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connexion à la base de données SQLite établie pour migration.');
    }
});

// Vérifier si la colonne existe déjà
db.all("PRAGMA table_info(reports)", (err, columns) => {
    if (err) {
        console.error('❌ Erreur lors de la vérification de la structure:', err.message);
        db.close();
        process.exit(1);
    }
    
    const columnExists = columns.some(col => col.name === 'sector_name');
    
    if (columnExists) {
        console.log('✅ La colonne sector_name existe déjà');
        db.close();
        process.exit(0);
    }
    
    // Ajouter la colonne sector_name
    db.run("ALTER TABLE reports ADD COLUMN sector_name TEXT DEFAULT ''", (err) => {
        if (err) {
            console.error('❌ Erreur lors de l\'ajout de la colonne:', err.message);
            db.close();
            process.exit(1);
        }
        
        console.log('✅ Colonne sector_name ajoutée avec succès');
        
        // Mettre à jour les enregistrements existants avec une valeur par défaut
        db.run("UPDATE reports SET sector_name = 'À définir' WHERE sector_name = '' OR sector_name IS NULL", (err) => {
            if (err) {
                console.error('❌ Erreur lors de la mise à jour des données existantes:', err.message);
            } else {
                console.log('✅ Données existantes mises à jour');
            }
            
            db.close((err) => {
                if (err) {
                    console.error('❌ Erreur fermeture DB:', err.message);
                } else {
                    console.log('✅ Migration terminée avec succès');
                }
            });
        });
    });
});