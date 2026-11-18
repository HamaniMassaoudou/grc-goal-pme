import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Save, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Organization, OrganizationStatus } from '../../types/grc';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orgData: Omit<Organization, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: Organization | null;
  mode: 'create' | 'edit';
}

const SECTOR_SUGGESTIONS = [
  'Services numériques & Conseil informatique',
  'Communication, Médias & Publicité',
  'Commerce & Distribution',
  'Santé, Médical & Pharmacie',
  'Industrie & Agroalimentaire',
  'BTP & Immobilier',
  'Transport & Logistique',
  'Services financiers & Comptabilité',
  'Éducation & Formation'
];

const SIZE_SUGGESTIONS = [
  '1 à 5 collaborateurs (Micro-entreprise)',
  '6 à 15 collaborateurs (TPE)',
  '16 à 50 collaborateurs (PME)',
  '51 à 250 collaborateurs (Moyenne entreprise)',
  'Plus de 250 collaborateurs'
];

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}) => {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [sector, setSector] = useState('');
  const [size, setSize] = useState('15 collaborateurs (TPE/PME)');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [securityOfficer, setSecurityOfficer] = useState('');
  const [grcScope, setGrcScope] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<OrganizationStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setLegalName(initialData.legalName || initialData.name || '');
      setSector(initialData.sector || '');
      setSize(initialData.size || '');
      setAddress(initialData.address || '');
      setPhone(initialData.phone || '');
      setContactEmail(initialData.contactEmail || '');
      setContactName(initialData.contactName || '');
      setSecurityOfficer(initialData.securityOfficer || '');
      setGrcScope(initialData.grcScope || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else if (mode === 'create') {
      setName('');
      setLegalName('');
      setSector('Services numériques & Conseil informatique');
      setSize('6 à 15 collaborateurs (TPE)');
      setAddress('');
      setPhone('');
      setContactEmail('');
      setContactName('');
      setSecurityOfficer('');
      setGrcScope('Système d’information, postes de travail, données clients et applications cloud.');
      setDescription('Mise en place de la démarche GRC ISO 27001 pour sécuriser les activités.');
      setStatus('active');
    }
    setError('');
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom de l’organisation est obligatoire.');
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setError('Veuillez renseigner un courriel professionnel valide.');
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      legalName: (legalName.trim() || name.trim()),
      sector: sector.trim() || 'Services professionnels',
      size: size.trim() || 'TPE/PME',
      address: address.trim(),
      phone: phone.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactName: contactName.trim() || 'Direction Générale',
      securityOfficer: securityOfficer.trim() || contactName.trim() || 'Référent GRC désigné',
      grcScope: grcScope.trim(),
      description: description.trim(),
      status,
      isDemo: initialData?.isDemo || false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Entête de la Modale */}
        <div className="bg-gradient-to-r from-[#0B3B7B] to-[#154c96] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {mode === 'create' ? 'Créer une nouvelle organisation' : 'Paramètres de l’organisation'}
              </h2>
              <p className="text-xs text-blue-100">
                {mode === 'create' 
                  ? 'Initialisez votre espace de travail GRC indépendant et sécurisé' 
                  : `Modification de la fiche pour ${initialData?.name || 'l’organisation'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1 : Identité commerciale et légale */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0B3B7B]" />
              <span>Identité & Forme Légale</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom d’usage de l’organisation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Alpha Conseil ou Sirba Communication"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:ring-1 focus:ring-[#0B3B7B] focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raison sociale / Nom commercial
                </label>
                <input
                  type="text"
                  placeholder="Ex. Alpha Conseil SARL"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secteur d’activité
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white"
                >
                  {SECTOR_SUGGESTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effectif / Taille de la structure
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white"
                >
                  {SIZE_SUGGESTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 : Coordonnées & Responsables */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0B3B7B]" />
              <span>Coordonnées & Responsables Clés</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirigeant / Représentant principal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex. M. Abdoul Salam Issifi"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Référent Sécurité / Correspondant GRC
                </label>
                <input
                  type="text"
                  placeholder="Ex. Hamani Massaoudou (Référent SSI)"
                  value={securityOfficer}
                  onChange={(e) => setSecurityOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Courriel professionnel officiel *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@entreprise.ne"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  placeholder="+227 20 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse physique / Siège social
              </label>
              <input
                type="text"
                placeholder="Ex. Avenue de l'Amitié, Quartier Plateau, Niamey, Niger"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Section 3 : Périmètre GRC & Statut */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B3B7B]" />
              <span>Périmètre GRC & Statut Opérationnel</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Périmètre d'application GRC cible
                </label>
                <input
                  type="text"
                  placeholder="Ex. Système d'information, serveurs, données clients et facturation"
                  value={grcScope}
                  onChange={(e) => setGrcScope(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statut de l'organisation
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrganizationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="in_configuration">En configuration</option>
                  <option value="suspended">Suspendue</option>
                  <option value="archived">Archivée</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contexte opérationnel & Enjeux de sécurité
              </label>
              <textarea
                rows={2}
                placeholder="Décrivez brièvement les activités clés et les impératifs de conformité ou de cybersécurité..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Pied de page */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {mode === 'create' 
                ? 'Une déclaration d’applicabilité SoA vierge ISO 27001 sera générée automatiquement.'
                : `ID Technique : ${initialData?.id || 'Automatique'}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{mode === 'create' ? 'Créer l’organisation' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
