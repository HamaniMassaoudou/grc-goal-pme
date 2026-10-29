import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Building2, 
  Calendar, 
  FileCheck, 
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { UserTestSheet, TaskEvaluation, TaskEvaluationStatus, PerceivedUtilityLevel } from '../../types/grc';
import { UserAccount } from '../../types/auth';
import { DEFAULT_EVALUATION_TASKS } from '../../data/initialData';

interface TestSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheet: UserTestSheet) => void;
  initialSheet?: UserTestSheet | null;
  accounts: UserAccount[];
  existingSheetsCount: number;
}

export const TestSheetModal: React.FC<TestSheetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSheet,
  accounts,
  existingSheetsCount
}) => {
  if (!isOpen) return null;

  const defaultCode = `FT-2026-${String(existingSheetsCount + 1).padStart(3, '0')}`;

  const [selectedUserId, setSelectedUserId] = useState<string>(initialSheet?.userId || '');
  const [code, setCode] = useState(initialSheet?.code || defaultCode);
  const [testerName, setTesterName] = useState(initialSheet?.testerName || '');
  const [testerEmail, setTesterEmail] = useState(initialSheet?.testerEmail || '');
  const [testerRole, setTesterRole] = useState(initialSheet?.testerRole || '');
  const [organizationName, setOrganizationName] = useState(initialSheet?.organizationName || 'PME Démonstration');
  const [sessionTitle, setSessionTitle] = useState(
    initialSheet?.sessionTitle || 'Session d’Évaluation des fonctionnalités GRC-Goal'
  );
  const [date, setDate] = useState(initialSheet?.date || new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState(initialSheet?.durationMinutes || 25);
  const [testEnvironment, setTestEnvironment] = useState(
    initialSheet?.testEnvironment || 'Navigateur Chrome / PC Portable / AI Studio Web Preview'
  );

  const [tasks, setTasks] = useState<TaskEvaluation[]>(
    initialSheet?.tasks && initialSheet.tasks.length > 0
      ? JSON.parse(JSON.stringify(initialSheet.tasks))
      : JSON.parse(JSON.stringify(DEFAULT_EVALUATION_TASKS))
  );

  const [functionalitiesUnderstood, setFunctionalitiesUnderstood] = useState(
    initialSheet?.functionalitiesUnderstood || 'Évaluation des risques (5x5), création des actions correctives, consultation SoA.'
  );
  const [difficultiesEncountered, setDifficultiesEncountered] = useState(
    initialSheet?.difficultiesEncountered || 'Prise en main aisée après consultation des résumés vulgarisés ISO 27001.'
  );
  const [suggestions, setSuggestions] = useState(
    initialSheet?.suggestions || 'Permettre l\'export PDF individuel de la fiche et conserver l\'historique des tests.'
  );
  const [feedbackNotes, setFeedbackNotes] = useState(
    initialSheet?.feedbackNotes || 'Interface intuitive, adaptée aux contraintes d\'une PME sans direction informatique dédiée.'
  );
  const [perceivedUtility, setPerceivedUtility] = useState<PerceivedUtilityLevel>(
    initialSheet?.perceivedUtility || 'Indispensable'
  );
  const [recommendationScore, setRecommendationScore] = useState<number>(
    initialSheet?.recommendationScore ?? 10
  );
  const [signedByTester, setSignedByTester] = useState<boolean>(
    initialSheet?.signedByTester ?? true
  );
  const [signatureDate, setSignatureDate] = useState<string>(
    initialSheet?.signatureDate || new Date().toISOString().slice(0, 10)
  );
  const [mentorOrEvaluatorName, setMentorOrEvaluatorName] = useState<string>(
    initialSheet?.mentorOrEvaluatorName || 'Aboubacar Yacouba Mai Birni (Mentor GRC)'
  );
  const [mentorNotes, setMentorNotes] = useState<string>(
    initialSheet?.mentorNotes || 'Fiche conforme aux exigences du protocole B14.'
  );

  // Synchroniser les champs si l'utilisateur sélectionne un profil parmi les comptes existants
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = accounts.find(u => u.id === userId);
    if (user) {
      setTesterName(user.name);
      setTesterEmail(user.email);
      setTesterRole(user.jobTitle || 'Responsable Métier');
      setOrganizationName(user.organizationName || 'PME Démonstration');
    }
  };

  const handleTaskStatusChange = (index: number, newStatus: TaskEvaluationStatus) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  const handleTaskObservationsChange = (index: number, obs: string) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], observations: obs };
      return updated;
    });
  };

  const handleTaskTimeChange = (index: number, time: number) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], executionTimeMinutes: time };
      return updated;
    });
  };

  // Calcul automatique du score
  const validatedCount = tasks.filter(t => t.status === 'valide').length;
  const reserveCount = tasks.filter(t => t.status === 'valide_avec_reserve').length;
  const computedScore = tasks.length > 0 
    ? Math.round(((validatedCount * 1.0 + reserveCount * 0.7) / tasks.length) * 100) 
    : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerName.trim()) {
      alert("Veuillez saisir le nom du testeur.");
      return;
    }

    const newSheet: UserTestSheet = {
      id: initialSheet?.id || `sheet-${Date.now()}`,
      code: code.trim() || defaultCode,
      userId: selectedUserId || undefined,
      testerName: testerName.trim(),
      testerEmail: testerEmail.trim(),
      testerRole: testerRole.trim(),
      organizationName: organizationName.trim(),
      sessionTitle: sessionTitle.trim(),
      date,
      durationMinutes: Number(durationMinutes) || 20,
      testEnvironment: testEnvironment.trim(),
      tasks,
      globalScorePercent: computedScore,
      functionalitiesUnderstood: functionalitiesUnderstood.trim(),
      difficultiesEncountered: difficultiesEncountered.trim(),
      suggestions: suggestions.trim(),
      feedbackNotes: feedbackNotes.trim(),
      perceivedUtility,
      recommendationScore: Number(recommendationScore) || 10,
      signedByTester,
      signatureDate: signedByTester ? (signatureDate || date) : '',
      mentorOrEvaluatorName: mentorOrEvaluatorName.trim(),
      mentorNotes: mentorNotes.trim(),
      mentorValidated: true,
      createdAt: initialSheet?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newSheet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto">
        
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0B3B7B]" />
              <span>{initialSheet ? 'Modifier la Fiche de Test Utilisateur' : 'Nouvelle Fiche de Test Utilisateur'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocole officiel du Livrable 1 (§4) et Fiche de retour Annexe C — Matériau propre B14
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire de saisie */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Bloc 1 : Sélection ou saisie du testeur */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0B3B7B]" />
                <span>1. Testeur & Informations Générales</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Code : <strong className="text-[#0B3B7B]">{code}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associer un compte utilisateur (Optionnel)
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Saisie libre ou externe --</option>
                  {accounts.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.jobTitle} - {u.organizationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet du testeur *
                </label>
                <input
                  type="text"
                  required
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="Ex : M. Abdoul Salam Issifi"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={testerEmail}
                  onChange={(e) => setTesterEmail(e.target.value)}
                  placeholder="direction@sirbacom.ne"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fonction / Titre
                </label>
                <input
                  type="text"
                  value={testerRole}
                  onChange={(e) => setTesterRole(e.target.value)}
                  placeholder="Ex : Directeur Général"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entreprise / Structure
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Sirba Communication"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de passation du test
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intitulé de la session de test
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Ex : Test d'évaluation B14 — Session officielle"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durée totale (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Environnement de test (Matériel, OS, Navigateur)
                </label>
                <input
                  type="text"
                  value={testEnvironment}
                  onChange={(e) => setTestEnvironment(e.target.value)}
                  placeholder="Navigateur Chrome v122 / Windows 11 / Écran 1920x1080"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloc 2 : Évaluation des 6 Tâches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  2. Évaluation des 6 Tâches du Protocole Utilisateur (Livrable 1 §4)
                </span>
                <span className="text-xs text-slate-500">
                  Attribuez un statut et saisissez les observations concrètes pour chaque manipulation.
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#0B3B7B] bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  Score calculé : {computedScore}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div 
                  key={task.taskId} 
                  className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {task.num}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{task.taskTitle}</p>
                        <span className="text-[10px] font-mono text-[#0B3B7B] bg-blue-50 px-1.5 py-0.2 rounded">
                          {task.targetRequirement}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(idx, e.target.value as TaskEvaluationStatus)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
                          task.status === 'valide'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : task.status === 'valide_avec_reserve'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : task.status === 'echec'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="valide">Validé avec succès</option>
                        <option value="valide_avec_reserve">Validé avec réserve</option>
                        <option value="echec">Échec / Bloquant</option>
                        <option value="non_teste">Non testé</option>
                      </select>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={task.executionTimeMinutes || 3}
                          onChange={(e) => handleTaskTimeChange(idx, Number(e.target.value))}
                          className="w-12 px-1.5 py-0.5 border border-slate-300 rounded font-mono text-center"
                          title="Temps d'exécution en minutes"
                        />
                        <span>min</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <div>
                      <strong>Résultat attendu :</strong> {task.expectedResult}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={task.observations}
                        onChange={(e) => handleTaskObservationsChange(idx, e.target.value)}
                        placeholder="Observations / Difficultés particulières..."
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-blue-400 focus:outline-none italic"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloc 3 : Synthèse Qualitative & Retours d'Expérience (Annexe C) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Retours Qualitatifs & Évaluation de l'Usage (Annexe C)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fonctionnalités facilement comprises & Points forts
                </label>
                <textarea
                  rows={2}
                  value={functionalitiesUnderstood}
                  onChange={(e) => setFunctionalitiesUnderstood(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficultés rencontrées / Alertes
                </label>
                <textarea
                  rows={2}
                  value={difficultiesEncountered}
                  onChange={(e) => setDifficultiesEncountered(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suggestions d'amélioration & Évolutions attendues
                </label>
                <textarea
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Synthèse générale et commentaire du testeur
                </label>
                <textarea
                  rows={2}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Niveau d'utilité perçu pour une TPE/PME
                </label>
                <select
                  value={perceivedUtility}
                  onChange={(e) => setPerceivedUtility(e.target.value as PerceivedUtilityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="Indispensable">Indispensable (Répond parfaitement sans surcoût)</option>
                  <option value="Très utile">Très utile</option>
                  <option value="Utile">Utile</option>
                  <option value="Moyennement utile">Moyennement utile</option>
                  <option value="À améliorer">À améliorer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note de recommandation (1 à 10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={recommendationScore}
                  onChange={(e) => setRecommendationScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Bloc 4 : Signatures, Consentement & Visa Mentor */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              4. Validation Formelle & Accord de Citation B14
            </span>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signedByTester}
                  onChange={(e) => setSignedByTester(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B3B7B] focus:ring-0"
                />
                <span className="text-xs text-slate-800 font-medium">
                  <strong>Accord formel du testeur :</strong> Le testeur confirme l'authenticité de son retour et autorise sa mention dans le dossier de soutenance B14 APSI-NE.
                </span>
              </label>

              {signedByTester && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-500">Signé le :</span>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mentor Référent / Évaluateur
                </label>
                <input
                  type="text"
                  value={mentorOrEvaluatorName}
                  onChange={(e) => setMentorOrEvaluatorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note méthodologique du Mentor
                </label>
                <input
                  type="text"
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pied d'actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialSheet ? 'Enregistrer les modifications' : 'Créer et Enregistrer la Fiche'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
