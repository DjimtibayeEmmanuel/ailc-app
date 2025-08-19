-- Mettre à jour le mot de passe administrateur
-- Exécuter ce script après avoir configuré les nouveaux secrets

UPDATE users 
SET password = '$2a$10$' || 'BOpJwmNwdKclo2WZbfJaXq'
WHERE email = 'admin@ailc.td' AND is_admin = 1;

-- Vérifier la mise à jour
SELECT id, email, is_admin, created_at 
FROM users 
WHERE email = 'admin@ailc.td';
