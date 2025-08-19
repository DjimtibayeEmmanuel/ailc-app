'use client';

import LegalProtectionInfo from './LegalProtectionInfo';

interface MainOptionsProps {
  onShowAdmin: () => void;
  onShowReportForm: () => void;
  onShowTracking: () => void;
}

export default function MainOptions({ 
  onShowAdmin, 
  onShowReportForm, 
  onShowTracking 
}: MainOptionsProps) {
  return (
    <div className="modern-homepage">
      {/* Hero Section avec fond en dégradé */}
      <div className="hero-section">
        <div className="hero-content">
          {/* Logo et Titre */}
          <div className="logo-section">
            <div className="logo-container">
              <img 
                src="/logo-ailc.png" 
                alt="Logo AILC Tchad" 
                className="logo-image"
              />
            </div>
            <div className="title-section">
              <h1 className="main-title">
                AILC TCHAD
              </h1>
              <div className="title-divider"></div>
              <h2 className="subtitle">
                Autorité Indépendante de Lutte contre la Corruption
              </h2>
              <p className="subtitle-arabic">
                السلطة المستقلة لمكافحة الفساد
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <p className="hero-description">
              Plateforme sécurisée et confidentielle pour signaler 
              les actes de corruption au Tchad
            </p>
          </div>
        </div>
      </div>

      {/* Section des Actions */}
      <div className="actions-section">
        <div className="section-header">
          <h3 className="section-title">Comment pouvons-nous vous aider ?</h3>
          <p className="section-subtitle">Choisissez l'action qui correspond à vos besoins</p>
        </div>

        <div className="action-cards">
          {/* Carte Signaler */}
          <div className="action-card primary-card" onClick={onShowReportForm}>
            <div className="card-icon">
              <div className="icon-wrapper report-icon">
                📢
              </div>
            </div>
            <div className="card-content">
              <h4 className="card-title">Signaler un acte</h4>
              <p className="card-description">
                Signalez anonymement ou nominativement un acte de corruption
              </p>
              <div className="card-features">
                <span className="feature-tag">✓ Anonymat garanti</span>
                <span className="feature-tag">✓ Sécurisé</span>
              </div>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Carte Suivre */}
          <div className="action-card" onClick={onShowTracking}>
            <div className="card-icon">
              <div className="icon-wrapper track-icon">
                🔍
              </div>
            </div>
            <div className="card-content">
              <h4 className="card-title">Suivre un signalement</h4>
              <p className="card-description">
                Consultez l'état d'avancement avec votre code de suivi
              </p>
              <div className="card-features">
                <span className="feature-tag">✓ Suivi en temps réel</span>
              </div>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Carte Admin */}
          <div className="action-card admin-card" onClick={onShowAdmin}>
            <div className="card-icon">
              <div className="icon-wrapper admin-icon">
                ⚙️
              </div>
            </div>
            <div className="card-content">
              <h4 className="card-title">Administration</h4>
              <p className="card-description">
                Espace réservé aux administrateurs AILC
              </p>
              <div className="card-features">
                <span className="feature-tag">🔒 Accès sécurisé</span>
              </div>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="info-footer">
          <div className="info-cards">
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <span className="info-text">Sécurisé</span>
            </div>
            <div className="info-item">
              <span className="info-icon">👤</span>
              <span className="info-text">Anonyme</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <span className="info-text">24h/7j</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🇹🇩</span>
              <span className="info-text">Tchad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Protection Légale */}
      <LegalProtectionInfo />
    </div>
  );
}