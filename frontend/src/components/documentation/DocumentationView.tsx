import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Calculator, 
  FileCheck2, 
  AlertTriangle,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* En-tête */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Notice d’Utilisation Officielle de GRC-Goal
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Guide opérationnel complet pour le déploiement et l’exploitation d’un outillage GRC léger en PME et TPE.
        </p>
      </div>

      {/* Sommaire des 10 sections obligatoires L-02 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        
        {/* 1. Objectif de l'outil */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">1</span>
            Objectif de l’application GRC-Goal
          </h2>
          <p>
            GRC-Goal est une solution conçue spécifiquement pour permettre aux Très Petites et Moyennes Entreprises (TPE/PME) de piloter leur gouvernance de la sécurité de l'information, de cartographier leurs risques numériques, de gérer leur Déclaration d’Applicabilité (SoA ISO/IEC 27001:2022) et de suivre leurs plans d'actions correctives sans dépendance à un logiciel commercial onéreux ni architecture cloud complexe.
          </p>
        </section>

        {/* 2. Prérequis & Environnement technique */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">2</span>
            Prérequis techniques & Portabilité (ENF-02 & ENF-03)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Un simple navigateur web moderne (Chrome, Firefox, Safari, Edge).</li>
            <li>Aucun matériel serveur dédié requis : exécution fluide sur n'importe quel ordinateur de bureau bureautique.</li>
            <li>Persistance locale autonome (sans nécessiter de connexion Internet permanente).</li>
          </ul>
        </section>

        {/* 3. Lancement et Prise en main */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">3</span>
            Lancement et Navigation
          </h2>
          <p>
            L’application s’ouvre directement sur le <strong>Tableau de bord</strong>. La barre supérieure permet de basculer de rôle utilisateur (Administrateur GRC, Responsable PME, Mentor/Auditeur) et d'exécuter à tout moment le <strong>Scénario de test B14</strong>. La barre latérale donne un accès immédiat à tous les modules fonctionnels.
          </p>
        </section>

        {/* 4. Gestion de l'organisation */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">4</span>
            Configuration de l’Organisation Cible (EF-01)
          </h2>
          <p>
            Rendez-vous dans l'onglet <strong>Gouvernance & Périmètre</strong> pour renseigner le nom de l’entreprise (« PME Démonstration » ou votre raison sociale), le secteur d’activité, l’effectif, ainsi que le nom du dirigeant et du correspondant sécurité. L’ensemble des risques et contrôles sera rattaché à ce périmètre.
          </p>
        </section>

        {/* 5. Cartographie des actifs */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">5</span>
            Inventaire des Actifs Informationnels (EF-02)
          </h2>
          <p>
            Dans le module <strong>Actifs</strong>, répertoriez vos ressources critiques (bases de données, serveurs, ordinateurs, applications, documents contractuels). Chaque actif possède une criticité (Faible, Moyenne, Élevée, Critique) et un propriétaire identifié.
          </p>
        </section>

        {/* 6. Cotation du risque (P x I) */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">6</span>
            Création et Cotation des Risques (EF-03 & EF-04)
          </h2>
          <p>
            Pour chaque risque, l'utilisateur indique la menace, la vulnérabilité et ajuste les curseurs de 1 à 5 :
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
            <p><strong>Score = Probabilité × Impact</strong></p>
            <p>• 1 à 3 : Faible (Vert)</p>
            <p>• 4 à 7 : Moyen (Jaune)</p>
            <p>• 8 à 14 : Élevé (Orange)</p>
            <p>• 15 à 25 : Critique (Rouge)</p>
          </div>
          <p>
            L’outil permet également d'enregistrer l'évaluation du <strong>risque résiduel</strong> attendu une fois les mesures correctives déployées.
          </p>
        </section>

        {/* 7. SoA ISO 27001:2022 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">7</span>
            Pilotage de la Déclaration d’Applicabilité SoA (EF-06 & EF-07)
          </h2>
          <p>
            Le catalogue intègre les <strong>93 mesures officielles</strong> réparties dans les 4 thèmes ISO/IEC 27001:2022 (Organisationnels A.5, Personnes A.6, Physiques A.7, Technologiques A.8). Pour chaque mesure :
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Déclarer l'applicabilité (Oui / Non) avec justification obligatoire.</li>
            <li>Choisir l'état (Mis en œuvre, Partiellement, Planifié, Non commencé, Non applicable).</li>
            <li>Attribuer un niveau de maturité de 1 à 5.</li>
            <li>Ajouter la référence de preuve vérifiable (ex. PV de test, capture console).</li>
            <li>En cas d'écart constaté, cliquer directement sur <em>« Créer une action liée à cet écart »</em>.</li>
          </ul>
        </section>

        {/* 8. Suivi des actions */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">8</span>
            Workflow des Actions de Remédiation (EF-05)
          </h2>
          <p>
            Toute action corrective est reliée soit à un risque ouvert, soit à un écart de conformité SoA. L’état d'avancement est transparent. Pour clôturer une action, une <strong>preuve matérielle de clôture</strong> doit être enregistrée, garantissant la traçabilité exigée lors d'un contrôle ou d'un audit.
          </p>
        </section>

        {/* 9. Interprétation du tableau de bord */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#0B3B7B]">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3B7B] flex items-center justify-center font-mono text-xs">9</span>
            Interprétation du Tableau de Bord (EF-08)
          </h2>
          <p>
            Le tableau de bord synthétise les 4 cadrans vitaux :
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Risques ouverts :</strong> alerte prioritaire sur les niveaux élevés et critiques.</li>
            <li><strong>Actions en retard :</strong> mise en évidence immédiate des actions dont la date cible est dépassée.</li>
            <li><strong>Taux SoA :</strong> pourcentage de mesures applicables effectivement mises en œuvre.</li>
            <li><strong>Matrice 5x5 :</strong> cartographie visuelle interactive par case de criticité.</li>
          </ul>
        </section>

        {/* 10. Limites connues */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-700">
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-mono text-xs">10</span>
            Limites Connues & Hors Périmètre Assumé (Cahier des charges §5.2)
          </h2>
          <p className="text-slate-600">
            Conformément aux arbitrages du sujet B14 :
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
            <li>L’outil ne constitue pas une certification ISO 27001 automatique ni un cabinet d'audit juridique.</li>
            <li>Il n'inclut pas de connecteur SIEM en temps réel ni de sonde de vulnérabilités automatique réseau (destiné à un usage de gouvernance et pilotage managérial).</li>
            <li>La gestion des incidents et des fournisseurs reste au niveau déclaratif dans la SoA et les plans d'action.</li>
          </ul>
        </section>

      </div>

    </div>
  );
};
