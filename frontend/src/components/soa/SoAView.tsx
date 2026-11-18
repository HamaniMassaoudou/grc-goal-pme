import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Search, 
  Download, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SoAControl, ImplementationStatus } from '../../types/grc';
import { exportSoAToCSV } from '../../services/storage';
import { exportOfficialSoAToPDF } from '../../services/pdfExport';

interface SoAViewProps {
  soa: SoAControl[];
  onEditControl: (control: SoAControl) => void;
  onCreateActionForGap: (control: SoAControl) => void;
  organizationName?: string;
  grcScope?: string;
}

export const SoAView: React.FC<SoAViewProps> = ({
  soa,
  onEditControl,
  onCreateActionForGap,
  organizationName = 'PME Démonstration (Sirba Communication SARL)',
  grcScope = "Système d'information, postes de travail, messagerie et base de données clients"
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applicabilityFilter, setApplicabilityFilter] = useState<'all' | 'applicable' | 'non_applicable'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Domaines normalisés ISO/IEC 27001:2022
  const domains = [
    { id: 'all', label: 'Toutes les mesures', count: 93 },
    { id: 'A.5', label: 'A.5 Organisationnels', count: 37 },
    { id: 'A.6', label: 'A.6 Personnes', count: 8 },
    { id: 'A.7', label: 'A.7 Physiques', count: 14 },
    { id: 'A.8', label: 'A.8 Technologiques', count: 34 }
  ];

  // Calculs synthétiques pour les indicateurs SoA
  const applicableList = soa.filter(c => c.isApplicable);
  const implementedList = applicableList.filter(c => c.implementationStatus === 'mis_en_oeuvre');
  const partialList = applicableList.filter(c => c.implementationStatus === 'partiellement_mis_en_oeuvre');
  const plannedList = applicableList.filter(c => c.implementationStatus === 'planifie');
  const notStartedList = applicableList.filter(c => c.implementationStatus === 'non_commence');
  const excludedList = soa.filter(c => !c.isApplicable);

  const globalRate = applicableList.length > 0 ? Math.round((implementedList.length / applicableList.length) * 100) : 0;

  // Filtrage combiné (EF-09)
  const filteredControls = useMemo(() => {
    return soa.filter((c) => {
      const matchesDomain = selectedDomain === 'all' || c.code.startsWith(selectedDomain);
      const matchesSearch = 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.justification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.evidenceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.gapDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesApplicability = 
        applicabilityFilter === 'all' ||
        (applicabilityFilter === 'applicable' && c.isApplicable) ||
        (applicabilityFilter === 'non_applicable' && !c.isApplicable);

      const matchesStatus = statusFilter === 'all' || c.implementationStatus === statusFilter;

      return matchesDomain && matchesSearch && matchesApplicability && matchesStatus;
    });
  }, [soa, selectedDomain, searchQuery, applicabilityFilter, statusFilter]);

  const getStatusBadge = (status: ImplementationStatus) => {
    switch (status) {
      case 'mis_en_oeuvre':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Mis en œuvre</span>
          </span>
        );
      case 'partiellement_mis_en_oeuvre':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Partiel</span>
          </span>
        );
      case 'planifie':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Planifié</span>
          </span>
        );
      case 'non_applicable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>Non applicable</span>
          </span>
        );
      case 'non_commence':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Non commencé</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    exportSoAToCSV(soa);
  };

  const handleExportOfficialPDF = () => {
    exportOfficialSoAToPDF({
      organizationName,
      grcScope,
      controls: soa,
      reviewerName: 'Hamani Massaoudou (RSSI)',
      approverName: 'Abdoul Salam Issifi (Gérant)',
      version: 'v1.0 (Audit Officiel 2026)',
      reviewDate: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="space-y-5">
      
      {/* En-tête de la SoA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            SoA Dynamique (Statement of Applicability)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOfficialPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0B3B7B] hover:bg-[#082a59] rounded-lg transition shadow-xs"
            title="Générer la Déclaration d'Applicabilité formelle ISO/IEC 27001:2022 pour l'auditeur"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Exporter SoA Officiel (PDF)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="Exporter la SoA complète en CSV (EF-10)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export SoA (CSV)</span>
          </button>
        </div>
      </div>

      {/* Cartes de synthèse de la SoA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Taux de conformité</span>
          <div className="text-xl font-extrabold text-[#0B3B7B] font-mono tabular-nums mt-0.5">
            {globalRate}%
          </div>
          <span className="text-[10px] text-slate-500">{implementedList.length}/{applicableList.length} appliqués</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Mesures applicables</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
            {applicableList.length}
          </div>
          <span className="text-[10px] text-slate-500">sur 93 au total</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Partiellement</span>
          <div className="text-xl font-extrabold text-blue-600 font-mono tabular-nums mt-0.5">
            {partialList.length}
          </div>
          <span className="text-[10px] text-slate-500">en déploiement</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Planifiés</span>
          <div className="text-xl font-extrabold text-amber-600 font-mono tabular-nums mt-0.5">
            {plannedList.length}
          </div>
          <span className="text-[10px] text-slate-500">budgétés/inscrits</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Non commencés</span>
          <div className="text-xl font-extrabold text-rose-600 font-mono tabular-nums mt-0.5">
            {notStartedList.length}
          </div>
          <span className="text-[10px] text-slate-500">à adresser</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Exclusions justifiées</span>
          <div className="text-xl font-extrabold text-slate-600 font-mono tabular-nums mt-0.5">
            {excludedList.length}
          </div>
          <span className="text-[10px] text-slate-500">non applicables</span>
        </div>
      </div>

      {/* Onglets des Domaines ISO 27001 (A.5, A.6, A.7, A.8) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-2 ${
              selectedDomain === d.id
                ? 'bg-[#0B3B7B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{d.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              selectedDomain === d.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {d.count}
            </span>
          </button>
        ))}
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par code (A.8.5), mot-clé (MFA, sauvegarde)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Applicabilité */}
          <select
            value={applicabilityFilter}
            onChange={(e) => setApplicabilityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Toutes applicabilités</option>
            <option value="applicable">Applicables ({applicableList.length})</option>
            <option value="non_applicable">Exclus ({excludedList.length})</option>
          </select>

          {/* Statut de mise en œuvre */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="mis_en_oeuvre">Mis en œuvre</option>
            <option value="partiellement_mis_en_oeuvre">Partiellement mis en œuvre</option>
            <option value="planifie">Planifié</option>
            <option value="non_commence">Non commencé</option>
            <option value="non_applicable">Non applicable</option>
          </select>
        </div>
      </div>

      {/* Tableau complet de la SoA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Intitulé & Description</th>
                <th className="py-3 px-3 text-center">Applicable</th>
                <th className="py-3 px-4">État de mise en œuvre</th>
                <th className="py-3 px-3 text-center">Maturité</th>
                <th className="py-3 px-4">Preuve documentaire</th>
                <th className="py-3 px-4">Écart & Action</th>
                <th className="py-3 px-3 text-right">Éditer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredControls.map((ctrl) => (
                <tr 
                  key={ctrl.id}
                  onClick={() => onEditControl(ctrl)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#0B3B7B] whitespace-nowrap">
                    {ctrl.code}
                  </td>

                  <td className="py-3.5 px-4 min-w-[260px] max-w-sm">
                    <div className="font-semibold text-slate-900">{ctrl.title}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ctrl.description}
                    </p>
                    <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                      Justif : {ctrl.justification}
                    </p>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ctrl.isApplicable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {ctrl.isApplicable ? 'OUI' : 'NON'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(ctrl.implementationStatus)}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                    {ctrl.isApplicable ? (
                      <span className="font-bold text-slate-700">{ctrl.maturityLevel}/5</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-[180px]">
                    {ctrl.evidenceRef ? (
                      <span className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded truncate block" title={ctrl.evidenceRef}>
                        {ctrl.evidenceRef}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Aucune preuve</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-[180px]">
                    {ctrl.gapDescription ? (
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-amber-800 line-clamp-1" title={ctrl.gapDescription}>
                          {ctrl.gapDescription}
                        </span>
                        {ctrl.linkedActionId ? (
                          <span className="inline-block text-[10px] font-mono text-[#0B3B7B] bg-blue-50 px-1 rounded">
                            Action liée
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Aucun écart</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditControl(ctrl)}
                      className="p-1.5 text-slate-400 hover:text-[#0B3B7B] hover:bg-slate-100 rounded transition"
                      title="Éditer la mesure SoA"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
