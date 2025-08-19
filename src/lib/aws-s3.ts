import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration S3 depuis les variables d'environnement
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

// Types pour l'upload
export interface UploadFileParams {
    file: Buffer;
    fileName: string;
    contentType: string;
    reportId?: string;
    isPublic?: boolean;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

// Générer une clé unique pour le fichier
function generateFileKey(fileName: string, reportId?: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (reportId) {
        return `reports/${reportId}/${timestamp}_${randomId}_${cleanFileName}`;
    }
    
    return `uploads/${timestamp}_${randomId}_${cleanFileName}`;
}

// Upload d'un fichier vers S3
export async function uploadFileToS3(params: UploadFileParams): Promise<UploadResult> {
    try {
        console.log(`📤 Upload fichier vers S3: ${params.fileName} (${params.file.length} bytes)`);

        const fileKey = generateFileKey(params.fileName, params.reportId);
        
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: params.file,
            ContentType: params.contentType,
            ServerSideEncryption: 'AES256', // Chiffrement côté serveur
            Metadata: {
                'original-name': params.fileName,
                'upload-timestamp': Date.now().toString(),
                'report-id': params.reportId || 'none',
            },
            // Si le fichier est public (ex: images), sinon privé par défaut
            ACL: params.isPublic ? 'public-read' : 'private',
        });

        await s3Client.send(command);

        // URL publique directe (fonctionne seulement si bucket public)
        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        console.log(`✅ Fichier uploadé avec succès: ${fileKey}`);

        return {
            success: true,
            url: fileUrl,
            key: fileKey,
        };

    } catch (error: any) {
        console.error('❌ Erreur upload S3:', error);
        
        return {
            success: false,
            error: error.message || 'Erreur lors de l\'upload',
        };
    }
}

// Générer une URL signée pour accéder à un fichier privé
export async function generateSignedUrl(fileKey: string, expiresIn: number = 604800): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;

    } catch (error: any) {
        console.error('❌ Erreur génération URL signée:', error);
        throw new Error('Impossible de générer l\'URL d\'accès au fichier');
    }
}

// Supprimer un fichier de S3
export async function deleteFileFromS3(fileKey: string): Promise<boolean> {
    try {
        console.log(`🗑️ Suppression fichier S3: ${fileKey}`);

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
        console.log(`✅ Fichier supprimé: ${fileKey}`);

        return true;

    } catch (error: any) {
        console.error('❌ Erreur suppression S3:', error);
        return false;
    }
}

// Valider les types de fichiers autorisés
export function validateFileType(filename: string, contentType: string): { valid: boolean; error?: string } {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.zip', '.rar'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
    ];

    const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
        return {
            valid: false,
            error: `Type de fichier non autorisé: ${fileExtension}. Types acceptés: ${allowedExtensions.join(', ')}`
        };
    }

    if (!allowedMimeTypes.includes(contentType)) {
        return {
            valid: false,
            error: `Type MIME non autorisé: ${contentType}`
        };
    }

    return { valid: true };
}

// Valider la taille du fichier (10MB max par défaut)
export function validateFileSize(fileSize: number, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (fileSize > maxSizeBytes) {
        return {
            valid: false,
            error: `Fichier trop volumineux. Taille maximum: ${maxSizeMB}MB (taille actuelle: ${Math.round(fileSize / 1024 / 1024 * 100) / 100}MB)`
        };
    }

    return { valid: true };
}

// Utilitaire pour convertir File/Blob en Buffer
export async function fileToBuffer(file: File | Blob): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export default {
    uploadFileToS3,
    generateSignedUrl,
    deleteFileFromS3,
    validateFileType,
    validateFileSize,
    fileToBuffer,
};