import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Database, 
  Laptop, 
  Server, 
  Globe, 
  FileText, 
  Workflow, 
  ShieldAlert,
  Edit3,
  MapPin,
  User
} from 'lucide-react';
import { Asset, Risk, AssetCategory } from '../../types/grc';

interface AssetsViewProps {
  assets: Asset[];
  risks: Risk[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (asset: Asset) => void;
  onFilterRisksByAsset: (assetId: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  risks,
  onOpenCreateModal,
  onOpenEditModal,
  onFilterRisksByAsset
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'database': return <Database className="w-4 h-4 text-blue-600" />;
      case 'application': return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'server': return <Server className="w-4 h-4 text-purple-600" />;
      case 'service': return <Globe className="w-4 h-4 text-emerald-600" />;
      case 'document': return <FileText className="w-4 h-4 text-amber-600" />;
      case 'hardware': return <Laptop className="w-4 h-4 text-slate-600" />;
      case 'process': return <Workflow className="w-4 h-4 text-orange-600" />;
    }
  };

  const getCriticalityBadge = (crit: string) => {
    switch (crit) {
      case 'Critique':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Critique</span>;
      case 'Élevée':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Élevée</span>;
      case 'Moyenne':
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Moyenne</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">Faible</span>;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Cartographie & Inventaire des Actifs
          </h1>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Actif</span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un actif, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none capitalize"
          >
            <option value="all">Toutes les catégories</option>
            <option value="database">Base de données</option>
            <option value="application">Application</option>
            <option value="server">Serveur</option>
            <option value="service">Service réseau</option>
            <option value="hardware">Matériel</option>
            <option value="document">Document</option>
            <option value="process">Processus</option>
          </select>
        </div>
      </div>

      {/* Grille des Actifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const mappedRisks = risks.filter(r => r.assetId === asset.id);
          const criticalRisks = mappedRisks.filter(r => r.level === 'Critique' || r.level === 'Élevé');

          return (
            <div 
              key={asset.id} 
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider capitalize">
                        {asset.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {asset.name}
                      </h3>
                    </div>
                  </div>
                  <div>
                    {getCriticalityBadge(asset.criticality)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {asset.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Resp : <strong className="text-slate-700">{asset.owner}</strong></span>
                  </div>
                  {asset.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pied de carte avec risques rattachés */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onFilterRisksByAsset(asset.id)}
                  className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-[#0B3B7B]"
                  title="Voir les risques liés à cet actif"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#0B3B7B]" />
                  <span>
                    <strong className="font-mono tabular-nums">{mappedRisks.length}</strong> risque(s) lié(s)
                  </span>
                  {criticalRisks.length > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded">
                      {criticalRisks.length} critiques
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onOpenEditModal(asset)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-50 transition"
                  title="Modifier l'actif"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
