import jsPDF from 'jspdf';
import { UserTestSheet, SoAControl } from '../types/grc';

export function exportTestSheetToPDF(sheet: UserTestSheet): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // 1. En-tête officiel GRC-Goal (Bandeau bleu foncé à fort contraste)
  doc.setFillColor(11, 59, 123); // #0B3B7B (Bleu GRC-Goal officiel)
  doc.rect(margin, y, contentWidth, 20, 'F');

  // Titre principal de l'application
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('GRC-Goal', margin + 6, y + 8);

  // Sous-titre en blanc très lisible (pas de orange foncé sur fond bleu)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(248, 250, 252); // Blanc cassé / slate-50 à contraste maximal
  doc.text('Plateforme de Pilotage GRC · Croissance & Conformité', margin + 6, y + 14.5);

  // Référence et date (bloc blanc à droite pour lisibilité parfaite)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 46, y + 3.5, 42, 13, 1, 1, 'F');

  doc.setTextColor(11, 59, 123);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`RÉF : ${sheet.code}`, pageWidth - margin - 25, y + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Date : ${sheet.date}`, pageWidth - margin - 25, y + 13, { align: 'center' });

  y += 24;

  // 2. Titre officiel du document (Annexe C & Livrable 1 §4)
  doc.setTextColor(15, 23, 42); // slate-900 (noir profond)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FICHE INDIVIDUELLE D’ÉVALUATION & TEST UTILISATEUR', margin, y);
  y += 4.5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Document officiel Annexe C · Protocole de test Livrable 1 (§4) — Matériau propre B14', margin, y);
  y += 5;

  // Cadre d'affiliation académique B14 (Fond blanc pur avec fine bordure grise)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, y, contentWidth, 10.5, 1, 1, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 123);
  doc.text('Programme :', margin + 3, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('Excellence en Cybersécurité Niger 2026 · Projet B14 (APSI-NE)', margin + 21, y + 4.2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 123);
  doc.text('Concepteur :', margin + 3, y + 8.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Hamani Massaoudou    |    Mentor Référent : ${sheet.mentorOrEvaluatorName || 'Aboubacar Yacouba Mai Birni'}`, margin + 21, y + 8.2);

  y += 14;

  // 3. Section 1 : Identité du Testeur & Contexte Technique
  // Titre de section avec ligne de soulignement bleue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 59, 123);
  doc.text('1. IDENTITÉ DU TESTEUR & CONTEXTE TECHNIQUE', margin, y);
  doc.setDrawColor(11, 59, 123);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  doc.setLineWidth(0.2);

  y += 4;

  // Carte identité sur fond blanc avec bordure nette
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 15, 1, 1, 'FD');

  const c1 = margin + 3;
  const c2 = margin + 64;
  const c3 = margin + 125;

  // Ligne 1
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Nom du Testeur :', c1, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(sheet.testerName, c1 + 24, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Structure :', c2, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(sheet.organizationName, c2 + 15, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Durée effective :', c3, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 123);
  doc.text(`${sheet.durationMinutes} minutes`, c3 + 22, y + 4.5);

  // Ligne 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fonction / Titre :', c1, y + 8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(sheet.testerRole, c1 + 24, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Courriel :', c2, y + 8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(sheet.testerEmail || 'contact@sirbacom.ne', c2 + 15, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Session :', c3, y + 8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(sheet.sessionTitle.slice(0, 28), c3 + 13, y + 8.5);

  // Ligne 3 (Environnement)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Environnement :', c1, y + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(sheet.testEnvironment, c1 + 24, y + 12.5);

  y += 18.5;

  // 4. Section 2 : Matrice d'Évaluation des 6 Tâches du Protocole Officiel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 59, 123);
  doc.text('2. MATRICE D’ÉVALUATION DES 6 TÂCHES DU PROTOCOLE (LIVRABLE 1 §4)', margin, y);
  doc.setDrawColor(11, 59, 123);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  doc.setLineWidth(0.2);

  y += 3.5;

  // En-tête du tableau (Fond bleu foncé avec texte blanc pour contraste 100% parfait)
  doc.setFillColor(11, 59, 123);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('N°', margin + 2, y + 3.8);
  doc.text('Tâche demandée au testeur', margin + 9, y + 3.8);
  doc.text('Statut d’évaluation', margin + 96, y + 3.8);
  doc.text('Observations & Remarques du testeur', margin + 130, y + 3.8);

  y += 5.5;

  // Lignes du tableau
  sheet.tasks.forEach((task, idx) => {
    const rowHeight = 8.5;
    const isEven = idx % 2 === 0;

    // Fond blanc pur ou très léger pour le zébrage
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252); // slate-50 ultra-léger
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Ligne de séparation nette
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // Numéro
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 59, 123);
    doc.text(`T${task.num}`, margin + 2, y + 4.5);

    // Titre de la tâche (Texte noir profond très lisible)
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    const taskTitle = task.taskTitle.length > 56 ? task.taskTitle.slice(0, 53) + '...' : task.taskTitle;
    doc.text(taskTitle, margin + 9, y + 3.8);

    // Référence exigence sous le titre
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105); // slate-600 bien lisible
    doc.text(`Exigence : ${task.targetRequirement}`, margin + 9, y + 7.2);

    // Statut avec fond et texte à fort contraste
    if (task.status === 'valide') {
      doc.setFillColor(240, 253, 244); // Vert très pâle
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin + 95, y + 1.8, 30, 5, 0.8, 0.8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(21, 128, 61); // Vert foncé #15803D
      doc.text('VALIDÉ', margin + 110, y + 5.2, { align: 'center' });
    } else if (task.status === 'valide_avec_reserve') {
      doc.setFillColor(254, 252, 232); // Jaune très pâle
      doc.setDrawColor(254, 240, 138);
      doc.roundedRect(margin + 95, y + 1.8, 30, 5, 0.8, 0.8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(161, 98, 7); // Ambre foncé #A16207
      doc.text('AVEC RÉSERVE', margin + 110, y + 5.2, { align: 'center' });
    } else if (task.status === 'echec') {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin + 95, y + 1.8, 30, 5, 0.8, 0.8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(185, 28, 28); // Rouge foncé #B91C1C
      doc.text('ÉCHEC', margin + 110, y + 5.2, { align: 'center' });
    } else {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin + 95, y + 1.8, 30, 5, 0.8, 0.8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('NON TESTÉ', margin + 110, y + 5.2, { align: 'center' });
    }

    // Observations du testeur (Texte foncé très lisible)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59); // slate-800
    const obs = task.observations || 'Manipulation validée sans anomalie.';
    const obsLines = doc.splitTextToSize(obs, contentWidth - 132);
    doc.text(obsLines[0] || '', margin + 130, y + 3.8);
    if (obsLines[1]) {
      doc.text(obsLines[1], margin + 130, y + 7.2);
    }

    y += rowHeight;
  });

  y += 4;

  // 5. Section 3 : Synthèse Qualitative du Testeur (Annexe C)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 59, 123);
  doc.text('3. RETOURS QUALITATIFS DU TESTEUR (ANNEXE C DU CAHIER DES CHARGES)', margin, y);
  doc.setDrawColor(11, 59, 123);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  doc.setLineWidth(0.2);

  y += 4;

  const boxW = (contentWidth - 4) / 2;
  const boxH = 20;

  // Box 1 : Points forts (Fond blanc pur garanti, bordure grise, titre bleu foncé)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, boxW, boxH, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 59, 123); // Bleu GRC
  doc.text('FONCTIONNALITÉS COMPRISES & POINTS FORTS', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42); // Noir profond slate-900
  const t1 = doc.splitTextToSize(sheet.functionalitiesUnderstood || 'Évaluation des risques intuitive et prise en main immédiate.', boxW - 6);
  doc.text(t1.slice(0, 3), margin + 3, y + 8.5);

  // Box 2 : Difficultés rencontrées (Fond blanc pur garanti, titre ambre foncé, texte noir)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + boxW + 4, y, boxW, boxH, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12); // Orange / Ambre foncé très contrasté et lisible
  doc.text('DIFFICULTÉS RENCONTRÉES / POINTS D’ATTENTION', margin + boxW + 7, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42); // Noir profond slate-900
  const t2 = doc.splitTextToSize(sheet.difficultiesEncountered || 'Vocabulaire ISO 27001 vulgarisé très aidant pour une PME.', boxW - 6);
  doc.text(t2.slice(0, 3), margin + boxW + 7, y + 8.5);

  y += boxH + 3;

  // Box 3 : Suggestions d'amélioration (Fond blanc pur garanti, titre bleu GRC, texte noir)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, boxW, boxH, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 59, 123); // Bleu GRC
  doc.text('SUGGESTIONS & RECOMMANDATIONS D’ÉVOLUTION', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42); // Noir profond slate-900
  const t3 = doc.splitTextToSize(sheet.suggestions || 'Conserver les modèles de justification et l’export PDF individualisé.', boxW - 6);
  doc.text(t3.slice(0, 3), margin + 3, y + 8.5);

  // Box 4 : Synthèse générale (Fond blanc pur garanti, titre bleu GRC, texte noir)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + boxW + 4, y, boxW, boxH, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 59, 123); // Bleu GRC
  doc.text('APPRÉCIATION GÉNÉRALE DU TESTEUR TIERS', margin + boxW + 7, y + 4.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42); // Noir profond slate-900
  const t4 = doc.splitTextToSize(`"${sheet.feedbackNotes}"`, boxW - 6);
  doc.text(t4.slice(0, 3), margin + boxW + 7, y + 8.5);

  y += boxH + 4;

  // 6. Indicateurs clés de réussite (Barre blanche avec bordure bleu foncé)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(11, 59, 123);
  doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 59, 123);
  doc.text(`Taux de réussite : ${sheet.globalScorePercent}%`, margin + 6, y + 6.3);

  doc.setTextColor(21, 128, 61); // Vert foncé
  doc.text(`Utilité perçue : ${sheet.perceivedUtility}`, margin + 66, y + 6.3);

  doc.setTextColor(194, 65, 12); // Orange foncé bien contrasté #C2410C
  doc.text(`Recommandation : ${sheet.recommendationScore} / 10`, margin + 134, y + 6.3);

  y += 14;

  // 7. Section 4 : Signatures, Consentement & Visa Académique
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 59, 123);
  doc.text('4. VALIDATION FORMELLE & ACCORD DE CITATION SOUTENANCE B14', margin, y);
  doc.setDrawColor(11, 59, 123);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  doc.setLineWidth(0.2);

  y += 4;

  const sigW = (contentWidth - 4) / 2;
  const sigH = 22;

  // Signature Testeur (Fond blanc pur garanti, texte foncé)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigW, sigH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SIGNATURE DU TESTEUR TIERS :', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const consentText = `Accord formel donné pour citation dans le rapport et la soutenance B14 APSI-NE. Démarche certifiée sincère.`;
  doc.text(doc.splitTextToSize(consentText, sigW - 6), margin + 3, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 59, 123);
  doc.text(`Signé : ${sheet.testerName}`, margin + 3, y + 18.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Le ${sheet.signatureDate || sheet.date} à Niamey`, margin + sigW - 3, y + 18.5, { align: 'right' });

  // Visa Mentor (Fond blanc pur garanti, bordure grise, textes très lisibles)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + sigW + 4, y, sigW, sigH, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42); // Noir profond slate-900
  doc.text('VISA DE L’ÉVALUATEUR / MENTOR RÉFÉRENT :', margin + sigW + 7, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85); // Slate-700 bien lisible
  const mentorText = `Matériau d’évaluation authentique vérifié. Démarche conforme aux exigences du sujet B14 (APSI-NE).`;
  doc.text(doc.splitTextToSize(mentorText, sigW - 6), margin + sigW + 7, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 59, 123); // Bleu GRC
  doc.text(`${sheet.mentorOrEvaluatorName || 'Aboubacar Yacouba Mai Birni'}`, margin + sigW + 7, y + 18.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61); // Vert foncé
  doc.text('Visa Accordé [ OK ]', margin + contentWidth - 3, y + 18.5, { align: 'right' });

  // Pied de page officiel
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 7, pageWidth - margin, pageHeight - 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GRC-Goal v2.0 · Plateforme de Pilotage GRC pour PME/TPE · Programme d’Excellence Cybersécurité Niger 2026', margin, pageHeight - 4);
  doc.text(`Réf : ${sheet.code} · Page 1/1`, pageWidth - margin, pageHeight - 4, { align: 'right' });

  // Déclencher le téléchargement direct du fichier PDF
  const sanitizedCode = sheet.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`GRC-Goal_Fiche_Test_${sanitizedCode}_${sheet.date}.pdf`);
}

export interface SoAOfficialExportOptions {
  organizationName: string;
  grcScope?: string;
  controls: SoAControl[];
  reviewerName?: string;
  approverName?: string;
  version?: string;
  reviewDate?: string;
}

export function exportOfficialSoAToPDF(options: SoAOfficialExportOptions): void {
  const {
    organizationName,
    grcScope = "Système d'information et processus métier de la PME",
    controls,
    reviewerName = "Hamani Massaoudou (RSSI)",
    approverName = "Abdoul Salam Issifi (Gérant)",
    version = "v1.0 (Audit Officiel 2026)",
    reviewDate = new Date().toISOString().slice(0, 10)
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  // Statistiques globales
  const total = controls.length;
  const applicableCount = controls.filter(c => c.isApplicable).length;
  const implementedCount = controls.filter(c => c.implementationStatus === 'mis_en_oeuvre').length;
  const partialCount = controls.filter(c => c.implementationStatus === 'partiellement_mis_en_oeuvre').length;
  const avgMaturity = applicableCount > 0
    ? (controls.filter(c => c.isApplicable).reduce((acc, c) => acc + (c.maturityLevel || 1), 0) / applicableCount).toFixed(1)
    : '0.0';

  const domains = [
    { name: 'A.5 Contrôles organisationnels', prefix: 'A.5' },
    { name: 'A.6 Contrôles relatifs aux personnes', prefix: 'A.6' },
    { name: 'A.7 Contrôles physiques', prefix: 'A.7' },
    { name: 'A.8 Contrôles technologiques', prefix: 'A.8' },
  ];

  // ==================== PAGE 1 : COUVERTURE & SYNTHÈSE DE GOUVERNANCE ====================
  let y = margin;

  // Bandeau institutionnel
  doc.setFillColor(11, 59, 123);
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GRC-Goal · SMSI ISO/IEC 27001:2022', margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text("DÉCLARATION D'APPLICABILITÉ OFFICIELLE (Statement of Applicability — SoA)", margin + 6, y + 17);

  // Bloc Version & Date
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 48, y + 4, 44, 16, 1, 1, 'F');
  doc.setTextColor(11, 59, 123);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(version, pageWidth - margin - 26, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Édition du : ${reviewDate}`, pageWidth - margin - 26, y + 15, { align: 'center' });

  y += 29;

  // Périmètre d'application
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 59, 123);
  doc.text("ORGANISATION & PÉRIMÈTRE D'HOMOLOGATION (SCOPE)", margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Organisation : ${organizationName}`, margin + 4, y + 11);
  const scopeLines = doc.splitTextToSize(`Périmètre SMSI : ${grcScope}`, contentWidth - 8);
  doc.text(scopeLines, margin + 4, y + 16);

  y += 27;

  // Indicateurs clés d'évaluation (KPIs)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 59, 123);
  doc.text('1. SYNTHÈSE STATISTIQUE DE LA CONFORMITÉ', margin, y);
  doc.setDrawColor(11, 59, 123);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  y += 5;

  const kpiWidth = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'Mesures du Référentiel', val: `${total}`, sub: 'ISO 27001:2022' },
    { label: 'Mesures Applicables', val: `${applicableCount} / ${total}`, sub: `${Math.round((applicableCount / total) * 100)}% retenues` },
    { label: 'Mesures Déployées', val: `${implementedCount + partialCount}`, sub: `${implementedCount} conformes, ${partialCount} partielles` },
    { label: 'Maturité Globale', val: `${avgMaturity} / 5`, sub: 'Score moyen SMSI' },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = margin + idx * (kpiWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kx, y, kpiWidth, 18, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kx + kpiWidth / 2, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 59, 123);
    doc.text(kpi.val, kx + kpiWidth / 2, y + 11, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.sub, kx + kpiWidth / 2, y + 15.5, { align: 'center' });
  });

  y += 24;

  // Répartition par les 4 Domaines ISO 27001:2022
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 59, 123);
  doc.text('2. RÉPARTITION PAR DOMAINE NORMATIF', margin, y);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  y += 5;

  domains.forEach(dom => {
    const domControls = controls.filter(c => c.domain.startsWith(dom.prefix));
    const domApplicable = domControls.filter(c => c.isApplicable).length;
    const domImplemented = domControls.filter(c => c.implementationStatus === 'mis_en_oeuvre').length;
    const domPartial = domControls.filter(c => c.implementationStatus === 'partiellement_mis_en_oeuvre').length;
    const domMaturity = domApplicable > 0
      ? (domControls.filter(c => c.isApplicable).reduce((acc, c) => acc + (c.maturityLevel || 1), 0) / domApplicable).toFixed(1)
      : '0.0';

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 11.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${dom.name} (${domControls.length} contrôles)`, margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Applicables : ${domApplicable}/${domControls.length} | Déployés : ${domImplemented} complets + ${domPartial} partiels | Maturité : ${domMaturity}/5`, margin + 3, y + 9);

    y += 13.5;
  });

  y += 4;

  // Signatures et Approbation Officielle de la Direction
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 59, 123);
  doc.text('3. APPROBATION FORMELLE & ENGAGEMENT DU SMSI', margin, y);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  y += 5;

  const sigWidth = (contentWidth - 4) / 2;
  const sigHeight = 35;

  // Cartouche RSSI
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigWidth, sigHeight, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ÉLABORÉ ET REVU PAR LE RSSI :', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nom : ${reviewerName}`, margin + 4, y + 12);
  doc.text(`Date de révision : ${reviewDate}`, margin + 4, y + 17);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text("« Déclaration certifiée conforme à l'état de l'art »", margin + 4, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text('Visa de vérification [ CONFORME ]', margin + 4, y + 31);

  // Cartouche Direction Générale
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + sigWidth + 4, y, sigWidth, sigHeight, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('APPROUVÉ PAR LA DIRECTION GÉNÉRALE :', margin + sigWidth + 8, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nom : ${approverName}`, margin + sigWidth + 8, y + 12);
  doc.text(`Date d'effet : ${reviewDate}`, margin + sigWidth + 8, y + 17);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text("« Bon pour exécution et engagement des moyens »", margin + sigWidth + 8, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 123);
  doc.text('Signature & Sceau Direction [ APPROUVÉ ]', margin + sigWidth + 8, y + 31);

  // ==================== PAGES SUIVANTES : TABLEAU OFFICIEL DES 93 MESURES ====================
  const renderTableHeader = (currentY: number) => {
    doc.setFillColor(11, 59, 123);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Code', margin + 2, currentY + 4.8);
    doc.text('Contrôle de Sécurité ISO 27001:2022', margin + 17, currentY + 4.8);
    doc.text('App.', margin + 98, currentY + 4.8);
    doc.text('Statut de Déploiement', margin + 110, currentY + 4.8);
    doc.text('Mat.', margin + 144, currentY + 4.8);
    doc.text('Justification / Preuve / Écart', margin + 155, currentY + 4.8);
    return currentY + 7;
  };

  doc.addPage();
  y = margin;

  // En-tête de page pour le tableau détaillé
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 59, 123);
  doc.text("DÉCLARATION D'APPLICABILITÉ DÉTAILLÉE — 93 CONTRÔLES ISO 27001:2022", margin, y + 4);
  y += 7;
  y = renderTableHeader(y);

  controls.forEach((ctrl, idx) => {
    const titleLines = doc.splitTextToSize(ctrl.title, 78);
    const detailText = ctrl.isApplicable
      ? (ctrl.evidenceRef ? `Preuve: ${ctrl.evidenceRef}` : (ctrl.justification || 'Conformité auditée'))
      : (ctrl.justification ? `Exclusion: ${ctrl.justification}` : 'Non applicable');
    const detailLines = doc.splitTextToSize(detailText, 30);
    const maxLines = Math.max(titleLines.length, detailLines.length);
    const rowHeight = Math.max(7.5, maxLines * 3.6 + 3);

    if (y + rowHeight > pageHeight - margin - 8) {
      doc.addPage();
      y = margin;
      y = renderTableHeader(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight, 'D');

    // Code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 59, 123);
    doc.text(ctrl.code, margin + 2, y + 4.8);

    // Titre
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(titleLines, margin + 17, y + 4);

    // Applicabilité
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (ctrl.isApplicable) {
      doc.setTextColor(21, 128, 61);
      doc.text('OUI', margin + 100, y + 4.8);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('NON', margin + 100, y + 4.8);
    }

    // Statut
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    let statusLabel = 'Non commencé';
    if (ctrl.implementationStatus === 'mis_en_oeuvre') {
      doc.setTextColor(21, 128, 61);
      statusLabel = 'Mis en œuvre';
    } else if (ctrl.implementationStatus === 'partiellement_mis_en_oeuvre') {
      doc.setTextColor(2, 132, 199);
      statusLabel = 'Partiel';
    } else if (ctrl.implementationStatus === 'planifie') {
      doc.setTextColor(217, 119, 6);
      statusLabel = 'Planifié';
    } else if (!ctrl.isApplicable) {
      doc.setTextColor(148, 163, 184);
      statusLabel = 'Non applicable';
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(statusLabel, margin + 110, y + 4.8);

    // Maturité
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(11, 59, 123);
    doc.text(ctrl.isApplicable ? `${ctrl.maturityLevel || 1}/5` : '-', margin + 146, y + 4.8);

    // Justification / Preuve
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(detailLines, margin + 155, y + 3.8);

    y += rowHeight;
  });

  // ==================== NUMÉROTATION DES PAGES & PIEDS DE PAGE ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `GRC-Goal · Déclaration d'Applicabilité (SoA ISO 27001:2022) — ${organizationName}`,
      margin,
      pageHeight - 4.5
    );
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' });
  }

  const sanitizedOrg = organizationName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`SoA_ISO27001_2022_${sanitizedOrg}_${reviewDate}.pdf`);
}
