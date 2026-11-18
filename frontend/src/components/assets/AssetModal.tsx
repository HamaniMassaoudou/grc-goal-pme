import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Asset, AssetCategory, AssetCriticality } from '../../types/grc';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => void;
  initialAsset?: Asset | null;
  organizationId: string;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAsset,
  organizationId
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('database');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('Abdoul Salam Issifi');
  const [criticality, setCriticality] = useState<AssetCriticality>('Moyenne');
  const [location, setLocation] = useState('Serveur Cloud / Bureau Niamey');

  useEffect(() => {
    if (initialAsset) {
      setName(initialAsset.name);
      setCategory(initialAsset.category);
      setDescription(initialAsset.description);
      setOwner(initialAsset.owner);
      setCriticality(initialAsset.criticality);
      setLocation(initialAsset.location || '');
    } else {
      setName('');
      setCategory('database');
      setDescription('');
      setOwner('Abdoul Salam Issifi');
      setCriticality('Moyenne');
      setLocation('Serveur Cloud / Bureau Niamey');
    }
  }, [initialAsset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialAsset?.id,
      name: name.trim(),
      category,
      description: description.trim(),
      owner: owner.trim(),
      criticality,
      location: location.trim(),
      organizationId,
      createdAt: initialAsset?.createdAt || new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialAsset ? 'Modifier l’actif' : 'Enregistrer un actif informationnel'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inventaire conforme aux critères EF-02 du cahier des charges
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom de l'actif *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Base de données clients, Serveur de messagerie..."
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie d'actif
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none capitalize"
              >
                <option value="database">Base de données</option>
                <option value="application">Application logicielle</option>
                <option value="server">Serveur / Hébergement</option>
                <option value="service">Service réseau / Cloud</option>
                <option value="hardware">Matériel / Terminaux</option>
                <option value="document">Document / Registre</option>
                <option value="process">Processus opérationnel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Niveau de criticité métier
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as AssetCriticality)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Critique">Critique (Vital)</option>
                <option value="Élevée">Élevée</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Propriétaire / Responsable
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Ex. Direction Commerciale"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localisation / Hébergement
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex. Cloud sécurisé, Bureau Niamey"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description de l'actif & Données traitées
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rôle pour la PME, sensibilité des informations hébergées..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition"
            >
              Enregistrer l’actif
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
