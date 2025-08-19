'use client';

export default function LegalProtectionInfo() {
  return (
    <div className="legal-protection-section">
      <div className="legal-protection-container">
        <div className="legal-protection-header">
          <div className="legal-icon">⚖️</div>
          <h3 className="legal-title">Protection Légale des Dénonciateurs</h3>
          <p className="legal-subtitle">Votre sécurité est garantie par la loi tchadienne</p>
        </div>

        <div className="legal-content">
          <div className="law-reference">
            <h4 className="law-title">
              📜 Loi N°_012_/PR/16 Portant Code de Procédure Pénale
            </h4>
            <p className="law-section">
              <strong>Section 6 :</strong> Modes et preuves en matière de corruption et infractions assimilées
            </p>
            <p className="law-section">
              <strong>Paragraphe 5 :</strong> De la protection des dénonciateurs, témoins, experts et victimes
            </p>
          </div>

          <div className="articles-container">
            <div className="legal-article">
              <div className="article-header">
                <span className="article-number">Article 159</span>
                <span className="protection-badge">🛡️ Protection Spéciale</span>
              </div>
              <div className="article-content">
                <p>
                  Dans le cadre de la répression des infractions visées à la présente section, 
                  les <strong>dénonciateurs, témoins, experts, victimes et leurs proches</strong> 
                  bénéficient d'une <strong>protection spéciale de l'État</strong> contre les actes 
                  éventuels de représailles ou d'intimidation.
                </p>
              </div>
            </div>

            <div className="legal-article">
              <div className="article-header">
                <span className="article-number">Article 160</span>
                <span className="penalty-badge">⚠️ Sanctions Pénales</span>
              </div>
              <div className="article-content">
                <p>
                  Est puni d'<strong>un (1) à dix (10) ans d'emprisonnement</strong>, le fait pour 
                  quiconque de recourir à la force physique, aux menaces ou intimidations commises 
                  en représailles à l'endroit de dénonciateurs, témoins, experts, victimes et de 
                  leurs proches.
                </p>
              </div>
            </div>
          </div>

          <div className="legal-footer">
            <div className="assurance-message">
              <div className="assurance-icon">🔒</div>
              <div className="assurance-text">
                <h5>Votre signalement est protégé</h5>
                <p>
                  L'État du Tchad garantit votre sécurité et celle de vos proches. 
                  Toute forme de représailles est sévèrement punie par la loi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}