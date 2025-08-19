'use client';

import { useState } from 'react';
import LegalProtectionInfo from './LegalProtectionInfo';

interface ReportTrackingProps {
  onBack: () => void;
}

interface TrackingResult {
  reportId: string;
  status: string;
  statusMessage: string;
  filesCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReportTracking({ onBack }: ReportTrackingProps) {
  const [trackingCode, setTrackingCode] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trackReport = async () => {
    if (!trackingCode || trackingCode.length !== 8) {
      setError('Veuillez saisir un code de suivi valide (8 caractères)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/reports/track/${trackingCode.toUpperCase()}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur lors de la recherche');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '📥';
      case 'investigating': return '🔍';
      case 'resolved': return '✅';
      case 'closed': return '🔒';
      default: return '❓';
    }
  };

  return (
    <div className="auth-container">
      <button className="btn btn-back mb-4" onClick={onBack}>
        ← Retour
      </button>
      
      <h3 className="text-2xl font-bold mb-6">Suivi de Signalement</h3>
      
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        🔍 <strong>Suivi sécurisé</strong> - Entrez votre code de suivi pour connaître l'état de votre signalement
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-group">
        <label>Code de suivi (8 caractères)</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="ABCD1234"
            maxLength={8}
            className="flex-1 font-mono text-lg tracking-wider"
          />
          <button 
            className="btn btn-primary" 
            onClick={trackReport}
            disabled={loading}
          >
            {loading ? 'Recherche...' : '🔍 Suivre'}
          </button>
        </div>
        <small className="text-gray-600">
          Le code de suivi vous a été fourni lors de la soumission de votre signalement
        </small>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
          <h4 className="text-xl font-semibold mb-4">📋 Détails du Signalement</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  ID du signalement
                </label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{result.reportId}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Statut actuel
                </label>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                  <span>{getStatusIcon(result.status)}</span>
                  {result.statusMessage}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Fichiers joints
                </label>
                <p className="text-gray-800">
                  {result.filesCount > 0 ? (
                    <span className="text-green-600">
                      📎 {result.filesCount} fichier(s) joint(s)
                    </span>
                  ) : (
                    <span className="text-gray-500">Aucun fichier joint</span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Date de soumission
                </label>
                <p className="text-gray-800">{formatDate(result.createdAt)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Dernière mise à jour
                </label>
                <p className="text-gray-800">{formatDate(result.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h5 className="font-semibold text-blue-800 mb-2">ℹ️ Informations importantes</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Conservez précieusement votre code de suivi</li>
              <li>• Vous pouvez vérifier l'évolution à tout moment</li>
              <li>• Les traitements peuvent prendre plusieurs semaines</li>
              <li>• L'AILC Tchad garantit la confidentialité de votre signalement</li>
            </ul>
          </div>

          {result.status === 'new' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                ⏳ Votre signalement a été reçu et sera traité dans les plus brefs délais par nos équipes.
              </p>
            </div>
          )}

          {result.status === 'investigating' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
              <p className="text-orange-800 text-sm">
                🔍 Une enquête est en cours. Nos équipes examinent votre signalement avec attention.
              </p>
            </div>
          )}

          {(result.status === 'resolved' || result.status === 'closed') && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 text-sm">
                ✅ Votre signalement a été traité. Merci pour votre contribution à la lutte contre la corruption.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
        <h5 className="font-semibold text-gray-800 mb-2">❓ Besoin d'aide ?</h5>
        <p className="text-gray-600 text-sm">
          Si vous avez perdu votre code de suivi ou rencontrez des difficultés, 
          contactez l'AILC Tchad via les canaux officiels. Votre anonymat sera préservé.
        </p>
      </div>

      {/* Section Protection Légale */}
      <LegalProtectionInfo />
    </div>
  );
}