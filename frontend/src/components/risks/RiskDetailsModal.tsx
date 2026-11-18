import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  FileCheck, 
  Plus, 
  User, 
  Calendar,
  CheckCircle,
  AlertOctagon
} from 'lucide-react';
import { Risk, Asset, CorrectiveAction } from '../../types/grc';
import { calculateRiskLevel } from '../../services/storage';

interface RiskDetailsModalProps {
  risk: Risk | null;
  assets: Asset[];
  actions: CorrectiveAction[];
  onClose: () => void;
  onEdit: (risk: Risk) => void;
  onCreateActionForRisk: (risk: Risk) => void;
  onNavigateToAction: (actionId: string) => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({
  risk,
  assets,
  actions,
  onClose,
  onEdit,
  onCreateActionForRisk,
  onNavigateToAction
}) => {
  if (!risk) return null;

  const asset = assets.find(a => a.id === risk.assetId);
  const linkedActions = actions.filter(a => a.linkedRiskId === risk.id);

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
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold px-2 py-1 rounded bg-blue-50 text-[#0B3B7B] border border-blue-200">
              {risk.code}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {risk.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Créé le {risk.createdAt}</span>
                <span>·</span>
                <span>Resp : {risk.owner}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Comparatif Risque Brut vs Risque Résiduel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Risque Brut */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Évaluation Initiale (Brut)
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {risk.score}
                  </span>
                  <span className="text-xs text-slate-400 font-mono"> / 25</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getLevelBadgeClass(risk.level)}`}>
                  {risk.level}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600 flex justify-between">
                <span>Probabilité : P{risk.probability}/5</span>
                <span>Impact : I{risk.impact}/5</span>
              </div>
            </div>

            {/* Risque Résiduel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Risque Résiduel (Après traitement)
              </span>
              {risk.residualScore ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold font-mono text-emerald-600 tabular-nums">
                        {risk.residualScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono"> / 25</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getLevelBadgeClass(risk.residualLevel || 'Faible')}`}>
                      {risk.residualLevel}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600 flex justify-between">
                    <span>Probabilité résiduelle : P{risk.residualProbability}/5</span>
                    <span>Impact résiduel : I{risk.residualImpact}/5</span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400 italic">
                  Évaluation résiduelle non renseignée
                </div>
              )}
            </div>
          </div>

          {/* Description & Cartographie Actif */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Actif rattaché (EF-02)</span>
              {asset ? (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <Layers className="w-4 h-4 text-[#0B3B7B]" />
                  <span className="font-semibold text-slate-900">{asset.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 capitalize">Type : {asset.category}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">Criticité : {asset.criticality}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Aucun actif spécifique associé</span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Description</span>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {risk.description || 'Aucune description détaillée.'}
              </p>
            </div>

            {/* Menace & Vulnérabilité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Menace identifiée</span>
                <p className="text-xs text-slate-800 font-medium mt-0.5">{risk.threat || 'Non renseignée'}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Vulnérabilité exploitée</span>
                <p className="text-xs text-slate-800 font-medium mt-0.5">{risk.vulnerability || 'Non renseignée'}</p>
              </div>
            </div>

            {/* Stratégie de traitement */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Stratégie adoptée : <strong className="capitalize text-slate-900 font-bold">{risk.strategy}</strong>
                </span>
                <span className="text-xs text-slate-500">
                  Statut : <strong className="capitalize text-slate-900">{risk.status.replace('_', ' ')}</strong>
                </span>
              </div>
              {risk.treatmentNotes && (
                <p className="text-xs text-slate-700 pt-1 border-t border-slate-200/70">
                  {risk.treatmentNotes}
                </p>
              )}
            </div>
          </div>

          {/* Actions Correctives Associées (Workflow B14) */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Actions correctives associées ({linkedActions.length})
                </h4>
              </div>
              <button
                onClick={() => onCreateActionForRisk(risk)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3B7B] hover:text-[#072a5a] bg-blue-50 px-2 py-1 rounded border border-blue-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Associer une action</span>
              </button>
            </div>

            {linkedActions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Aucune action corrective n’est encore rattachée à ce risque. Cliquez ci-dessus pour en créer une.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {linkedActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => onNavigateToAction(action.id)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 cursor-pointer transition text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700">{action.code}</span>
                        <span className="font-semibold text-slate-900 truncate">{action.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Resp : {action.owner} · Échéance : {action.dueDate}
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      action.status === 'cloturee' ? 'bg-emerald-100 text-emerald-700' :
                      action.status === 'en_retard' ? 'bg-rose-100 text-rose-700' :
                      action.status === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {action.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <span className="text-[11px] text-slate-400">
            Dernière mise à jour : {risk.updatedAt}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(risk)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
