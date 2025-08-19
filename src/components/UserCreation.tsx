'use client';

import { useState } from 'react';

interface UserCreationProps {
  onBack: () => void;
}

export default function UserCreation({ onBack }: UserCreationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isAdmin: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const createUser = async () => {
    const { name, email, password } = formData;
    
    if (!name || !email || !password) {
      setError('Nom, email et mot de passe sont requis');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Utilisateur créé avec succès !');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          isAdmin: false
        });
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="btn btn-back mb-4" onClick={onBack}>
        ← Retour
      </button>
      
      <h3 className="text-2xl font-bold mb-6">Créer un nouvel utilisateur</h3>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {success && (
        <div className="success-message">{success}</div>
      )}
      
      <div className="form-group">
        <label>Nom complet *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Téléphone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="form-group">
        <label>Mot de passe * (min. 6 caractères)</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          minLength={6}
          required
        />
      </div>
      
      <div className="form-group">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleInputChange}
          />
          Droits administrateur
        </label>
      </div>
      
      <button 
        className="btn btn-success w-full" 
        onClick={createUser}
        disabled={loading}
      >
        {loading ? 'Création...' : 'Créer l\'utilisateur'}
      </button>
    </div>
  );
}