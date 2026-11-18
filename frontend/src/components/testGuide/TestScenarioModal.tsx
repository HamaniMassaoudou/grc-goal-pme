import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  FileCheck,
  CheckSquare
} from 'lucide-react';

interface TestScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

export const TestScenarioModal: React.FC<TestScenarioModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  // Les 11 étapes fidèles à l'Annexe B du Cahier des charges B14
  const steps = [
    {
      number: 1,
      targetModule: 'governance',
      title: 'Périmètre de l’Organisation Cible',
      description: 'L’utilisateur crée ou consulte l’organisation « PME Démonstration » (contexte TPE de 15 personnes dans le secteur des prestations numériques).',
      actionLabel: 'Aller à la Gouvernance',
      evidenceNote: 'Exigence EF-01 : rattachement organisationnel des données GRC.'
    },
    {
      number: 2,
      targetModule: 'assets',
      title: 'Enregistrement de l’Actif Informationnel',
      description: 'L’utilisateur enregistre l’actif essentiel « Base de données clients » avec criticité Critique, type database, et responsable désigné.',
      actionLabel: 'Aller aux Actifs',
      evidenceNote: 'Exigence EF-02 : classification de l’actif support des données commerciales.'
    },
    {
      number: 3,
      targetModule: 'risks',
      title: 'Création du Risque Ciblé',
      description: 'L’utilisateur formalise le risque « Accès non autorisé à la base de données clients » avec menace de force brute et vulnérabilité d’absence de MFA.',
      actionLabel: 'Aller au Registre des Risques',
      evidenceNote: 'Exigence EF-03 : liaison du risque à l’actif « Base de données clients ».'
    },
    {
      number: 4,
      targetModule: 'risks',
      title: 'Saisie de la Probabilité (4) et de l’Impact (5)',
      description: 'Saisie guidée d’une probabilité de 4 (Forte) et d’un impact de 5 (Critique).',
      actionLabel: 'Vérifier la Cotation',
      evidenceNote: 'Exigence EF-04 : application de l’échelle documentée de 1 à 5.'
    },
    {
      number: 5,
      targetModule: 'risks',
      title: 'Calcul Automatique du Score 20 & Niveau Critique',
      description: 'L’outil multiplie immédiatement 4 × 5 = 20 et classe le risque comme « Critique » selon les seuils officiels (15 à 25 = Critique).',
      actionLabel: 'Voir le Risque RSK-01',
      evidenceNote: 'Exigence EF-04 : seuils validés dans le cahier des charges.'
    },
    {
      number: 6,
      targetModule: 'risks',
      title: 'Désignation du Responsable & Stratégie « Réduire »',
      description: 'L’utilisateur assigne M. Abdoul Salam Issifi comme propriétaire et opte pour la stratégie de réduction du risque.',
      actionLabel: 'Consulter la Fiche Risque',
      evidenceNote: 'Exigence EF-05 : choix formel de la stratégie de traitement.'
    },
    {
      number: 7,
      targetModule: 'actions',
      title: 'Création de l’Action Corrective « Activer la MFA »',
      description: 'Création de l’action corrective ACT-01 « Activer l’authentification multifacteur (MFA) » avec échéance et priorité Critique.',
      actionLabel: 'Aller au Plan d’Actions',
      evidenceNote: 'Exigence EF-05 : liaison risque → action corrective.'
    },
    {
      number: 8,
      targetModule: 'soa',
      title: 'Ouverture de la SoA & Sélection de la mesure A.8.5',
      description: 'Navigation dans la Déclaration d’Applicabilité vers la mesure technologique ISO 27001:2022 A.8.5 (Authentification sécurisée).',
      actionLabel: 'Ouvrir la SoA A.8.5',
      evidenceNote: 'Exigence EF-06 & EF-07 : catalogue des 93 mesures ISO 27001.'
    },
    {
      number: 9,
      targetModule: 'soa',
      title: 'Déclaration Applicable & Partiellement mise en œuvre',
      description: 'L’utilisateur marque la mesure A.8.5 comme Applicable, état « Partiellement mis en œuvre » et maturité niveau 3.',
      actionLabel: 'Inspecter la mesure A.8.5',
      evidenceNote: 'Exigence EF-07 : statut SoA dynamique et niveau de maturité.'
    },
    {
      number: 10,
      targetModule: 'soa',
      title: 'Ajout de la Justification & Preuve Vérifiable',
      description: 'Enregistrement de la justification, de la preuve (Capture console MFA) et description de l’écart pour les accès tiers.',
      actionLabel: 'Voir la Preuve SoA',
      evidenceNote: 'Workflow différenciant : « écart → action → preuve → clôture ».'
    },
    {
      number: 11,
      targetModule: 'dashboard',
      title: 'Vérification du Tableau de Bord & Indicateurs Synthétiques',
      description: 'L’utilisateur vérifie que le risque critique apparaît dans la case P4×I5 de la matrice, que l’action ouverte est répertoriée et que le taux SoA est à jour.',
      actionLabel: 'Retourner au Tableau de Bord',
      evidenceNote: 'Exigence EF-08 : vue consolidée temps réel.'
    }
  ];

  const currentStep = steps[currentStepIndex];

  const handleGoToModule = () => {
    onNavigate(currentStep.targetModule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* En-tête */}
        <div className="bg-[#0B3B7B] p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Annexe B du Cahier des Charges B14</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1">
              Scénario de Démonstration & Test Utilisateur
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de progression des 11 étapes */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Étape {currentStep.number} sur {steps.length}
          </span>
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStepIndex 
                    ? 'w-6 bg-[#F25C05]' 
                    : i < currentStepIndex 
                      ? 'w-2 bg-emerald-500' 
                      : 'w-2 bg-slate-300'
                }`}
                title={`Étape ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Corps de l'étape */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B3B7B] flex items-center justify-center font-extrabold text-sm shrink-0 border border-blue-200 font-mono">
              {currentStep.number}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Justification méthodologique :</strong> {currentStep.evidenceNote}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGoToModule}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B3B7B] hover:bg-[#072a5a] text-white text-xs font-bold rounded-lg transition shadow-xs"
            >
              <span>{currentStep.actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pied avec Navigation Pas-à-Pas */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {currentStepIndex + 1} / {steps.length}
          </span>

          <button
            onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-1 text-xs font-bold text-[#F25C05] hover:text-[#d94f00] disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
