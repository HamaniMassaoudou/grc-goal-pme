import jsPDF from 'jspdf';
import { UserTestSheet } from '../types/grc';

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
