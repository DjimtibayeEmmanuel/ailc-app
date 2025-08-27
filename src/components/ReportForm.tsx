'use client';

import { useState } from 'react';

interface ReportFormProps {
  onBack: () => void;
  onSuccess: (trackingCode: string, reportId: string) => void;
}

interface ReportData {
  // Étape 1: Type et contexte
  corruptionType: string;
  sector: string;
  sectorName: string;
  amountRange: string;
  incidentDate: string;
  location: string;
  urgency: string;
  
  // Étape 2: Description détaillée
  description: string;
  circumstances: string;
  frequency: string;
  impact: string;
  
  // Étape 3: Personnes impliquées
  suspectNames: string;
  suspectPositions: string;
  suspectInstitution: string;
  witnesses: string;
  witnessContacts: string;
  relationToFacts: string;
  
  // Étape 4: Contact et preuves
  anonymity: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  evidenceFiles: File[];
}

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

// Composant pour l'upload de fichiers
function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = [
    'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/ogg',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
    'application/zip', 'application/x-rar-compressed', 'application/vnd.rar'
  ];

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const validFiles = Array.from(fileList).filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
        file.name.toLowerCase().endsWith('.mp3') ||
        file.name.toLowerCase().endsWith('.wav') ||
        file.name.toLowerCase().endsWith('.rar') ||
        file.name.toLowerCase().endsWith('.xls') ||
        file.name.toLowerCase().endsWith('.xlsx');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB max
      return isValidType && isValidSize;
    });

    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-section">
      <div 
        className={`file-drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="upload-content">
          <div className="upload-icon">📎</div>
          <p className="upload-title">Glissez-déposez vos fichiers ici</p>
          <p className="upload-subtitle">ou cliquez pour parcourir</p>
          <input
            type="file"
            multiple
            accept=".mp3,.wav,.mp4,.avi,.mov,.wmv,.flv,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar"
            onChange={(e) => handleFiles(e.target.files)}
            className="file-input"
          />
        </div>
      </div>
      
      <div className="supported-formats">
        <p><strong>Formats supportés:</strong></p>
        <div className="format-tags">
          <span className="format-tag audio">Audio: MP3, WAV</span>
          <span className="format-tag video">Vidéo: MP4, AVI, MOV</span>
          <span className="format-tag document">Documents: PDF, Word, Excel</span>
          <span className="format-tag image">Images: PNG, JPG</span>
          <span className="format-tag archive">Archives: ZIP, RAR</span>
        </div>
        <p className="size-limit">Taille max: 100MB par fichier</p>
      </div>

      {files.length > 0 && (
        <div className="uploaded-files">
          <h4>Fichiers joints ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(index)}
                className="remove-file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportForm({ onBack, onSuccess }: ReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReportData>({
    // Étape 1
    corruptionType: '',
    sector: '',
    sectorName: '',
    amountRange: '',
    incidentDate: '',
    location: '',
    urgency: '',
    
    // Étape 2
    description: '',
    circumstances: '',
    frequency: '',
    impact: '',
    
    // Étape 3
    suspectNames: '',
    suspectPositions: '',
    suspectInstitution: '',
    witnesses: '',
    witnessContacts: '',
    relationToFacts: '',
    
    // Étape 4
    anonymity: 'total',
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    evidenceFiles: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: files
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = () => {
    return formData.corruptionType && formData.sector && formData.sectorName && formData.amountRange && formData.incidentDate && formData.location;
  };

  const canProceedStep2 = () => {
    return formData.description && formData.circumstances;
  };

  const canProceedStep3 = () => {
    return formData.relationToFacts;
  };

  const submitReport = async () => {
    setLoading(true);
    setError('');

    try {
      // Préparer les métadonnées des fichiers pour l'envoi (sécurisé)
      const filesMetadata = (formData.evidenceFiles || []).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      // Mapper la gravité basée sur le montant et l'urgence
      let severity = 'faible';
      if (formData.urgency === 'tres_eleve') severity = 'critique';
      else if (formData.urgency === 'eleve') severity = 'eleve';
      else if (formData.urgency === 'moyen') severity = 'moyen';
      
      const dataToSend = {
        // Champs obligatoires mappés correctement
        corruptionType: formData.corruptionType,
        sector: formData.sector,
        sectorName: formData.sectorName,
        severity: severity,
        incidentDate: formData.incidentDate,
        location: formData.location,
        description: formData.description,
        relationToFacts: formData.relationToFacts,
        anonymity: formData.anonymity,
        
        // Champs optionnels
        amountRange: formData.amountRange,
        urgency: formData.urgency,
        circumstances: formData.circumstances,
        frequency: formData.frequency,
        impact: formData.impact,
        suspectNames: formData.suspectNames,
        suspectPositions: formData.suspectPositions,
        suspectInstitution: formData.suspectInstitution,
        witnesses: formData.witnesses,
        witnessContacts: formData.witnessContacts,
        
        // Informations du signaleur
        reporterName: formData.reporterName,
        reporterPhone: formData.reporterPhone,
        reporterEmail: formData.reporterEmail,
        
        // Fichiers (sécurisé avec fallback)
        files: filesMetadata.length > 0 ? filesMetadata : []
      };

      const response = await fetch('/api/reports/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('📡 Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Ce n'est pas du JSON - probablement une erreur HTML
        const textResponse = await response.text();
        console.error('❌ Réponse non-JSON reçue:', textResponse.substring(0, 500));
        setError(`Erreur serveur (${response.status}): Réponse invalide reçue`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Signalement soumis avec succès:', data);
        onSuccess(data.trackingCode, data.reportId);
      } else {
        console.error('❌ Erreur API:', data);
        if (data.details && Array.isArray(data.details)) {
          setError(`Erreurs de validation: ${data.details.join(', ')}`);
        } else {
          setError(data.error || `Erreur ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur critique côté client:', error);
      
      // Gestion détaillée des erreurs côté client
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        setError('Réponse serveur invalide. Le serveur a un problème de configuration.');
      } else if (error instanceof Error) {
        setError(`Erreur: ${error.message}`);
      } else {
        setError('Une erreur inattendue s\'est produite lors de la soumission.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3 className="step-title">Informations générales</h3>
      <p className="step-description">Commençons par identifier le type et le contexte de l'incident</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Type de corruption *</label>
          <select 
            name="corruptionType" 
            value={formData.corruptionType} 
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionnez le type</option>
            <option value="pot_de_vin">Pot-de-vin</option>
            <option value="detournement">Détournement de fonds</option>
            <option value="favoritisme">Favoritisme</option>
            <option value="abus_pouvoir">Abus de pouvoir</option>
            <option value="marche_public">Irrégularité dans les marchés publics</option>
            <option value="concussion">Concussion</option>
            <option value="racket">Racket</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label>Secteur concerné *</label>
          <select 
            name="sector" 
            value={formData.sector} 
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionnez le secteur</option>
            <option value="public">Secteur Public</option>
            <option value="parapublic">Parapublic</option>
            <option value="prive">Secteur Privé</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nom du secteur *</label>
          <input 
            type="text"
            name="sectorName" 
            value={formData.sectorName} 
            onChange={handleInputChange}
            placeholder="Ex: Ministère de la Santé, Banque XYZ, Société ABC..."
            required
          />
        </div>

        <div className="form-group">
          <label>Montant impliqué (FCFA) *</label>
          <select 
            name="amountRange" 
            value={formData.amountRange} 
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionnez une fourchette</option>
            <option value="moins_100000">Moins de 100 000 FCFA</option>
            <option value="100000_1000000">100 000 - 1 000 000 FCFA</option>
            <option value="1000000_10000000">1 - 10 millions FCFA</option>
            <option value="10000000_100000000">10 - 100 millions FCFA</option>
            <option value="plus_100000000">Plus de 100 millions FCFA</option>
            <option value="inconnu">Montant inconnu</option>
          </select>
        </div>

        <div className="form-group">
          <label>Niveau d'urgence *</label>
          <select 
            name="urgency" 
            value={formData.urgency} 
            onChange={handleInputChange}
            required
          >
            <option value="">Évaluez l'urgence</option>
            <option value="faible">Faible - Fait isolé</option>
            <option value="moyenne">Moyenne - Pratique récurrente</option>
            <option value="haute">Haute - En cours actuellement</option>
            <option value="critique">Critique - Menace imminente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date de l'incident *</label>
          <input 
            type="date" 
            name="incidentDate" 
            value={formData.incidentDate} 
            onChange={handleInputChange}
            required 
          />
        </div>

        <div className="form-group">
          <label>Lieu de l'incident *</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange}
            placeholder="Ville, région ou lieu précis au Tchad"
            required 
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3 className="step-title">Description détaillée</h3>
      <p className="step-description">Décrivez les faits de manière précise et détaillée</p>

      <div className="form-group">
        <label>Description des faits *</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange}
          rows={6}
          placeholder="Décrivez précisément ce qui s'est passé : qui, quoi, où, quand, comment..."
          required
        />
      </div>

      <div className="form-group">
        <label>Circonstances et contexte *</label>
        <textarea 
          name="circumstances" 
          value={formData.circumstances} 
          onChange={handleInputChange}
          rows={4}
          placeholder="Quelles étaient les circonstances ? Quel était le contexte de la situation ?"
          required
        />
      </div>

      <div className="form-group">
        <label>Fréquence de l'incident</label>
        <select 
          name="frequency" 
          value={formData.frequency} 
          onChange={handleInputChange}
        >
          <option value="">Sélectionnez la fréquence</option>
          <option value="unique">Incident unique</option>
          <option value="occasionnel">Occasionnel (quelques fois)</option>
          <option value="regulier">Régulier (mensuel)</option>
          <option value="frequent">Fréquent (hebdomadaire)</option>
          <option value="systematique">Systématique (quotidien)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Impact et conséquences</label>
        <textarea 
          name="impact" 
          value={formData.impact} 
          onChange={handleInputChange}
          rows={3}
          placeholder="Quelles sont les conséquences de cet acte ? Sur qui cela a-t-il un impact ?"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3 className="step-title">Personnes impliquées</h3>
      <p className="step-description">Informations sur les personnes impliquées et les témoins</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Nom(s) des personnes impliquées</label>
          <input 
            type="text" 
            name="suspectNames" 
            value={formData.suspectNames} 
            onChange={handleInputChange}
            placeholder="Noms ou surnoms des personnes soupçonnées"
          />
        </div>

        <div className="form-group">
          <label>Fonction(s) des personnes impliquées</label>
          <input 
            type="text" 
            name="suspectPositions" 
            value={formData.suspectPositions} 
            onChange={handleInputChange}
            placeholder="Poste, grade, fonction dans l'institution"
          />
        </div>

        <div className="form-group">
          <label>Institution/Organisation concernée</label>
          <input 
            type="text" 
            name="suspectInstitution" 
            value={formData.suspectInstitution} 
            onChange={handleInputChange}
            placeholder="Nom de l'institution, ministère, entreprise..."
          />
        </div>

        <div className="form-group">
          <label>Votre relation aux faits *</label>
          <select 
            name="relationToFacts" 
            value={formData.relationToFacts} 
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionnez votre situation</option>
            <option value="victime">Victime directe</option>
            <option value="temoin">Témoin direct</option>
            <option value="informateur">Informateur</option>
            <option value="collegue">Collègue/proche</option>
            <option value="citoyen">Citoyen concerné</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Témoins éventuels</label>
        <textarea 
          name="witnesses" 
          value={formData.witnesses} 
          onChange={handleInputChange}
          rows={3}
          placeholder="Noms des personnes témoins des faits (si vous les connaissez)"
        />
      </div>

      <div className="form-group">
        <label>Contacts des témoins</label>
        <textarea 
          name="witnessContacts" 
          value={formData.witnessContacts} 
          onChange={handleInputChange}
          rows={2}
          placeholder="Moyens de contacter les témoins (téléphone, adresse...)"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3 className="step-title">Contact et preuves</h3>
      <p className="step-description">Vos coordonnées et les preuves à joindre</p>

      <div className="form-group">
        <label>Niveau d'anonymat souhaité *</label>
        <select 
          name="anonymity" 
          value={formData.anonymity} 
          onChange={handleInputChange}
          required
        >
          <option value="total">Anonymat total (aucune donnée personnelle)</option>
          <option value="partiel">Anonymat partiel (contact possible par l'AILC)</option>
          <option value="aucun">Aucun anonymat (signalement nominatif)</option>
        </select>
      </div>

      {(formData.anonymity === 'partiel' || formData.anonymity === 'aucun') && (
        <div className="contact-section">
          <h4 className="section-subtitle">Vos coordonnées</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Nom complet</label>
              <input 
                type="text" 
                name="reporterName" 
                value={formData.reporterName} 
                onChange={handleInputChange}
                placeholder="Votre nom et prénom"
              />
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                name="reporterPhone" 
                value={formData.reporterPhone} 
                onChange={handleInputChange}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="reporterEmail" 
                value={formData.reporterEmail} 
                onChange={handleInputChange}
                placeholder="Votre adresse email"
              />
            </div>
          </div>
        </div>
      )}

      <div className="evidence-section">
        <h4 className="section-subtitle">Preuves et documents</h4>
        <p className="section-description">
          Joignez tout document, photo, audio ou vidéo qui peut appuyer votre signalement
        </p>
        <FileUpload 
          files={formData.evidenceFiles} 
          onFilesChange={handleFilesChange}
        />
      </div>
    </div>
  );

  return (
    <div className="modern-report-form">
      <div className="form-header">
        <button className="btn btn-back" onClick={onBack}>
          ← Retour à l'accueil
        </button>
        
        <div className="form-title-section">
          <h2 className="form-title">Signalement de Corruption</h2>
          <p className="form-subtitle">
            🔒 Vos données personnelles seront chiffrées et protégées
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="steps-indicator">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Informations'}
                {step === 2 && 'Description'}
                {step === 3 && 'Personnes'}
                {step === 4 && 'Contact & Preuves'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-body">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="form-navigation">
        <div className="nav-buttons">
          {currentStep > 1 && (
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={prevStep}
            >
              ← Précédent
            </button>
          )}

          <div className="nav-spacer"></div>

          {currentStep < 4 ? (
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !canProceedStep1()) ||
                (currentStep === 2 && !canProceedStep2()) ||
                (currentStep === 3 && !canProceedStep3())
              }
            >
              Suivant →
            </button>
          ) : (
            <button 
              type="button"
              className="btn btn-success" 
              onClick={submitReport}
              disabled={loading}
            >
              {loading ? 'Envoi...' : '📢 Soumettre le signalement'}
            </button>
          )}
        </div>

        <div className="form-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">Étape {currentStep} sur 4</span>
        </div>
      </div>
    </div>
  );
}