import React, { useState, useMemo } from 'react';
import { 
  ListTodo, 
  Plus, 
  Search, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  ShieldCheck, 
  FileCheck2,
  Calendar
} from 'lucide-react';
import { CorrectiveAction, ActionPriority, ActionStatus, Risk, SoAControl } from '../../types/grc';
import { exportActionsToCSV } from '../../services/storage';

interface ActionsViewProps {
  actions: CorrectiveAction[];
  risks: Risk[];
  soa: SoAControl[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (action: CorrectiveAction) => void;
  onQuickCloseAction: (actionId: string, proof: string) => void;
}

export const ActionsView: React.FC<ActionsViewProps> = ({
  actions,
  risks,
  soa,
  onOpenCreateModal,
  onOpenEditModal,
  onQuickCloseAction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Statistiques
  const overdueCount = actions.filter(a => a.status === 'en_retard').length;
  const inProgressCount = actions.filter(a => a.status === 'en_cours').length;
  const todoCount = actions.filter(a => a.status === 'a_faire').length;
  const closedCount = actions.filter(a => a.status === 'cloturee').length;
  const closureRate = actions.length > 0 ? Math.round((closedCount / actions.length) * 100) : 0;

  // Filtrage
  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusTab === 'all' || a.status === statusTab;
      const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;
      const matchesSource = sourceFilter === 'all' || a.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesSource;
    });
  }, [actions, searchQuery, statusTab, priorityFilter, sourceFilter]);

  const getPriorityBadge = (p: ActionPriority) => {
    switch (p) {
      case 'Critique':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Critique</span>;
      case 'Haute':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Haute</span>;
      case 'Moyenne':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Moyenne</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">Basse</span>;
    }
  };

  const getStatusBadge = (s: ActionStatus) => {
    switch (s) {
      case 'cloturee':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Clôturée</span>
          </span>
        );
      case 'en_retard':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>En retard</span>
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>En cours</span>
          </span>
        );
      case 'a_faire':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <span>À faire</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    exportActionsToCSV(actions);
  };

  return (
    <div className="space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Plan d’Actions Correctives & Remédiation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="Exporter le plan d'actions (EF-10)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Action</span>
          </button>
        </div>
      </div>

      {/* Cartes Synthétiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Actions totales</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {actions.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Toutes catégories</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">En cours de traitement</span>
          <div className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums mt-1">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Déploiement actif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Actions en retard (EF-08)</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums mt-1">
            {overdueCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">Échéance dépassée</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Taux de clôture</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
            {closureRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{closedCount} action(s) validée(s)</span>
        </div>
      </div>

      {/* Onglets de Statut & Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        
        {/* Segmented control des statuts */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'all', label: 'Toutes les actions', count: actions.length },
            { id: 'en_retard', label: 'En retard', count: overdueCount },
            { id: 'en_cours', label: 'En cours', count: inProgressCount },
            { id: 'a_faire', label: 'À faire', count: todoCount },
            { id: 'cloturee', label: 'Clôturées avec preuve', count: closedCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                statusTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                tab.id === 'en_retard' && tab.count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filtres secondaires */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-1">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une action, responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Toutes priorités</option>
              <option value="Critique">Critique</option>
              <option value="Haute">Haute</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Basse">Basse</option>
            </select>

            {/* Origine */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Toutes origines</option>
              <option value="risque">Liée à un Risque</option>
              <option value="soa_ecart">Liée à un Écart SoA</option>
              <option value="audit_interne">Recommandation audit</option>
            </select>
          </div>
        </div>

      </div>

      {/* Tableau des Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ListTodo className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucune action trouvée</p>
            <p className="text-xs text-slate-400">Modifiez vos critères de recherche ou créez une nouvelle action.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Action Corrective & Contexte</th>
                  <th className="py-3 px-3">Origine</th>
                  <th className="py-3 px-3">Priorité</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-3">Échéance</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4">Preuve de clôture</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.map((action) => {
                  const linkedRisk = risks.find(r => r.id === action.linkedRiskId);
                  const isLate = action.status === 'en_retard' || (action.dueDate < todayStr && action.status !== 'cloturee');

                  return (
                    <tr 
                      key={action.id}
                      onClick={() => onOpenEditModal(action)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${isLate ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {action.code}
                      </td>

                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="font-semibold text-slate-900">{action.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {action.description}
                        </p>
                        {linkedRisk && (
                          <div className="text-[10px] text-[#0B3B7B] font-mono mt-0.5">
                            Lié au risque : {linkedRisk.code} ({linkedRisk.title})
                          </div>
                        )}
                        {action.linkedControlCode && (
                          <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                            Mesure SoA : {action.linkedControlCode}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {action.source.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getPriorityBadge(action.priority)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {action.owner}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap font-mono tabular-nums">
                        <div className={`flex items-center gap-1 ${isLate ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{action.dueDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(action.status)}
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px]">
                        {action.evidenceOfClosure ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded truncate" title={action.evidenceOfClosure}>
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{action.evidenceOfClosure}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">En attente de preuve</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {action.status !== 'cloturee' && (
                          <button
                            onClick={() => {
                              const proof = window.prompt('Renseignez la preuve matérielle de clôture pour valider cette action :');
                              if (proof && proof.trim()) {
                                onQuickCloseAction(action.id, proof.trim());
                              }
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition"
                            title="Clôturer avec preuve"
                          >
                            Clôturer
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEditModal(action)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                          title="Modifier l'action"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
