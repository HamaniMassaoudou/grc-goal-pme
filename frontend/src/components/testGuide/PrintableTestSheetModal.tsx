import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download,
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Calendar, 
  Laptop, 
  ShieldCheck,
  Award,
  FileCheck
} from 'lucide-react';
import { UserTestSheet, TaskEvaluationStatus } from '../../types/grc';
import { exportTestSheetToPDF } from '../../services/pdfExport';

interface PrintableTestSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: UserTestSheet | null;
}

export const PrintableTestSheetModal: React.FC<PrintableTestSheetModalProps> = ({
  isOpen,
  onClose,
  sheet
}) => {
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  if (!isOpen || !sheet) return null;

  const handleDownloadPDF = () => {
    try {
      exportTestSheetToPDF(sheet);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // Si window.print() est restreint dans l'iframe, on télécharge directement le PDF
      handleDownloadPDF();
    }
  };

  const getStatusBadge = (status: TaskEvaluationStatus) => {
    switch (status) {
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Validé</span>
          </span>
        );
      case 'valide_avec_reserve':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-700" />
            <span>Avec réserve</span>
          </span>
        );
      case 'echec':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>Échec</span>
          </span>
        );
      case 'non_teste':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Non testé</span>
          </span>
        );
    }
  };

  const validatedTasksCount = sheet.tasks.filter(t => t.status === 'valide').length;
  const withReserveCount = sheet.tasks.filter(t => t.status === 'valide_avec_reserve').length;

  return (
    <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="print-modal-card bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col my-auto">
        
        {/* Barre d'outils du rapport (cachée à l'impression) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0B3B7B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {sheet.code}
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Fiche Individuelle de Test Utilisateur
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Évaluation officielle {sheet.sessionTitle} · Testeur : {sheet.testerName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs cursor-pointer"
              title="Télécharger le document PDF officiel"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'PDF Téléchargé !' : 'Télécharger le PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-xs cursor-pointer"
              title="Imprimer ou enregistrer via la boîte de dialogue d'impression"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps du document imprimable (A4 officiel) */}
        <div className="print-container flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          
          {/* En-tête officiel du document */}
          <div className="border-b-2 border-[#0B3B7B] pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/public/assets/aistudio/Logo_GRC-Goal___croissance_et_conformit__dd12a5d7.png" 
                  alt="GRC-Goal Logo" 
                  className="w-16 h-16 object-contain shrink-0" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#0B3B7B] tracking-tight">GRC-Goal</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                      SaaS B2B GRC
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#F25C05]">
                    Pilotez votre GRC, atteignez vos objectifs
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Gouvernance · Gestion des Risques (ISO 27005) · Conformité SoA (ISO 27001:2022)
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  RÉF : {sheet.code}
                </span>
                <h1 className="text-base font-extrabold text-slate-900 mt-1">
                  FICHE INDIVIDUELLE DE TEST UTILISATEUR
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Annexe C · Cahier des charges & Livrable 1 (§4)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Date d'évaluation : <strong className="text-slate-800">{sheet.date}</strong>
                </p>
              </div>
            </div>

            {/* Bandeau d'affiliation B14 */}
            <div className="mt-4 py-1.5 px-3 bg-slate-50 rounded-md border border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
              <span>
                <strong>Programme :</strong> Excellence en Cybersécurité Niger 2026 · Projet B14 (APSI-NE)
              </span>
              <span>
                <strong>Concepteur :</strong> Hamani Massaoudou · <strong>Mentor :</strong> {sheet.mentorOrEvaluatorName || 'Aboubacar Yacouba Mai Birni'}
              </span>
            </div>
          </div>

          {/* Section 1 : Informations sur le Testeur & Contexte Technique */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#0B3B7B] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#0B3B7B]/30">
              <User className="w-3.5 h-3.5 text-[#0B3B7B]" />
              <span>1. Identité du Testeur & Contexte d'Évaluation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white rounded-lg border border-slate-300 text-xs shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Nom du Testeur</span>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{sheet.testerName}</p>
                <p className="text-slate-700 text-xs font-medium">{sheet.testerRole}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Organisation & Contact</span>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{sheet.organizationName}</p>
                <p className="text-slate-700 text-xs font-mono">{sheet.testerEmail || 'contact@sirbacom.ne'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Session & Durée</span>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{sheet.sessionTitle}</p>
                <p className="text-slate-700 text-xs font-mono">
                  Durée effective : <strong className="text-[#0B3B7B] font-bold">{sheet.durationMinutes} minutes</strong>
                </p>
              </div>

              <div className="md:col-span-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-slate-600" />
                  <span><strong>Environnement de test :</strong> {sheet.testEnvironment}</span>
                </div>
                <div>
                  <span><strong>Horodatage d'enregistrement :</strong> {new Date(sheet.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 : Tableau des 6 Tâches du Protocole Officiel (§4) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#0B3B7B]/30">
              <h2 className="text-xs font-bold text-[#0B3B7B] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#0B3B7B]" />
                <span>2. Matrice d'Évaluation des Tâches (Protocole Livrable 1 §4)</span>
              </h2>
              <span className="text-xs text-slate-700 font-semibold">
                Tâches validées : <strong className="text-emerald-700 font-bold">{validatedTasksCount}</strong> / {sheet.tasks.length}
              </span>
            </div>

            <div className="overflow-hidden border border-slate-300 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0B3B7B] text-white font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">N°</th>
                    <th className="py-2.5 px-3 w-1/4">Tâche demandée au testeur</th>
                    <th className="py-2.5 px-3 w-1/4">Résultat attendu (Exigence)</th>
                    <th className="py-2.5 px-3 text-center w-28">Statut</th>
                    <th className="py-2.5 px-3">Observations & Remarques du testeur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {sheet.tasks.map((task) => (
                    <tr key={task.taskId} className="hover:bg-slate-50/80 bg-white">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0B3B7B] align-top">
                        {task.num}
                      </td>
                      <td className="py-2.5 px-3 align-top">
                        <p className="font-bold text-slate-900">{task.taskTitle}</p>
                        <span className="inline-block text-[10px] font-mono font-semibold text-[#0B3B7B] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1">
                          {task.targetRequirement}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 align-top leading-relaxed font-normal">
                        {task.expectedResult}
                      </td>
                      <td className="py-2.5 px-3 text-center align-top whitespace-nowrap">
                        {getStatusBadge(task.status)}
                        {task.executionTimeMinutes && (
                          <span className="block text-[10px] text-slate-600 font-mono font-medium mt-1">
                            {task.executionTimeMinutes} min
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 align-top font-medium">
                        {task.observations || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3 : Synthèse Qualitative & Retours d'Expérience (Annexe C) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#0B3B7B] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#0B3B7B]/30">
              <Award className="w-3.5 h-3.5 text-[#0B3B7B]" />
              <span>3. Synthèse Qualitative du Testeur (Annexe C)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1.5">
                <span className="font-bold text-[#0B3B7B] text-xs block">
                  Fonctionnalités facilement comprises & Points forts :
                </span>
                <p className="text-slate-800 text-xs leading-relaxed font-normal">
                  {sheet.functionalitiesUnderstood || 'Aucun commentaire.'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1.5">
                <span className="font-bold text-amber-800 text-xs block">
                  Difficultés rencontrées / Alertes :
                </span>
                <p className="text-slate-800 text-xs leading-relaxed font-normal">
                  {sheet.difficultiesEncountered || 'Aucune difficulté majeure constatée.'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1.5">
                <span className="font-bold text-[#0B3B7B] text-xs block">
                  Suggestions d'amélioration & Évolutions recommandées :
                </span>
                <p className="text-slate-800 text-xs leading-relaxed font-normal">
                  {sheet.suggestions || 'Poursuivre sur cette lancée.'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-300 shadow-2xs space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">
                  Commentaire général & Appréciation globale :
                </span>
                <p className="text-slate-900 text-xs leading-relaxed italic font-medium">
                  "{sheet.feedbackNotes}"
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 : Mesures Quantitatives & Recommandation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-lg border border-[#0B3B7B]/40 shadow-2xs text-xs">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Taux de réussite aux tâches
              </span>
              <p className="text-xl font-black text-[#0B3B7B] font-mono mt-0.5">
                {sheet.globalScorePercent}%
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                {validatedTasksCount} validées sur {sheet.tasks.length}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Niveau d'utilité perçu pour une PME
              </span>
              <span className="inline-block text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded border border-emerald-300 mt-1">
                {sheet.perceivedUtility}
              </span>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Note de recommandation (NPS)
              </span>
              <p className="text-xl font-black text-[#C2410C] font-mono mt-0.5">
                {sheet.recommendationScore} <span className="text-xs font-normal text-slate-600">/ 10</span>
              </p>
              <p className="text-[11px] text-slate-600 font-medium">Très fortement recommandé</p>
            </div>
          </div>

          {/* Section 5 : Signatures, Consentement & Visa Académique */}
          <div className="border-t-2 border-slate-300 pt-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Validation Formelle, Consentement & Visa de Soutenance B14
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Signature Testeur */}
              <div className="p-4 bg-white rounded-lg border border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Signature du Testeur Tiers
                  </span>
                  {sheet.signedByTester && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Signé le {sheet.signatureDate || sheet.date}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    checked={sheet.signedByTester} 
                    readOnly 
                    className="mt-0.5 rounded text-[#0B3B7B]" 
                  />
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong>Accord formel et consentement :</strong> Je soussigné(e) <u>{sheet.testerName}</u>, agissant en qualité de <u>{sheet.testerRole}</u> pour <u>{sheet.organizationName}</u>, certifie l'authenticité des manipulations réalisées et donne mon accord pour la citation de cette fiche d'évaluation dans le rapport professionnel et la soutenance du projet B14 APSI-NE.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Fait à Niamey, le {sheet.signatureDate || sheet.date}</span>
                  <div className="font-serif italic font-bold text-[#0B3B7B] border-b border-dashed border-[#0B3B7B] px-2">
                    {sheet.testerName}
                  </div>
                </div>
              </div>

              {/* Visa Mentor / Évaluateur */}
              <div className="p-4 bg-white rounded-lg border border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Visa de l'Évaluateur / Mentor Référent
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Conforme aux exigences B14
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 leading-tight">
                  <strong>Contrôle méthodologique :</strong> Le protocole a été exécuté dans des conditions représentatives d'une PME. Les retours documentés constituent un matériau d'évaluation authentique validé pour le Livrable 1.
                </p>

                <p className="text-[10px] text-slate-600 italic">
                  Note d'audit : {sheet.mentorNotes || 'Fiche approuvée pour archivage et inclusion au dossier de soutenance.'}
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Mentor Référent GRC</span>
                  <div className="font-serif italic font-bold text-slate-800">
                    {sheet.mentorOrEvaluatorName || 'Aboubacar Yacouba Mai Birni'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page du document */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 gap-1">
            <span>GRC-Goal · Plateforme SaaS de Gouvernance, Risques & Conformité · Version 2.0</span>
            <span>Matériau propre B14 · Réf. doc : {sheet.code} · Page 1/1</span>
          </div>

        </div>

      </div>
    </div>
  );
};
