import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  FileCheck2, 
  ShieldCheck
} from 'lucide-react';
import { Risk, CorrectiveAction, SoAControl, Asset, Organization } from '../../types/grc';
import { RiskMatrix } from './RiskMatrix';
import { calculateRiskLevel } from '../../services/storage';

interface DashboardViewProps {
  organization: Organization;
  risks: Risk[];
  actions: CorrectiveAction[];
  soa: SoAControl[];
  assets: Asset[];
  onNavigate: (module: string) => void;
  onSelectRisk: (risk: Risk) => void;
  onOpenTestScenario: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  organization,
  risks,
  actions,
  soa,
  assets,
  onNavigate,
  onSelectRisk,
  onOpenTestScenario
}) => {
  // Calculs conformes à EF-08 (Tableau de bord)
  const openRisks = risks.filter(r => r.status !== 'clôturé');
  const criticalAndHighRisks = openRisks.filter(r => r.level === 'Critique' || r.level === 'Élevé');
  
  const criticalCount = openRisks.filter(r => r.level === 'Critique').length;
  const highCount = openRisks.filter(r => r.level === 'Élevé').length;
  const mediumCount = openRisks.filter(r => r.level === 'Moyen').length;
  const lowCount = openRisks.filter(r => r.level === 'Faible').length;

  const openActions = actions.filter(a => a.status !== 'cloturee' && a.status !== 'rejetee');
  const overdueActions = actions.filter(a => a.status === 'en_retard');
  const closedActions = actions.filter(a => a.status === 'cloturee');
  const actionClosureRate = actions.length > 0 ? Math.round((closedActions.length / actions.length) * 100) : 0;

  const applicableControls = soa.filter(c => c.isApplicable);
  const implementedControls = applicableControls.filter(c => c.implementationStatus === 'mis_en_oeuvre');
  const partiallyImplemented = applicableControls.filter(c => c.implementationStatus === 'partiellement_mis_en_oeuvre');
  const plannedControls = applicableControls.filter(c => c.implementationStatus === 'planifie');
  const notStartedControls = applicableControls.filter(c => c.implementationStatus === 'non_commence');
  
  const soaImplementationRate = applicableControls.length > 0 
    ? Math.round((implementedControls.length / applicableControls.length) * 100) 
    : 0;

  // Répartition par domaine ISO/IEC 27001:2022
  const domains = [
    { code: 'A.5', name: 'Organisationnels', full: 'A.5 Contrôles organisationnels' },
    { code: 'A.6', name: 'Personnes', full: 'A.6 Contrôles relatifs aux personnes' },
    { code: 'A.7', name: 'Physiques', full: 'A.7 Contrôles physiques' },
    { code: 'A.8', name: 'Technologiques', full: 'A.8 Contrôles technologiques' }
  ];

  return (
    <div className="space-y-6">
      
      {/* En-tête du tableau de bord avec contexte PME */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Tableau de Bord GRC & Conformité
          </h1>
        </div>

        {/* Bouton d'action directe vers le testeur */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('risks')}
            className="px-3.5 py-2 text-xs font-semibold text-[#0B3B7B] bg-blue-50 border border-blue-200/80 rounded-lg hover:bg-blue-100/70 transition shadow-xs whitespace-nowrap"
          >
            + Nouveau Risque
          </button>
          <button
            onClick={() => onNavigate('actions')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B3B7B] rounded-lg hover:bg-[#082d5e] transition shadow-xs whitespace-nowrap"
          >
            + Nouvelle Action
          </button>
        </div>
      </div>


      {/* Grille des 4 indicateurs fondamentaux EF-08 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Risques ouverts & critiques */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Risques ouverts</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {openRisks.length}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                dont {criticalAndHighRisks.length} critiques & élevés
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
              <span>{criticalCount} critiques</span>
              <span>·</span>
              <span>{highCount} élevés</span>
              <span>·</span>
              <span>{mediumCount} moyens</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Actions et retard */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Actions correctives</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {openActions.length}
              </span>
              {overdueActions.length > 0 ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                  {overdueActions.length} en retard
                </span>
              ) : (
                <span className="text-xs text-emerald-600 font-medium">À jour</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Taux de clôture : <strong className="text-slate-800 font-mono tabular-nums">{actionClosureRate}%</strong> ({closedActions.length}/{actions.length})
            </p>
          </div>
        </div>

        {/* KPI 3 : SoA ISO 27001:2022 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Conformité SoA ISO 27001</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#0B3B7B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0B3B7B] font-mono tabular-nums">
                {soaImplementationRate}%
              </span>
              <span className="text-xs text-slate-500">
                mesures appliquées
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-2" 
                style={{ width: `${(implementedControls.length / applicableControls.length) * 100}%` }}
                title={`${implementedControls.length} mis en œuvre`}
              />
              <div 
                className="bg-blue-400 h-2" 
                style={{ width: `${(partiallyImplemented.length / applicableControls.length) * 100}%` }}
                title={`${partiallyImplemented.length} partiellement mis en œuvre`}
              />
              <div 
                className="bg-amber-300 h-2" 
                style={{ width: `${(plannedControls.length / applicableControls.length) * 100}%` }}
                title={`${plannedControls.length} planifiés`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>{implementedControls.length} appliqués</span>
              <span>{notStartedControls.length} non commencés</span>
            </p>
          </div>
        </div>

        {/* KPI 4 : Périmètre & Actifs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Actifs cartographiés</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {assets.length}
              </span>
              <span className="text-xs text-slate-500">
                actifs répertoriés
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Organisation : <strong className="text-slate-800">{organization.name}</strong> ({organization.size})
            </p>
          </div>
        </div>

      </div>

      {/* Section Centrale : Matrice 5x5 et Synthèse ISO 27001 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Matrice 5x5 interactive */}
        <div className="lg:col-span-8">
          <RiskMatrix risks={risks} onSelectRisk={onSelectRisk} />
        </div>

        {/* Couverture des 4 thèmes de l'Annexe A ISO 27001:2022 */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Couverture ISO/IEC 27001:2022
            </h3>
            <button
              onClick={() => onNavigate('soa')}
              className="text-xs text-[#0B3B7B] hover:underline font-medium"
            >
              Voir la SoA →
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Progression des 93 mesures par grand domaine de sécurité
          </p>

          <div className="space-y-3.5 pt-1">
            {domains.map((dom) => {
              const domControls = soa.filter(c => c.domain === dom.full);
              const domApplicable = domControls.filter(c => c.isApplicable);
              const domDone = domApplicable.filter(c => c.implementationStatus === 'mis_en_oeuvre').length;
              const domPartial = domApplicable.filter(c => c.implementationStatus === 'partiellement_mis_en_oeuvre').length;
              const domPct = domApplicable.length > 0 ? Math.round(((domDone + domPartial * 0.5) / domApplicable.length) * 100) : 0;

              return (
                <div key={dom.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {dom.code} · {dom.name}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums text-[11px]">
                      {domDone}/{domApplicable.length} mis en œuvre ({domPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#0B3B7B] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${domPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Mesures totales au catalogue :</span>
              <strong className="font-mono tabular-nums text-slate-800">93</strong>
            </div>
            <div className="flex justify-between">
              <span>Mesures déclarées applicables :</span>
              <strong className="font-mono tabular-nums text-slate-800">{applicableControls.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Mesures exclues avec justification :</span>
              <strong className="font-mono tabular-nums text-slate-800">{soa.length - applicableControls.length}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Section Inférieure : Alertes & Workflow « Écart → Action → Preuve » */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Risques Prioritaires */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Risques prioritaires nécessitant un traitement
              </h3>
            </div>
            <button
              onClick={() => onNavigate('risks')}
              className="text-xs text-[#0B3B7B] hover:underline font-medium"
            >
              Tous les risques ({risks.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {criticalAndHighRisks.slice(0, 4).map((r) => {
              const asset = assets.find(a => a.id === r.assetId);
              return (
                <div 
                  key={r.id}
                  onClick={() => onSelectRisk(r)}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 cursor-pointer rounded px-2 transition -mx-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B3B7B]">{r.code}</span>
                      <span className="text-xs font-semibold text-slate-900 truncate">{r.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Actif : {asset?.name || 'Général'} · Resp : {r.owner}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono tabular-nums ${
                      r.level === 'Critique' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Score {r.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow des actions & Traitement des écarts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Suivi des actions correctives & Remédiation
              </h3>
            </div>
            <button
              onClick={() => onNavigate('actions')}
              className="text-xs text-[#0B3B7B] hover:underline font-medium"
            >
              Voir le plan ({actions.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {actions.slice(0, 4).map((a) => (
              <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{a.code}</span>
                    <span className="text-xs font-semibold text-slate-900 truncate">{a.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Resp : {a.owner} · Échéance : {a.dueDate}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    a.status === 'en_retard' ? 'bg-rose-100 text-rose-700' :
                    a.status === 'cloturee' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {a.status === 'en_retard' ? 'En retard' :
                     a.status === 'cloturee' ? 'Clôturée' :
                     a.status === 'en_cours' ? 'En cours' : 'À faire'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
