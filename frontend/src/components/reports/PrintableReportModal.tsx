import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  FileCheck2,
  AlertTriangle,
  Check,
  FileDown
} from 'lucide-react';
import { Organization, Risk, CorrectiveAction, SoAControl, Asset } from '../../types/grc';
import { exportFullBackupJSON, loadGRCState } from '../../services/storage';
import { exportGRCReportHTML, exportGRCReportCSV } from '../../services/reportExport';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  risks: Risk[];
  actions: CorrectiveAction[];
  soa: SoAControl[];
  assets: Asset[];
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  organization,
  risks,
  actions,
  soa,
  assets
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const openRisks = risks.filter(r => r.status !== 'clôturé');
  const criticalRisks = openRisks.filter(r => r.level === 'Critique');
  const highRisks = openRisks.filter(r => r.level === 'Élevé');
  
  const applicableControls = soa.filter(c => c.isApplicable);
  const implementedControls = applicableControls.filter(c => c.implementationStatus === 'mis_en_oeuvre');
  const soaRate = applicableControls.length > 0 ? Math.round((implementedControls.length / applicableControls.length) * 100) : 0;

  const openActions = actions.filter(a => a.status !== 'cloturee' && a.status !== 'rejetee');
  const overdueActions = actions.filter(a => a.status === 'en_retard');
  const closedActions = actions.filter(a => a.status === 'cloturee');

  const handleDownloadReport = () => {
    // 1. Déclencher le téléchargement immédiat du rapport complet
    exportGRCReportHTML(organization, risks, actions, soa, assets);
    
    // 2. Feedback visuel sur le bouton
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3500);

    // 3. Tenter d'ouvrir la boîte d'impression du navigateur si supportée
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        // Envelopper pour éviter toute interruption si l'iFrame restreint l'appel
        window.print();
      }
    } catch {
      // Ignorer sans bloquer le téléchargement qui est déjà actif
    }
  };

  const handleExportJSON = () => {
    const fullState = loadGRCState();
    exportFullBackupJSON(fullState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col my-auto">
        
        {/* Barre d'outils du rapport (cachée à l'impression) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Rapport Exécutif de Synthèse GRC & Conformité
            </h2>
            <p className="text-[11px] text-slate-500">
              Périmètre : {organization.name} · ISO/IEC 27001 & B14
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Exporter toutes les données en JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sauvegarde JSON</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition shadow-xs ${
                downloadSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-[#0B3B7B] hover:bg-[#072a5a]'
              }`}
              title="Télécharger le rapport exécutif complet (HTML autonome et impression PDF)"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Rapport téléchargé !</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Télécharger le Rapport (HTML / PDF)</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              title="Fermer la fenêtre"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu imprimable (A4 styled) */}
        <div className="p-8 space-y-6 overflow-y-auto print-container text-slate-900 text-xs">
          
          {/* En-tête officiel du document */}
          <div className="flex items-start justify-between border-b-2 border-[#0B3B7B] pb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/aistudio/Logo_GRC-Goal___croissance_et_conformit__dd12a5d7.png" 
                alt="GRC-Goal Logo" 
                className="h-14 w-auto object-contain"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-extrabold text-[#0B3B7B]">GRC-</span>
                  <span className="text-xl font-extrabold text-[#F25C05]">Goal</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Système de Management et Pilotage GRC Opérationnel pour PME/TPE
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <p className="font-bold text-slate-900">{organization.name}</p>
              <p className="text-slate-500">{organization.sector}</p>
              <p className="text-slate-500">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
              <span className="inline-block mt-1 text-[10px] text-[#0B3B7B] font-semibold bg-blue-50 px-2 py-0.5 rounded">
                Programme APSI-NE · Sujet B14
              </span>
            </div>
          </div>

          {/* Synthèse managériale */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Risques Ouverts</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                {openRisks.length}
              </div>
              <span className="text-[10px] text-rose-600 font-bold">{criticalRisks.length} critiques</span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Conformité SoA</span>
              <div className="text-2xl font-extrabold font-mono text-[#0B3B7B] mt-0.5">
                {soaRate}%
              </div>
              <span className="text-[10px] text-slate-500">{implementedControls.length}/{applicableControls.length} mesures</span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Actions en Cours</span>
              <div className="text-2xl font-extrabold font-mono text-blue-600 mt-0.5">
                {openActions.length}
              </div>
              <span className="text-[10px] text-slate-500">{overdueActions.length} en retard</span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Actifs Clés</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                {assets.length}
              </div>
              <span className="text-[10px] text-slate-500">cartographiés</span>
            </div>
          </div>

          {/* Registre des Risques Critiques et Élevés */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Risques Prioritaires à Traitement Immédiat
            </h3>

            <table className="w-full text-left border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-600">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Intitulé du risque</th>
                  <th className="p-2">Actif</th>
                  <th className="p-2 text-center">Score (P×I)</th>
                  <th className="p-2">Niveau</th>
                  <th className="p-2">Stratégie</th>
                  <th className="p-2">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openRisks.map((r) => {
                  const asset = assets.find(a => a.id === r.assetId);
                  return (
                    <tr key={r.id}>
                      <td className="p-2 font-mono font-bold text-[#0B3B7B]">{r.code}</td>
                      <td className="p-2 font-semibold text-slate-900">{r.title}</td>
                      <td className="p-2 text-slate-600">{asset?.name || 'N/A'}</td>
                      <td className="p-2 text-center font-mono font-bold">{r.score}</td>
                      <td className="p-2 font-bold">{r.level}</td>
                      <td className="p-2 capitalize text-slate-600">{r.strategy}</td>
                      <td className="p-2 text-slate-600">{r.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Plan d'Actions Correctives */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Plan d'Actions de Remédiation & Preuves
            </h3>

            <table className="w-full text-left border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-600">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Action Corrective</th>
                  <th className="p-2">Priorité</th>
                  <th className="p-2">Responsable</th>
                  <th className="p-2">Échéance</th>
                  <th className="p-2">Statut</th>
                  <th className="p-2">Preuve de validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2 font-mono font-bold text-slate-700">{a.code}</td>
                    <td className="p-2 font-semibold text-slate-900">{a.title}</td>
                    <td className="p-2">{a.priority}</td>
                    <td className="p-2 text-slate-600">{a.owner}</td>
                    <td className="p-2 font-mono">{a.dueDate}</td>
                    <td className="p-2 capitalize">{a.status.replace('_', ' ')}</td>
                    <td className="p-2 text-slate-600 italic max-w-xs truncate">
                      {a.evidenceOfClosure || 'En attente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Synthèse SoA ISO 27001 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. État d'Applicabilité ISO/IEC 27001:2022
            </h3>
            <p className="text-slate-600">
              Sur les <strong>93 mesures</strong> de l’Annexe A, <strong>{applicableControls.length}</strong> sont déclarées applicables au périmètre de la PME. 
              Actuellement, <strong>{implementedControls.length}</strong> mesures sont entièrement conformes avec preuves à l'appui, représentant un taux d’implémentation de <strong>{soaRate}%</strong>.
            </p>
          </div>

          {/* Bloc de validation et signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <p className="font-bold text-slate-900">Le Concepteur & Référent GRC :</p>
              <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1 text-slate-500 font-mono text-[11px]">
                Hamani Massaoudou (Participant B14)
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-bold text-slate-900">Le Responsable de la PME / Testeur tiers :</p>
              <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1 text-slate-500 font-mono text-[11px]">
                Abdoul Salam Issifi (Sirba Communication)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
