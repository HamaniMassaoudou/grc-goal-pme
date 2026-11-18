import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  FileCheck, 
  UserCheck, 
  Building2, 
  Calendar, 
  Clock, 
  Award,
  Sparkles,
  Download,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Copy,
  Search,
  Filter,
  Check,
  AlertCircle,
  XCircle,
  FileText,
  User,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { UserTestSheet, TestProtocolLog, TaskEvaluationStatus } from '../../types/grc';
import { UserAccount } from '../../types/auth';
import { PrintableTestSheetModal } from './PrintableTestSheetModal';
import { TestSheetModal } from './TestSheetModal';
import { exportTestSheetsToCSV } from '../../services/storage';
import { exportTestSheetToPDF } from '../../services/pdfExport';

interface TestProtocolViewProps {
  testSheets: UserTestSheet[];
  onSaveSheet: (sheet: UserTestSheet) => void;
  onDeleteSheet: (sheetId: string) => void;
  onOpenStepGuide: () => void;
  accounts: UserAccount[];
  currentUser?: UserAccount;
  testProtocol?: TestProtocolLog;
  onUpdateProtocol?: (updated: TestProtocolLog) => void;
}

export const TestProtocolView: React.FC<TestProtocolViewProps> = ({
  testSheets,
  onSaveSheet,
  onDeleteSheet,
  onOpenStepGuide,
  accounts,
  currentUser
}) => {
  // Sélection du filtre par testeur / utilisateur
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<UserTestSheet | null>(null);
  const [sheetForPdfExport, setSheetForPdfExport] = useState<UserTestSheet | null>(null);
  const [sheetToDelete, setSheetToDelete] = useState<UserTestSheet | null>(null);
  const [pdfExportSuccess, setPdfExportSuccess] = useState<string | null>(null);

  // Fiche active inspectée dans le volet détaillé
  const [activeSheetId, setActiveSheetId] = useState<string>(
    testSheets.length > 0 ? testSheets[0].id : ''
  );

  // Filtrage des fiches
  const filteredSheets = testSheets.filter(sheet => {
    // Filtre par utilisateur / testeur
    if (selectedUserFilter !== 'all') {
      const matchUserId = sheet.userId === selectedUserFilter;
      const matchName = sheet.testerName.toLowerCase().includes(selectedUserFilter.toLowerCase());
      if (!matchUserId && !matchName) return false;
    }

    // Filtre textuel de recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = sheet.code.toLowerCase().includes(q);
      const matchTester = sheet.testerName.toLowerCase().includes(q);
      const matchOrg = sheet.organizationName.toLowerCase().includes(q);
      const matchSession = sheet.sessionTitle.toLowerCase().includes(q);
      if (!matchCode && !matchTester && !matchOrg && !matchSession) return false;
    }

    return true;
  });

  const activeSheet = testSheets.find(s => s.id === activeSheetId) || filteredSheets[0] || testSheets[0];

  // Métriques globales
  const totalSheets = testSheets.length;
  const uniqueTestersCount = new Set(testSheets.map(s => s.testerName.trim().toLowerCase())).size;
  const avgSuccessRate = totalSheets > 0
    ? Math.round(testSheets.reduce((acc, s) => acc + s.globalScorePercent, 0) / totalSheets)
    : 100;
  const signedSheetsCount = testSheets.filter(s => s.signedByTester).length;

  // Calcul du nombre de fiches par utilisateur pour le filtre
  const getSheetsCountForUser = (userName: string, userId?: string) => {
    return testSheets.filter(s => 
      (userId && s.userId === userId) || s.testerName.toLowerCase() === userName.toLowerCase()
    ).length;
  };

  const handleDuplicateSheet = (sheet: UserTestSheet) => {
    const duplicated: UserTestSheet = {
      ...sheet,
      id: `sheet-${Date.now()}`,
      code: `FT-2026-${String(testSheets.length + 1).padStart(3, '0')}`,
      sessionTitle: `${sheet.sessionTitle} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveSheet(duplicated);
    setActiveSheetId(duplicated.id);
  };

  // Export direct et ouverture de l'aperçu PDF
  const handleExportPDF = (sheet: UserTestSheet) => {
    try {
      exportTestSheetToPDF(sheet);
      setPdfExportSuccess(sheet.id);
      setTimeout(() => setPdfExportSuccess(null), 3000);
      setSheetForPdfExport(sheet);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setSheetForPdfExport(sheet);
    }
  };

  // Suppression sécurisée in-app (sans window.confirm bloqué par iframe)
  const handleConfirmDelete = () => {
    if (!sheetToDelete) return;
    const deletedId = sheetToDelete.id;
    onDeleteSheet(deletedId);
    setSheetToDelete(null);
    const remaining = testSheets.filter(s => s.id !== deletedId);
    if (remaining.length > 0) {
      setActiveSheetId(remaining[0].id);
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

  return (
    <div className="space-y-6">
      
      {/* En-tête principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-[#0B3B7B]" />
            <span>Protocole & Fiches de Test Utilisateur</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenStepGuide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F25C05]" />
            <span>Scénario Guidé</span>
          </button>

          <button
            onClick={() => {
              setEditingSheet(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Fiche de Test</span>
          </button>
        </div>
      </div>

      {/* Cartes métriques récapitulatives */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fiches Enregistrées</span>
            <FileText className="w-4 h-4 text-[#0B3B7B]" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">{totalSheets}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sessions de test archivées</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Testeurs Distincts</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">{uniqueTestersCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Profils & parties prenantes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux Moyen de Réussite</span>
            <Award className="w-4 h-4 text-[#F25C05]" />
          </div>
          <p className="text-2xl font-black text-[#0B3B7B] font-mono mt-1 tabular-nums">{avgSuccessRate}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sur l'ensemble des 6 tâches</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fiches Signées & Déchargées</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">
            {signedSheetsCount} <span className="text-xs font-normal text-slate-400">/ {totalSheets}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Accords formels B14</p>
        </div>
      </div>

      {/* Barre de recherche et de filtrage par utilisateur */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Sélecteur de testeur / utilisateur */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tous les testeurs ({totalSheets} fiches)</option>
              {accounts.map(acc => {
                const count = getSheetsCountForUser(acc.name, acc.id);
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({count} {count > 1 ? 'fiches' : 'fiche'})
                  </option>
                );
              })}
              {/* Option pour Abdoul Salam Issifi si non lié par ID */}
              <option value="Abdoul Salam Issifi">
                Abdoul Salam Issifi ({getSheetsCountForUser('Abdoul Salam Issifi')} fiches - Testeur tiers B14)
              </option>
            </select>
          </div>

          {/* Recherche textuelle */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par code, testeur, session, entreprise..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 text-right">
          <strong>{filteredSheets.length}</strong> fiche{filteredSheets.length > 1 ? 's' : ''} affichée{filteredSheets.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des Fiches de Test Utilisateur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Colonne de gauche : Cartes des fiches */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Fiches enregistrées ({filteredSheets.length})
            </span>
          </div>

          {filteredSheets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">Aucune fiche ne correspond à votre filtre.</p>
              <button
                onClick={() => {
                  setSelectedUserFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#0B3B7B] font-semibold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredSheets.map((sheet) => {
              const isSelected = activeSheet?.id === sheet.id;
              const valCount = sheet.tasks.filter(t => t.status === 'valide').length;

              return (
                <div
                  key={sheet.id}
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#0B3B7B] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold text-[#0B3B7B] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                        {sheet.code}
                      </span>
                      {sheet.signedByTester && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>Signé</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {sheet.date}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {sheet.testerName}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {sheet.testerRole} · {sheet.organizationName}
                  </p>

                  <p className="text-[11px] text-slate-600 mt-2 font-medium line-clamp-1">
                    {sheet.sessionTitle}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {valCount}/{sheet.tasks.length} tâches
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                        {sheet.globalScorePercent}%
                      </span>
                    </div>

                    {/* Bouton direct d'export PDF */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(sheet);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#0B3B7B] bg-white border border-blue-200 hover:bg-blue-100 rounded transition cursor-pointer"
                      title="Télécharger et afficher cette fiche en PDF"
                    >
                      <Printer className="w-3 h-3 text-[#0B3B7B]" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Colonne de droite : Vue détaillée et actions de la fiche active */}
        <div className="md:col-span-2">
          {activeSheet ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
              
              {/* Entête de la fiche active */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B3B7B] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {activeSheet.code}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Passée le {activeSheet.date} ({activeSheet.durationMinutes} min)
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {activeSheet.sessionTitle}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Testeur : <strong className="text-slate-900">{activeSheet.testerName}</strong> ({activeSheet.testerRole}) — {activeSheet.organizationName}
                  </p>
                </div>

                {/* Actions sur la fiche active */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleExportPDF(activeSheet)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs cursor-pointer"
                    title="Télécharger et prévisualiser le document PDF officiel"
                  >
                    {pdfExportSuccess === activeSheet.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>PDF Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4" />
                        <span>Exporter en PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingSheet(activeSheet);
                      setIsCreateModalOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    title="Modifier la fiche"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicateSheet(activeSheet)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    title="Dupliquer la fiche pour une nouvelle session"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSheetToDelete(activeSheet)}
                    className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                    title="Supprimer la fiche"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contexte & Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Taux de Réussite aux Tâches
                  </span>
                  <p className="text-xl font-black text-[#0B3B7B] font-mono mt-0.5">
                    {activeSheet.globalScorePercent}%
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {activeSheet.tasks.filter(t => t.status === 'valide').length} sur {activeSheet.tasks.length} validées
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Niveau d'Utilité Déclaré
                  </span>
                  <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 mt-1">
                    {activeSheet.perceivedUtility}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Recommandation (NPS)
                  </span>
                  <p className="text-xl font-black text-[#F25C05] font-mono mt-0.5">
                    {activeSheet.recommendationScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Adhésion maximale</p>
                </div>
              </div>

              {/* Matrice des 6 tâches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Détail des 6 Tâches du Protocole (Livrable 1 §4)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Environnement : {activeSheet.testEnvironment}
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">N°</th>
                        <th className="py-2.5 px-3 w-1/3">Tâche & Exigence</th>
                        <th className="py-2.5 px-3 w-1/3">Résultat attendu</th>
                        <th className="py-2.5 px-3 text-center w-28">Statut</th>
                        <th className="py-2.5 px-3">Observations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {activeSheet.tasks.map((task) => (
                        <tr key={task.taskId} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                            {task.num}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-900">{task.taskTitle}</p>
                            <span className="text-[9px] font-mono text-[#0B3B7B] bg-blue-50 px-1 rounded">
                              {task.targetRequirement}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {task.expectedResult}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 italic">
                            {task.observations || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Synthèse Qualitative & Décharge formelle */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Retour d'Expérience du Testeur & Accord Formel (Annexe C)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px] block">Points forts / Compréhension :</span>
                    <p className="text-slate-600 text-[11px]">
                      {activeSheet.functionalitiesUnderstood}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px] block">Difficultés rencontrées :</span>
                    <p className="text-slate-600 text-[11px]">
                      {activeSheet.difficultiesEncountered}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px] block">Suggestions d'amélioration :</span>
                    <p className="text-slate-600 text-[11px]">
                      {activeSheet.suggestions}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1">
                    <span className="font-semibold text-[#0B3B7B] text-[11px] block">Commentaire de synthèse :</span>
                    <p className="text-slate-700 text-[11px] italic">
                      "{activeSheet.feedbackNotes}"
                    </p>
                  </div>
                </div>

                {/* Bloc accord et signatures */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">
                        Accord formel du testeur accordé le {activeSheet.signatureDate || activeSheet.date}
                      </p>
                      <p className="text-emerald-800 text-[11px]">
                        Autorisation expresse accordée pour citation et archivage dans le rapport B14 du candidat Hamani Massaoudou.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExportPDF(activeSheet)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Télécharger / Imprimer la Fiche PDF</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Sélectionnez une fiche de test pour afficher ses détails.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modale de création / édition d'une fiche de test */}
      <TestSheetModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingSheet(null);
        }}
        onSave={(savedSheet) => {
          onSaveSheet(savedSheet);
          setActiveSheetId(savedSheet.id);
        }}
        initialSheet={editingSheet}
        accounts={accounts}
        existingSheetsCount={testSheets.length}
      />

      {/* Modale d'export / impression PDF pour la fiche sélectionnée */}
      <PrintableTestSheetModal
        isOpen={!!sheetForPdfExport}
        onClose={() => setSheetForPdfExport(null)}
        sheet={sheetForPdfExport}
      />

      {/* Modale de confirmation de suppression (sécurisée sans window.confirm) */}
      {sheetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Supprimer la fiche de test ?
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Réf : {sheetToDelete.code}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement la fiche de test de <strong>{sheetToDelete.testerName}</strong> ({sheetToDelete.organizationName}) enregistrée le {sheetToDelete.date} ? Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSheetToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
