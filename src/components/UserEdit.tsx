'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
}

interface UserEditProps {
  user: User | null;
  authToken: string;
  onBack: () => void;
  onSave: () => void;
}

export default function UserEdit({ user, authToken, onBack, onSave }: UserEditProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        isAdmin: user.is_admin
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Utilisateur mis à jour avec succès');
        onSave();
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('Utilisateur supprimé avec succès');
        onSave();
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <p>Utilisateur non trouvé</p>
        <button className="btn btn-back" onClick={onBack}>← Retour</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <button className="btn btn-back mb-4" onClick={onBack}>
        ← Retour à la liste
      </button>
      
      <h3 className="text-2xl font-bold mb-6">Éditer l'utilisateur</h3>
      
      {error && (
        <div className="error-message">{error}</div>
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
        <label>Nouveau mot de passe (laisser vide pour conserver)</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Nouveau mot de passe (optionnel)"
        />
        <small className="text-gray-600">
          Minimum 6 caractères. Laisser vide pour conserver le mot de passe actuel.
        </small>
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
      
      <div className="flex gap-4 mt-6">
        <button 
          className="btn btn-success flex-1" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
        
        {user.id !== 1 && (
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            🗑️ Supprimer
          </button>
        )}
        
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          disabled={loading}
        >
          Annuler
        </button>
      </div>
      
      {user.id === 1 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            ⚠️ Cet utilisateur est l'administrateur principal et ne peut pas être supprimé.
          </p>
        </div>
      )}
    </div>
  );
}