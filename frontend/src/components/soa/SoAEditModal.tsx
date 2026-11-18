import React, { useState, useEffect } from 'react';
import { X, CheckSquare, ShieldCheck, ArrowRight, PlusCircle, FileText } from 'lucide-react';
import { SoAControl, ImplementationStatus } from '../../types/grc';
import { EvidenceManager } from '../common/EvidenceManager';

interface SoAEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: SoAControl | null;
  onSave: (updatedControl: SoAControl) => void;
  onCreateActionForGap: (control: SoAControl) => void;
}

export const SoAEditModal: React.FC<SoAEditModalProps> = ({
  isOpen,
  onClose,
  control,
  onSave,
  onCreateActionForGap
}) => {
  const [isApplicable, setIsApplicable] = useState(true);
  const [justification, setJustification] = useState('');
  const [implementationStatus, setImplementationStatus] = useState<ImplementationStatus>('partiellement_mis_en_oeuvre');
  const [maturityLevel, setMaturityLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [evidenceRef, setEvidenceRef] = useState('');
  const [gapDescription, setGapDescription] = useState('');
  const [reviewedBy, setReviewedBy] = useState('Hamani Massaoudou');

  useEffect(() => {
    if (control) {
      setIsApplicable(control.isApplicable);
      setJustification(control.justification || '');
      setImplementationStatus(control.implementationStatus);
      setMaturityLevel(control.maturityLevel);
      setEvidenceRef(control.evidenceRef || '');
      setGapDescription(control.gapDescription || '');
      setReviewedBy(control.reviewedBy || 'Hamani Massaoudou');
    }
  }, [control]);

  if (!isOpen || !control) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...control,
      isApplicable,
      justification: justification.trim(),
      implementationStatus: isApplicable ? implementationStatus : 'non_applicable',
      maturityLevel: isApplicable ? maturityLevel : 1,
      evidenceRef: evidenceRef.trim(),
      gapDescription: gapDescription.trim(),
      reviewedBy: reviewedBy.trim(),
      lastReviewDate: new Date().toISOString().slice(0, 10)
    });
  };

  const maturityLabels: Record<number, string> = {
    1: '1. Initial / Ad-hoc (Pratique informelle)',
    2: '2. Reproductible (Habitude observée mais peu formalisée)',
    3: '3. Défini / Documenté (Procédure écrite et approuvée)',
    4: '4. Maîtrisé & Mesuré (Contrôle d’efficacité régulier)',
    5: '5. Optimisé (Amélioration continue proactive)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded bg-blue-50 text-[#0B3B7B] border border-blue-200">
              {control.code}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {control.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {control.domain} · ISO/IEC 27001:2022
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire SoA (EF-07) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Rappel de la description de la mesure */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">Objectif de la mesure normative :</span>
            {control.description}
          </div>

          {/* Applicabilité (Oui / Non) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Applicabilité de la mesure au périmètre PME (EF-07)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="applicability"
                  checked={isApplicable}
                  onChange={() => {
                    setIsApplicable(true);
                    if (implementationStatus === 'non_applicable') {
                      setImplementationStatus('partiellement_mis_en_oeuvre');
                    }
                  }}
                  className="text-[#0B3B7B] focus:ring-0"
                />
                <span className="text-emerald-700 font-bold">Applicable</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="applicability"
                  checked={!isApplicable}
                  onChange={() => {
                    setIsApplicable(false);
                    setImplementationStatus('non_applicable');
                  }}
                  className="text-slate-600 focus:ring-0"
                />
                <span className="text-slate-600">Non applicable (Exclusion justifiée)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isApplicable ? 'Justification de l’inclusion *' : 'Motif légitime d’exclusion *'}
              </label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={isApplicable ? 'Pourquoi cette mesure est essentielle au métier de la PME...' : 'Explication formelle de l’absence d’exposition ou d’activité correspondante...'}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {isApplicable && (
            <>
              {/* Statut de mise en œuvre & Maturité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    État de mise en œuvre
                  </label>
                  <select
                    value={implementationStatus}
                    onChange={(e) => setImplementationStatus(e.target.value as ImplementationStatus)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="mis_en_oeuvre">Mis en œuvre (Conforme)</option>
                    <option value="partiellement_mis_en_oeuvre">Partiellement mis en œuvre</option>
                    <option value="planifie">Planifié</option>
                    <option value="non_commence">Non commencé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niveau de maturité (1 à 5)
                  </label>
                  <select
                    value={maturityLevel}
                    onChange={(e) => setMaturityLevel(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {maturityLabels[lvl]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preuve & Référence documentaire */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preuve ou référence documentaire vérifiable (EF-07)
                </label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="Ex. Capture d'écran console MFA, PV de test restauration, POL-SEC-01..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Coffre-fort de preuves numériques scellées SHA-256 */}
              <EvidenceManager
                linkedType="soa_control"
                linkedId={control.code}
                titleContext={`Mesure ${control.code}`}
                organizationId={control.organizationId}
                onEvidenceChange={() => {
                  if (!evidenceRef) {
                    setEvidenceRef(`Preuve scellée SHA-256 pour ${control.code}`);
                  }
                }}
              />

              {/* Écart constaté (Gap Analysis) */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-orange-900">
                    Écart restant constaté (Gap analysis)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      handleSubmit({ preventDefault: () => {} } as any);
                      onCreateActionForGap(control);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#F25C05] hover:bg-[#d94f00] rounded-md transition shadow-xs"
                    title="Déclencher une action corrective immédiate"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Créer une action liée à cet écart</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={gapDescription}
                  onChange={(e) => setGapDescription(e.target.value)}
                  placeholder="Décrire ce qui manque pour atteindre une pleine conformité..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-orange-300 bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Réviseur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auditeur / Réviseur
              </label>
              <input
                type="text"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de révision
              </label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString('fr-FR')}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
              />
            </div>
          </div>

          {/* Boutons Actions */}
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
              Enregistrer la mesure SoA
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
