import React, { useState, useEffect } from 'react';
import { X, Calculator, ShieldCheck } from 'lucide-react';
import { Risk, Asset, RiskStrategy, RiskStatus } from '../../types/grc';
import { calculateRiskLevel } from '../../services/storage';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (riskData: Partial<Risk>) => void;
  initialRisk?: Risk | null;
  assets: Asset[];
  nextCode: string;
}

export const RiskModal: React.FC<RiskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRisk,
  assets,
  nextCode
}) => {
  const [code, setCode] = useState(nextCode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [threat, setThreat] = useState('');
  const [vulnerability, setVulnerability] = useState('');
  const [owner, setOwner] = useState('Hamani Massaoudou');
  const [probability, setProbability] = useState<number>(3);
  const [impact, setImpact] = useState<number>(3);
  const [strategy, setStrategy] = useState<RiskStrategy>('réduire');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [status, setStatus] = useState<RiskStatus>('ouvert');
  
  // Risque résiduel
  const [hasResidual, setHasResidual] = useState(false);
  const [residualProbability, setResidualProbability] = useState<number>(2);
  const [residualImpact, setResidualImpact] = useState<number>(2);

  useEffect(() => {
    if (initialRisk) {
      setCode(initialRisk.code);
      setTitle(initialRisk.title);
      setDescription(initialRisk.description);
      setAssetId(initialRisk.assetId);
      setThreat(initialRisk.threat);
      setVulnerability(initialRisk.vulnerability);
      setOwner(initialRisk.owner);
      setProbability(initialRisk.probability);
      setImpact(initialRisk.impact);
      setStrategy(initialRisk.strategy);
      setTreatmentNotes(initialRisk.treatmentNotes || '');
      setStatus(initialRisk.status);
      if (initialRisk.residualProbability && initialRisk.residualImpact) {
        setHasResidual(true);
        setResidualProbability(initialRisk.residualProbability);
        setResidualImpact(initialRisk.residualImpact);
      } else {
        setHasResidual(false);
      }
    } else {
      setCode(nextCode);
      setTitle('');
      setDescription('');
      setAssetId(assets[0]?.id || '');
      setThreat('');
      setVulnerability('');
      setOwner('Hamani Massaoudou');
      setProbability(3);
      setImpact(3);
      setStrategy('réduire');
      setTreatmentNotes('');
      setStatus('ouvert');
      setHasResidual(false);
    }
  }, [initialRisk, nextCode, assets]);

  if (!isOpen) return null;

  const currentScore = probability * impact;
  const currentLevel = calculateRiskLevel(currentScore);

  const residualScore = hasResidual ? residualProbability * residualImpact : undefined;
  const residualLevel = residualScore ? calculateRiskLevel(residualScore) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialRisk?.id,
      code,
      title: title.trim(),
      description: description.trim(),
      assetId,
      threat: threat.trim(),
      vulnerability: vulnerability.trim(),
      owner: owner.trim(),
      probability,
      impact,
      score: currentScore,
      level: currentLevel,
      strategy,
      treatmentNotes: treatmentNotes.trim(),
      status,
      residualProbability: hasResidual ? residualProbability : undefined,
      residualImpact: hasResidual ? residualImpact : undefined,
      residualScore,
      residualLevel
    });
  };

  const getLevelBadgeClass = (lvl: string) => {
    switch (lvl) {
      case 'Critique': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Élevé': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
        
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialRisk ? `Modifier le risque ${initialRisk.code}` : 'Créer un nouveau risque GRC'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Évaluation rigoureuse conforme aux exigences EF-03 et EF-04
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code identifiant *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Actif informationnel concerné (EF-02) *
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.category} · {a.criticality})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intitulé du risque *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Accès non autorisé à la base de données clients"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description détaillée du scénario
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliciter les conséquences métier pour la PME..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Menace & Vulnérabilité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Menace identifiée
              </label>
              <input
                type="text"
                value={threat}
                onChange={(e) => setThreat(e.target.value)}
                placeholder="Ex. Attaque force brute, panne réseau, fuite interne"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vulnérabilité exploitée
              </label>
              <input
                type="text"
                value={vulnerability}
                onChange={(e) => setVulnerability(e.target.value)}
                placeholder="Ex. Absence de MFA, mot de passe faible, défaut de patch"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bloc d'évaluation : Probabilité & Impact (EF-04) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#0B3B7B]" />
                Évaluation du Risque Brut (Score = P × I)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Score calculé :</span>
                <span className="text-sm font-extrabold font-mono tabular-nums text-slate-900">
                  {currentScore} / 25
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getLevelBadgeClass(currentLevel)}`}>
                  {currentLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Probabilité (1 à 5)</span>
                  <span className="font-mono font-bold text-[#0B3B7B]">{probability}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={probability}
                  onChange={(e) => setProbability(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0B3B7B]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1. Exceptionnelle</span>
                  <span>3. Annuelle</span>
                  <span>5. Hebdomadaire</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Impact (1 à 5)</span>
                  <span className="font-mono font-bold text-[#0B3B7B]">{impact}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0B3B7B]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1. Négligeable</span>
                  <span>3. Modéré</span>
                  <span>5. Critique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stratégie, Responsable & Statut (EF-05) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stratégie de traitement
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as RiskStrategy)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none capitalize"
              >
                <option value="réduire">Réduire (Mesures correctives)</option>
                <option value="accepter">Accepter (Risque résiduel toléré)</option>
                <option value="transférer">Transférer (Assurance, tiers)</option>
                <option value="éviter">Éviter (Suppression de l'activité)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable du risque
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Ex. Abdoul Salam Issifi"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut opérationnel
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RiskStatus)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="ouvert">Ouvert (Non traité)</option>
                <option value="sous_contrôle">Sous contrôle (Plan en cours)</option>
                <option value="clôturé">Clôturé (Maîtrisé / Accepté)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mesures de traitement prévues & Justification
            </label>
            <input
              type="text"
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="Ex. Déploiement obligatoire de la MFA, restriction des accès réseau..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Section Risque Résiduel Optionnel */}
          <div className="border-t border-slate-200 pt-3">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasResidual}
                onChange={(e) => setHasResidual(e.target.checked)}
                className="rounded text-[#0B3B7B] focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-800">
                Définir l’évaluation du risque résiduel (après mesures de traitement)
              </span>
            </label>

            {hasResidual && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Probabilité résiduelle</span>
                    <span className="font-mono font-bold text-slate-800">{residualProbability}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={residualProbability}
                    onChange={(e) => setResidualProbability(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Impact résiduel</span>
                    <span className="font-mono font-bold text-slate-800">{residualImpact}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={residualImpact}
                    onChange={(e) => setResidualImpact(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="sm:col-span-2 text-xs flex justify-between items-center pt-1 border-t border-slate-200 text-slate-600">
                  <span>Score résiduel estimé : <strong className="font-mono text-slate-900">{residualScore}</strong></span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getLevelBadgeClass(residualLevel || 'Faible')}`}>
                    Niveau résiduel : {residualLevel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Boutons Footer */}
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
              className="px-4 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
            >
              {initialRisk ? 'Enregistrer les modifications' : 'Créer le risque'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
