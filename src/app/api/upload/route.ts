import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3, validateFileType, validateFileSize, fileToBuffer } from '@/lib/aws-s3';

export async function POST(request: NextRequest) {
    try {
        console.log('📤 Nouveau upload de fichier reçu');

        // Récupérer les données du formulaire
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const reportId = formData.get('reportId') as string;
        const isPublic = formData.get('isPublic') === 'true';

        // Vérifications de base
        if (!file) {
            return NextResponse.json({ 
                error: 'Aucun fichier fourni' 
            }, { status: 400 });
        }

        if (!reportId) {
            return NextResponse.json({ 
                error: 'ID de signalement requis' 
            }, { status: 400 });
        }

        console.log(`📋 Fichier reçu: ${file.name} (${file.size} bytes, ${file.type})`);

        // Vérifier que le signalement existe
        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ 
                error: 'Signalement non trouvé' 
            }, { status: 404 });
        }

        // Validation du type de fichier
        const typeValidation = validateFileType(file.name, file.type);
        if (!typeValidation.valid) {
            return NextResponse.json({ 
                error: typeValidation.error 
            }, { status: 400 });
        }

        // Validation de la taille (10MB max)
        const sizeValidation = validateFileSize(file.size, 10);
        if (!sizeValidation.valid) {
            return NextResponse.json({ 
                error: sizeValidation.error 
            }, { status: 400 });
        }

        // Convertir le fichier en Buffer
        const fileBuffer = await fileToBuffer(file);

        // Upload vers S3
        const uploadResult = await uploadFileToS3({
            file: fileBuffer,
            fileName: file.name,
            contentType: file.type,
            reportId,
            isPublic
        });

        if (!uploadResult.success) {
            return NextResponse.json({ 
                error: uploadResult.error || 'Erreur lors de l\'upload' 
            }, { status: 500 });
        }

        // Enregistrer les métadonnées en base de données
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                reportId,
                originalName: file.name,
                filename: uploadResult.key!,
                mimetype: file.type,
                size: file.size,
                path: uploadResult.url!,
            }
        });

        // Mettre à jour le signalement avec le nouveau fichier
        const currentFiles = report.files ? JSON.parse(report.files) : [];
        const updatedFiles = [
            ...currentFiles,
            {
                id: uploadedFile.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: uploadResult.url,
                uploadDate: uploadedFile.uploadDate
            }
        ];

        await prisma.report.update({
            where: { id: reportId },
            data: {
                files: JSON.stringify(updatedFiles),
                updatedAt: new Date()
            }
        });

        console.log(`✅ Fichier uploadé et enregistré: ${file.name} pour le signalement ${reportId}`);

        return NextResponse.json({
            success: true,
            message: 'Fichier uploadé avec succès',
            file: {
                id: uploadedFile.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: uploadResult.url,
                uploadDate: uploadedFile.uploadDate
            }
        });

    } catch (error: any) {
        console.error('❌ Erreur upload fichier:', error);
        
        // Gestion des erreurs spécifiques
        if (error.message?.includes('AWS')) {
            return NextResponse.json({ 
                error: 'Erreur de stockage cloud. Veuillez réessayer.' 
            }, { status: 503 });
        }
        
        if (error.message?.includes('Prisma')) {
            return NextResponse.json({ 
                error: 'Erreur de base de données' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            error: 'Erreur serveur lors de l\'upload' 
        }, { status: 500 });
    }
}

// GET - Récupérer les fichiers d'un signalement
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const reportId = url.searchParams.get('reportId');

        if (!reportId) {
            return NextResponse.json({ 
                error: 'ID de signalement requis' 
            }, { status: 400 });
        }

        console.log(`📋 Récupération fichiers pour signalement: ${reportId}`);

        // Récupérer les fichiers depuis la base de données
        const files = await prisma.uploadedFile.findMany({
            where: { reportId },
            orderBy: { uploadDate: 'desc' }
        });

        console.log(`✅ ${files.length} fichier(s) trouvé(s) pour le signalement ${reportId}`);

        return NextResponse.json({
            success: true,
            files: files.map(file => ({
                id: file.id,
                name: file.originalName,
                size: file.size,
                type: file.mimetype,
                url: file.path,
                uploadDate: file.uploadDate
            }))
        });

    } catch (error: any) {
        console.error('❌ Erreur récupération fichiers:', error);
        return NextResponse.json({ 
            error: 'Erreur lors de la récupération des fichiers' 
        }, { status: 500 });
    }
}

// DELETE - Supprimer un fichier
export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const fileId = url.searchParams.get('fileId');

        if (!fileId) {
            return NextResponse.json({ 
                error: 'ID de fichier requis' 
            }, { status: 400 });
        }

        console.log(`🗑️ Suppression fichier: ${fileId}`);

        // Récupérer les infos du fichier
        const file = await prisma.uploadedFile.findUnique({
            where: { id: parseInt(fileId) },
            include: { report: true }
        });

        if (!file) {
            return NextResponse.json({ 
                error: 'Fichier non trouvé' 
            }, { status: 404 });
        }

        // Supprimer de S3 (optionnel - garder en backup)
        // await deleteFileFromS3(file.filename);

        // Supprimer de la base de données
        await prisma.uploadedFile.delete({
            where: { id: parseInt(fileId) }
        });

        // Mettre à jour le signalement
        if (file.report.files) {
            const currentFiles = JSON.parse(file.report.files);
            const updatedFiles = currentFiles.filter((f: any) => f.id !== parseInt(fileId));
            
            await prisma.report.update({
                where: { id: file.reportId },
                data: {
                    files: JSON.stringify(updatedFiles),
                    updatedAt: new Date()
                }
            });
        }

        console.log(`✅ Fichier supprimé: ${file.originalName}`);

        return NextResponse.json({
            success: true,
            message: 'Fichier supprimé avec succès'
        });

    } catch (error: any) {
        console.error('❌ Erreur suppression fichier:', error);
        return NextResponse.json({ 
            error: 'Erreur lors de la suppression du fichier' 
        }, { status: 500 });
    }
}