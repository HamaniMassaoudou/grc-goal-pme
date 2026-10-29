import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Risk, Asset, RiskLevel, RiskStatus } from '../../types/grc';
import { exportRisksToCSV } from '../../services/storage';

interface RisksViewProps {
  risks: Risk[];
  assets: Asset[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (risk: Risk) => void;
  onSelectRisk: (risk: Risk) => void;
}

export const RisksView: React.FC<RisksViewProps> = ({
  risks,
  assets,
  onOpenCreateModal,
  onOpenEditModal,
  onSelectRisk
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'code' | 'title'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrage combiné EF-09
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.threat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vulnerability.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = levelFilter === 'all' || r.level === levelFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesAsset = assetFilter === 'all' || r.assetId === assetFilter;

      return matchesSearch && matchesLevel && matchesStatus && matchesAsset;
    }).sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }
      if (sortBy === 'code') {
        return sortOrder === 'desc' ? b.code.localeCompare(a.code) : a.code.localeCompare(b.code);
      }
      return sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
    });
  }, [risks, searchQuery, levelFilter, statusFilter, assetFilter, sortBy, sortOrder]);

  const getLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critique':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Critique</span>;
      case 'Élevé':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Élevé</span>;
      case 'Moyen':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Moyen</span>;
      case 'Faible':
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Faible</span>;
    }
  };

  const getStatusBadge = (status: RiskStatus) => {
    switch (status) {
      case 'ouvert':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Ouvert</span>;
      case 'sous_contrôle':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Sous contrôle</span>;
      case 'clôturé':
        return <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Clôturé</span>;
    }
  };

  const handleExportCSV = () => {
    exportRisksToCSV(risks, assets);
  };

  return (
    <div className="space-y-5">
      
      {/* En-tête du registre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Registre des Risques de Sécurité
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="Exporter le registre en fichier CSV (EF-10)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Risque</span>
          </button>
        </div>
      </div>

      {/* Barre d'outils, Recherche & Filtres (EF-09) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Recherche textuelle */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, code, menace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filtres par boutons / sélecteurs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtre Niveau */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Tous niveaux</option>
              <option value="Critique">Critique (15-25)</option>
              <option value="Élevé">Élevé (8-14)</option>
              <option value="Moyen">Moyen (4-7)</option>
              <option value="Faible">Faible (1-3)</option>
            </select>

            {/* Filtre Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Tous statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="sous_contrôle">Sous contrôle</option>
              <option value="clôturé">Clôturé</option>
            </select>

            {/* Filtre Actif */}
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none max-w-[160px] truncate"
            >
              <option value="all">Tous actifs</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Tri */}
            <button
              onClick={() => {
                if (sortBy === 'score') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy('score');
                  setSortOrder('desc');
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
              title="Trier par Score de risque"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Score ({sortOrder === 'desc' ? '↓' : '↑'})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Tableau des Risques */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRisks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucun risque ne correspond aux filtres appliqués</p>
            <p className="text-xs text-slate-400">Modifiez votre recherche ou réinitialisez les critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Intitulé & Actif</th>
                  <th className="py-3 px-3 text-center">P</th>
                  <th className="py-3 px-3 text-center">I</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-4">Niveau</th>
                  <th className="py-3 px-4">Stratégie</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.map((risk) => {
                  const asset = assets.find(a => a.id === risk.assetId);

                  return (
                    <tr 
                      key={risk.id}
                      onClick={() => onSelectRisk(risk)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B3B7B]">
                        {risk.code}
                      </td>

                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-semibold text-slate-900 line-clamp-1">{risk.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{asset?.name || 'Actif non rattaché'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {risk.probability}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {risk.impact}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold tabular-nums text-slate-900">
                        {risk.score}
                      </td>

                      <td className="py-3.5 px-4">
                        {getLevelBadge(risk.level)}
                      </td>

                      <td className="py-3.5 px-4 capitalize text-slate-700">
                        {risk.strategy}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[120px]">
                        {risk.owner}
                      </td>

                      <td className="py-3.5 px-3">
                        {getStatusBadge(risk.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectRisk(risk)}
                          className="p-1.5 text-slate-400 hover:text-[#0B3B7B] hover:bg-slate-100 rounded transition"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(risk)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                          title="Modifier"
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
