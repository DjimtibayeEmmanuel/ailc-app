const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuration de la base de données
const dbPath = path.join(__dirname, '..', 'ailc_tchad_database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    } else {
        console.log('✅ Connexion à la base de données SQLite établie (Script d\'initialisation).');
    }
});

// Initialiser les tables et créer l'admin par défaut
async function initializeDatabase() {
    db.serialize(async () => {
        // Table des utilisateurs
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            two_factor_secret TEXT,
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Table des signalements
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            user_id INTEGER NULL,
            corruption_type TEXT NOT NULL,
            sector TEXT NOT NULL,
            sector_name TEXT NOT NULL,
            severity TEXT NOT NULL,
            incident_date DATE NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            amount DECIMAL(15,2),
            suspect_names TEXT,
            suspect_positions TEXT,
            suspect_institution TEXT,
            witnesses TEXT,
            relation_to_facts TEXT,
            anonymity_level TEXT NOT NULL,
            reporter_name_encrypted TEXT,
            reporter_phone_encrypted TEXT,
            reporter_email_encrypted TEXT,
            tracking_code TEXT UNIQUE,
            status TEXT DEFAULT 'new',
            files TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Table des fichiers uploadés
        db.run(`CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id TEXT,
            original_name TEXT NOT NULL,
            filename TEXT NOT NULL,
            mimetype TEXT NOT NULL,
            size INTEGER NOT NULL,
            path TEXT NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports (id)
        )`);

        // Table des codes 2FA temporaires
        db.run(`CREATE TABLE IF NOT EXISTS temp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, function(err) {
            if (err) {
                console.error('Erreur création tables:', err);
            } else {
                console.log('✅ Tables créées avec succès');
                createDefaultAdmin();
            }
        });
    });
}

// Créer un admin par défaut
async function createDefaultAdmin() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    db.run(`INSERT OR IGNORE INTO users (name, email, password, is_admin) 
            VALUES (?, ?, ?, ?)`, 
            ['Administrateur AILC Tchad', 'djimtehassane92@gmail.com', adminPassword, 1], 
            function(err) {
                if (err) {
                    console.error('Erreur création admin:', err);
                } else {
                    console.log('✅ Admin par défaut créé ou déjà existant');
                }
                
                db.close((err) => {
                    if (err) {
                        console.error('Erreur fermeture DB:', err.message);
                    } else {
                        console.log('✅ Base de données fermée.');
                    }
                });
            });
}

initializeDatabase();