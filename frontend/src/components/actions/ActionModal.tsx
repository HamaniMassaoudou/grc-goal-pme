import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';
import { CorrectiveAction, ActionPriority, ActionStatus, Risk, SoAControl } from '../../types/grc';
import { EvidenceManager } from '../common/EvidenceManager';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (actionData: Partial<CorrectiveAction>) => void;
  initialAction?: CorrectiveAction | null;
  risks: Risk[];
  soa: SoAControl[];
  nextCode: string;
  defaultSource?: 'risque' | 'soa_ecart' | 'audit_interne';
  defaultLinkedRiskId?: string;
  defaultLinkedControlCode?: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAction,
  risks,
  soa,
  nextCode,
  defaultSource = 'risque',
  defaultLinkedRiskId,
  defaultLinkedControlCode,
  defaultTitle = '',
  defaultDescription = ''
}) => {
  const [code, setCode] = useState(nextCode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<'risque' | 'soa_ecart' | 'audit_interne'>('risque');
  const [linkedRiskId, setLinkedRiskId] = useState<string>('');
  const [linkedControlCode, setLinkedControlCode] = useState<string>('');
  const [owner, setOwner] = useState('Hamani Massaoudou');
  const [priority, setPriority] = useState<ActionPriority>('Haute');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [status, setStatus] = useState<ActionStatus>('a_faire');
  const [evidenceOfClosure, setEvidenceOfClosure] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (initialAction) {
      setCode(initialAction.code);
      setTitle(initialAction.title);
      setDescription(initialAction.description);
      setSource(initialAction.source);
      setLinkedRiskId(initialAction.linkedRiskId || '');
      setLinkedControlCode(initialAction.linkedControlCode || '');
      setOwner(initialAction.owner);
      setPriority(initialAction.priority);
      setDueDate(initialAction.dueDate);
      setStatus(initialAction.status);
      setEvidenceOfClosure(initialAction.evidenceOfClosure || '');
      setNewComment('');
    } else {
      setCode(nextCode);
      setTitle(defaultTitle);
      setDescription(defaultDescription);
      setSource(defaultSource);
      setLinkedRiskId(defaultLinkedRiskId || (risks[0]?.id || ''));
      setLinkedControlCode(defaultLinkedControlCode || (soa[0]?.code || ''));
      setOwner('Abdoul Salam Issifi');
      setPriority('Haute');
      setDueDate('2026-11-15');
      setStatus('a_faire');
      setEvidenceOfClosure('');
      setNewComment('');
    }
  }, [initialAction, nextCode, defaultSource, defaultLinkedRiskId, defaultLinkedControlCode, defaultTitle, defaultDescription, risks, soa]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedComments = initialAction?.comments ? [...initialAction.comments] : [];
    if (newComment.trim()) {
      updatedComments.push({
        id: `c-${Date.now()}`,
        author: owner,
        date: new Date().toISOString().slice(0, 10),
        text: newComment.trim()
      });
    }

    onSave({
      id: initialAction?.id,
      code,
      title: title.trim(),
      description: description.trim(),
      source,
      linkedRiskId: source === 'risque' ? linkedRiskId : undefined,
      linkedControlCode: source === 'soa_ecart' ? linkedControlCode : undefined,
      owner: owner.trim(),
      priority,
      dueDate,
      status,
      evidenceOfClosure: evidenceOfClosure.trim(),
      comments: updatedComments,
      closedAt: status === 'cloturee' ? (initialAction?.closedAt || new Date().toISOString().slice(0, 10)) : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialAction ? `Action corrective ${initialAction.code}` : 'Créer une action corrective GRC'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Workflow « Écart / Risque → Action → Preuve → Clôture » (EF-05)
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
                Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Origine de l'action
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="risque">Traitement d'un Risque</option>
                <option value="soa_ecart">Comblement d'un Écart SoA</option>
                <option value="audit_interne">Recommandation d'audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionPriority)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Critique">Critique (Urgent)</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
          </div>

          {/* Liaison conditionnelle */}
          {source === 'risque' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Risque associé dans le registre
              </label>
              <select
                value={linkedRiskId}
                onChange={(e) => setLinkedRiskId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                {risks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} — {r.title} (Niveau {r.level})
                  </option>
                ))}
              </select>
            </div>
          )}

          {source === 'soa_ecart' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mesure SoA ISO 27001 concernée par l'écart
              </label>
              <select
                value={linkedControlCode}
                onChange={(e) => setLinkedControlCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                {soa.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intitulé de l'action corrective *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Activer l’authentification multifacteur (MFA) sur tous les accès console"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description de la démarche de remédiation
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Modalités pratiques, intervenants nécessaires, étapes clés..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable de l'action
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'échéance cible
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActionStatus)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="en_retard">En retard</option>
                <option value="cloturee">Clôturée (Réalisée)</option>
                <option value="rejetee">Rejetée / Annulée</option>
              </select>
            </div>
          </div>

          {/* Preuve de clôture (Exigence centrale du cahier des charges : « écart → action → preuve → clôture ») */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <label className="text-xs font-bold text-emerald-900">
                Preuve matérielle de clôture / Validation de l’action
              </label>
            </div>
            <p className="text-[11px] text-emerald-800">
              Pour valider la clôture de l'action, renseignez la référence vérifiable (procès-verbal, journal d'audit, capture d'écran, ticket de recette).
            </p>
            <input
              type="text"
              value={evidenceOfClosure}
              onChange={(e) => setEvidenceOfClosure(e.target.value)}
              placeholder="Ex. Procès-verbal de test PV-RESTORE-2026-10-18.pdf ou capture console validée..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white focus:border-emerald-500 focus:outline-none"
            />

            {/* Coffre-fort de preuves numériques scellées */}
            {initialAction?.id && (
              <div className="pt-2">
                <EvidenceManager
                  linkedType="corrective_action"
                  linkedId={initialAction.id}
                  titleContext={`Action ${initialAction.code}`}
                  organizationId={initialAction.organizationId}
                  onEvidenceChange={() => {
                    if (!evidenceOfClosure) {
                      setEvidenceOfClosure(`Preuve scellée SHA-256 attachée`);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Nouveau commentaire / note de suivi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ajouter une note de suivi ou commentaire
            </label>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Point d'étape, avancement, blocage temporaire..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Historique des commentaires */}
          {initialAction && initialAction.comments.length > 0 && (
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Historique des échanges ({initialAction.comments.length})
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {initialAction.comments.map(c => (
                  <div key={c.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="text-slate-800 mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {initialAction ? 'Mettre à jour l’action' : 'Enregistrer l’action'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
