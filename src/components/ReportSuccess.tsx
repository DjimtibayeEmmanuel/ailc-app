'use client';

import { useState, useEffect } from 'react';
import LegalProtectionInfo from './LegalProtectionInfo';

interface ReportDetails {
  id: string;
  corruption_type: string;
  sector: string;
  severity?: string;
  amount?: string;
  incident_date: string;
  location: string;
  description: string;
  tracking_code: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  anonymity_level: string;
  status: string;
  created_at: string;
  updated_at: string;
  files?: Array<{name: string, size: number, type: string}>;
  suspect_names?: string;
  suspect_positions?: string;
  suspect_institution?: string;
  witnesses?: string;
  relation_to_facts?: string;
}

interface ReportSuccessProps {
  trackingCode: string;
  reportId: string;
  onBack: () => void;
  onNewReport: () => void;
}

export default function ReportSuccess({ trackingCode, reportId, onBack, onNewReport }: ReportSuccessProps) {
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await fetch(`/api/reports/details/${reportId}`);
        if (response.ok) {
          const details = await response.json();
          setReportDetails(details);
        }
      } catch (error) {
        console.error('Erreur récupération détails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (!type) return '📎';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  const getAmountLabel = (amount: string) => {
    if (!amount) return 'Non spécifié';
    const labels: {[key: string]: string} = {
      'moins_100000': 'Moins de 100 000 FCFA',
      '100000_1000000': '100 000 - 1 000 000 FCFA',
      '1000000_10000000': '1 - 10 millions FCFA',
      '10000000_100000000': '10 - 100 millions FCFA',
      'plus_100000000': 'Plus de 100 millions FCFA',
      'inconnu': 'Montant inconnu'
    };
    return labels[amount] || amount;
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    alert('Code de suivi copié dans le presse-papiers !');
  };

  const printCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Code de Suivi AILC Tchad</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
              .header { color: #1a365d; margin-bottom: 30px; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                      background: #f0f0f0; padding: 20px; border: 2px solid #ccc; 
                      margin: 20px 0; font-family: monospace; }
              .info { text-align: left; margin: 30px 0; padding: 20px; 
                      background: #f8f9fa; border-left: 4px solid #1a365d; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🇹🇩 AILC TCHAD</h1>
              <h2>Code de Suivi de Signalement</h2>
            </div>
            
            <div class="code">${trackingCode}</div>
            
            <div class="info">
              <h3>Informations importantes :</h3>
              <ul>
                <li><strong>ID du signalement :</strong> ${reportId}</li>
                <li><strong>Date de soumission :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                <li><strong>Conservation :</strong> Gardez ce code précieusement</li>
                <li><strong>Suivi :</strong> Utilisez ce code sur notre plateforme pour suivre l'évolution</li>
                <li><strong>Confidentialité :</strong> Ce code garantit votre anonymat</li>
              </ul>
              
              <p><strong>Comment suivre votre signalement :</strong></p>
              <ol>
                <li>Rendez-vous sur la plateforme AILC Tchad</li>
                <li>Cliquez sur "Suivre un signalement"</li>
                <li>Saisissez votre code de suivi</li>
                <li>Consultez le statut de votre dossier</li>
              </ol>
            </div>
            
            <div class="footer">
              <p>AILC Tchad - Autorité d'Intégrité et de Lutte contre la Corruption</p>
              <p>Document confidentiel - Ne pas divulguer</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="auth-container">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Signalement Envoyé !</h2>
          <p className="text-lg text-gray-600">
            Votre signalement a été soumis avec succès à l'AILC Tchad
          </p>
        </div>

        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            📋 Votre Code de Suivi
          </h3>
          
          <div className="mb-4">
            <div className="text-4xl font-mono font-bold text-green-700 tracking-widest bg-white p-4 border-2 border-green-300 rounded">
              {trackingCode}
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <button 
              className="btn btn-secondary"
              onClick={copyToClipboard}
            >
              📋 Copier
            </button>
            <button 
              className="btn btn-secondary"
              onClick={printCode}
            >
              🖨️ Imprimer
            </button>
          </div>

          <p className="text-green-700 text-sm">
            <strong>⚠️ IMPORTANT :</strong> Conservez précieusement ce code pour suivre l'évolution de votre signalement
          </p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-blue-800">📌 Détails de votre soumission</h4>
            <button 
              className="btn btn-small btn-secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '👁️ Masquer détails' : '👁️ Voir tous les détails'}
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">ID du signalement :</span>
              <span className="font-mono text-blue-800">{reportId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Date de soumission :</span>
              <span className="text-blue-800">{new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Statut initial :</span>
              <span className="text-blue-800 font-semibold">📥 Reçu - En attente de traitement</span>
            </div>
            {reportDetails && (
              <>
                <div className="flex justify-between">
                  <span className="text-blue-600">Type de corruption :</span>
                  <span className="text-blue-800">{reportDetails.corruption_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Secteur concerné :</span>
                  <span className="text-blue-800">{reportDetails.sector}</span>
                </div>
                {reportDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Montant estimé :</span>
                    <span className="text-blue-800">{getAmountLabel(reportDetails.amount)}</span>
                  </div>
                )}
                {reportDetails.files && reportDetails.files.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Fichiers joints :</span>
                    <span className="text-blue-800">📎 {reportDetails.files.length} fichier(s)</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showDetails && reportDetails && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left">
            <h4 className="font-semibold text-gray-800 mb-4">📋 Résumé complet du signalement</h4>
            
            {/* Informations générales */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-1">ℹ️ Informations générales</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Type :</span>
                  <span className="ml-2 text-gray-800">{reportDetails.corruption_type}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Secteur :</span>
                  <span className="ml-2 text-gray-800">{reportDetails.sector}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Lieu :</span>
                  <span className="ml-2 text-gray-800">{reportDetails.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Date incident :</span>
                  <span className="ml-2 text-gray-800">{new Date(reportDetails.incident_date).toLocaleDateString('fr-FR')}</span>
                </div>
                {reportDetails.amount && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 font-medium">Montant estimé :</span>
                    <span className="ml-2 text-gray-800 bg-blue-100 px-2 py-1 rounded">{getAmountLabel(reportDetails.amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-1">📝 Description des faits</h5>
              <div className="bg-white p-4 rounded border text-sm text-gray-800 leading-relaxed">
                {reportDetails.description}
              </div>
            </div>

            {/* Personnes impliquées */}
            {(reportDetails.suspect_names || reportDetails.witnesses) && (
              <div className="mb-6">
                <h5 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-1">👥 Personnes impliquées</h5>
                <div className="space-y-3 text-sm">
                  {reportDetails.suspect_names && (
                    <div>
                      <span className="text-gray-600 font-medium">Personnes soupçonnées :</span>
                      <div className="ml-2 text-gray-800 bg-red-50 p-2 rounded mt-1">{reportDetails.suspect_names}</div>
                    </div>
                  )}
                  {reportDetails.suspect_positions && (
                    <div>
                      <span className="text-gray-600 font-medium">Fonctions :</span>
                      <div className="ml-2 text-gray-800 bg-orange-50 p-2 rounded mt-1">{reportDetails.suspect_positions}</div>
                    </div>
                  )}
                  {reportDetails.suspect_institution && (
                    <div>
                      <span className="text-gray-600 font-medium">Institution :</span>
                      <div className="ml-2 text-gray-800 bg-yellow-50 p-2 rounded mt-1">{reportDetails.suspect_institution}</div>
                    </div>
                  )}
                  {reportDetails.witnesses && (
                    <div>
                      <span className="text-gray-600 font-medium">Témoins :</span>
                      <div className="ml-2 text-gray-800 bg-green-50 p-2 rounded mt-1">{reportDetails.witnesses}</div>
                    </div>
                  )}
                  {reportDetails.relation_to_facts && (
                    <div>
                      <span className="text-gray-600 font-medium">Votre relation aux faits :</span>
                      <div className="ml-2 text-gray-800 bg-blue-50 p-2 rounded mt-1">{reportDetails.relation_to_facts}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fichiers joints */}
            {reportDetails.files && reportDetails.files.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-1">📎 Fichiers joints ({reportDetails.files.length})</h5>
                <div className="space-y-2">
                  {reportDetails.files.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border text-sm">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{file.name}</div>
                        <div className="text-gray-600">{formatFileSize(file.size)} • {file.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anonymat */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-1">🔒 Confidentialité</h5>
              <div className="text-sm">
                <div className="bg-purple-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Niveau d'anonymat choisi :</span>
                  <span className="ml-2 text-purple-800 font-semibold">
                    {reportDetails.anonymity_level === 'total' ? '🔒 Anonymat total' :
                     reportDetails.anonymity_level === 'partiel' ? '🔐 Anonymat partiel' :
                     '📧 Signalement nominatif'}
                  </span>
                </div>
                {reportDetails.anonymity_level !== 'total' && reportDetails.reporter_name !== 'Non fourni' && (
                  <div className="mt-3 bg-blue-50 p-3 rounded">
                    <span className="text-gray-600 font-medium">Contact :</span>
                    <span className="ml-2 text-blue-800">{reportDetails.reporter_name}</span>
                    {reportDetails.reporter_email !== 'Non fourni' && (
                      <span className="ml-2 text-blue-600">({reportDetails.reporter_email})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
          <h4 className="font-semibold text-yellow-800 mb-3">⏳ Prochaines étapes</h4>
          
          <ol className="text-yellow-700 text-sm space-y-2">
            <li><strong>1.</strong> Votre signalement est automatiquement enregistré dans notre système sécurisé</li>
            <li><strong>2.</strong> Nos équipes vont examiner votre dossier dans les plus brefs délais</li>
            <li><strong>3.</strong> Une enquête sera menée si les faits le justifient</li>
            <li><strong>4.</strong> Vous pouvez suivre l'évolution grâce à votre code de suivi</li>
            <li><strong>5.</strong> L'AILC prendra les mesures appropriées selon les conclusions</li>
          </ol>
        </div>

        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left">
          <h4 className="font-semibold text-gray-800 mb-3">🔒 Confidentialité garantie</h4>
          
          <ul className="text-gray-700 text-sm space-y-1">
            <li>• Vos données personnelles sont chiffrées et protégées</li>
            <li>• Seul votre code de suivi permet d'accéder aux informations</li>
            <li>• L'AILC respecte strictement votre niveau d'anonymat choisi</li>
            <li>• Aucune information ne sera divulguée sans votre autorisation</li>
          </ul>
        </div>

        {/* Section Protection Légale */}
        <LegalProtectionInfo />

        <div className="flex gap-4 justify-center">
          <button 
            className="btn btn-primary"
            onClick={onNewReport}
          >
            📢 Nouveau signalement
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onBack}
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}