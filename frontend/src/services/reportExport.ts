import { Organization, Risk, CorrectiveAction, SoAControl, Asset } from '../types/grc';

/**
 * Nettoie une chaîne pour un nom de fichier sécurisé
 */
function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

/**
 * Génère et déclenche le téléchargement du Rapport Exécutif GRC complet
 * sous forme de fichier HTML autonome, prêt pour l'impression ou l'export PDF.
 */
export function exportGRCReportHTML(
  organization: Organization,
  risks: Risk[],
  actions: CorrectiveAction[],
  soa: SoAControl[],
  assets: Asset[]
): void {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const openRisks = risks.filter(r => r.status !== 'clôturé');
  const criticalRisks = openRisks.filter(r => r.level === 'Critique');
  const highRisks = openRisks.filter(r => r.level === 'Élevé');
  const mediumRisks = openRisks.filter(r => r.level === 'Moyen');
  const lowRisks = openRisks.filter(r => r.level === 'Faible');

  const applicableControls = soa.filter(c => c.isApplicable);
  const implementedControls = applicableControls.filter(c => c.implementationStatus === 'mis_en_oeuvre');
  const soaRate = applicableControls.length > 0 
    ? Math.round((implementedControls.length / applicableControls.length) * 100) 
    : 0;

  const openActions = actions.filter(a => a.status !== 'cloturee' && a.status !== 'rejetee');
  const overdueActions = actions.filter(a => a.status === 'en_retard');
  const closedActions = actions.filter(a => a.status === 'cloturee');

  // Ventilation SoA par catégorie ISO 27001
  const categories: { key: string; name: string; domainPrefix: string; codePrefix: string }[] = [
    { key: 'A.5', name: 'Mesures Organisationnelles', domainPrefix: 'A.5', codePrefix: 'A.5' },
    { key: 'A.6', name: 'Mesures relatives aux Personnes', domainPrefix: 'A.6', codePrefix: 'A.6' },
    { key: 'A.7', name: 'Mesures Physiques', domainPrefix: 'A.7', codePrefix: 'A.7' },
    { key: 'A.8', name: 'Mesures Technologiques', domainPrefix: 'A.8', codePrefix: 'A.8' }
  ];

  const soaBreakdown = categories.map(cat => {
    const catControls = applicableControls.filter(c => 
      (c.domain && c.domain.startsWith(cat.domainPrefix)) || 
      (c.code && c.code.startsWith(cat.codePrefix))
    );
    const catImplemented = catControls.filter(c => c.implementationStatus === 'mis_en_oeuvre');
    const rate = catControls.length > 0 ? Math.round((catImplemented.length / catControls.length) * 100) : 0;
    return { ...cat, total: catControls.length, implemented: catImplemented.length, rate };
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Exécutif GRC & Conformité — ${organization.name}</title>
  <style>
    :root {
      --primary: #0B3B7B;
      --secondary: #F25C05;
      --text: #0f172a;
      --muted: #64748b;
      --bg: #ffffff;
      --border: #e2e8f0;
      --card-bg: #f8fafc;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text);
      background-color: #f1f5f9;
      line-height: 1.5;
      font-size: 13px;
      padding: 24px;
    }
    .page-container {
      max-width: 960px;
      margin: 0 auto;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    }
    .no-print-toolbar {
      max-width: 960px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0B3B7B;
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(11, 59, 123, 0.2);
    }
    .no-print-toolbar button {
      background: #ffffff;
      color: #0B3B7B;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .no-print-toolbar button:hover {
      background: #f1f5f9;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid var(--primary);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .logo-grc { color: var(--primary); }
    .logo-goal { color: var(--secondary); }
    .header-meta {
      text-align: right;
      font-size: 12px;
    }
    .header-meta h1 {
      font-size: 16px;
      color: var(--primary);
      font-weight: 800;
      margin-bottom: 4px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-critical { background: #ffe4e6; color: #e11d48; }
    .badge-high { background: #ffedd5; color: #ea580c; }
    .badge-medium { background: #fef9c3; color: #ca8a04; }
    .badge-low { background: #dcfce7; color: #16a34a; }
    .badge-primary { background: #e0e7ff; color: #3730a3; }
    
    .grid-kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .kpi-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      font-family: monospace;
      color: var(--primary);
      margin: 6px 0;
    }
    .kpi-sub {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
    }
    
    section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    h2 {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-bottom: 14px;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 8px;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      color: var(--muted);
      border-bottom: 2px solid var(--border);
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #fafaf9;
    }
    .soa-breakdown-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    .soa-cat-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px;
      background: #ffffff;
    }
    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 6px;
    }
    .progress-bar-fill {
      height: 100%;
      background: #0B3B7B;
      border-radius: 4px;
    }
    .signatures-block {
      margin-top: 40px;
      border-top: 2px solid var(--border);
      padding-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px dashed var(--border);
      border-radius: 6px;
      padding: 16px;
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-role {
      font-weight: 700;
      font-size: 12px;
      color: var(--primary);
    }
    .sig-name {
      font-size: 12px;
      color: var(--muted);
    }
    footer {
      margin-top: 32px;
      text-align: center;
      font-size: 11px;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 16px;
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
        font-size: 11px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print-toolbar {
        display: none !important;
      }
      @page {
        margin: 1.5cm;
      }
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- Barre d'outils d'impression (masquée sur papier / PDF) -->
  <div class="no-print-toolbar">
    <div>
      <strong>GRC-Goal · Rapport Exécutif Généré</strong>
      <div style="font-size: 11px; opacity: 0.9;">Document complet pour ${organization.name}</div>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimer / Sauvegarder en PDF
      </button>
    </div>
  </div>

  <div class="page-container">
    <header>
      <div class="logo-container">
        <div>
          <div class="logo-text">
            <span class="logo-grc">GRC-</span><span class="logo-goal">Goal</span>
          </div>
          <div style="font-size: 12px; color: var(--muted); font-weight: 500;">
            Gouvernance, Risques & Conformité · PME / TPE
          </div>
        </div>
      </div>

      <div class="header-meta">
        <h1>RAPPORT EXÉCUTIF DE SYNTHÈSE</h1>
        <div><strong>Organisation :</strong> ${organization.name}</div>
        <div><strong>Secteur :</strong> ${organization.sector} · ${organization.size}</div>
        <div><strong>Date d'édition :</strong> ${currentDate} à ${currentTime}</div>
        <div style="color: var(--primary); font-weight: 700; margin-top: 4px;">
          Programme APSI-NE · Sujet B14
        </div>
      </div>
    </header>

    <!-- KPIs Clés -->
    <div class="grid-kpis">
      <div class="kpi-card">
        <div class="kpi-title">Risques Ouverts</div>
        <div class="kpi-value">${openRisks.length}</div>
        <div class="kpi-sub" style="color: #e11d48;">${criticalRisks.length} critiques · ${highRisks.length} élevés</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">Conformité SoA ISO 27001</div>
        <div class="kpi-value">${soaRate}%</div>
        <div class="kpi-sub">${implementedControls.length} / ${applicableControls.length} mesures conformes</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">Actions de Remédiation</div>
        <div class="kpi-value">${openActions.length}</div>
        <div class="kpi-sub">${overdueActions.length} en retard · ${closedActions.length} clôturées</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">Actifs Clés Identifiés</div>
        <div class="kpi-value">${assets.length}</div>
        <div class="kpi-sub">Périmètre cartographié</div>
      </div>
    </div>

    <!-- Section 1 : Registre des Risques Prioritaires -->
    <section>
      <h2>
        <span>1. Registre des Risques Prioritaires (${openRisks.length} ouverts)</span>
      </h2>
      <table>
        <thead>
          <tr>
            <th style="width: 70px;">Code</th>
            <th>Intitulé du Risque</th>
            <th>Actif Associé</th>
            <th style="text-align: center; width: 60px;">Score</th>
            <th style="width: 80px;">Niveau</th>
            <th style="width: 90px;">Stratégie</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          ${openRisks.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 16px; color: var(--muted);">Aucun risque ouvert dans le périmètre actif.</td></tr>' : ''}
          ${openRisks.map(r => {
            const asset = assets.find(a => a.id === r.assetId);
            const badgeClass = r.level === 'Critique' ? 'badge-critical' : r.level === 'Élevé' ? 'badge-high' : r.level === 'Moyen' ? 'badge-medium' : 'badge-low';
            return `
              <tr>
                <td style="font-weight: bold; font-family: monospace; color: var(--primary);">${r.code}</td>
                <td>
                  <strong>${r.title}</strong>
                  <div style="font-size: 11px; color: var(--muted);">${r.description ? r.description.slice(0, 100) + '...' : ''}</div>
                </td>
                <td>${asset ? asset.name : 'N/A'}</td>
                <td style="text-align: center; font-weight: bold; font-family: monospace;">${r.score}</td>
                <td><span class="badge ${badgeClass}">${r.level}</span></td>
                <td style="text-transform: capitalize;">${r.strategy}</td>
                <td>${r.owner}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </section>

    <!-- Section 2 : Plan d'Actions de Remédiation -->
    <section>
      <h2>
        <span>2. Plan d'Actions de Remédiation (${actions.length} actions tracées)</span>
      </h2>
      <table>
        <thead>
          <tr>
            <th style="width: 70px;">Code</th>
            <th>Action Corrective</th>
            <th style="width: 70px;">Priorité</th>
            <th>Responsable</th>
            <th style="width: 85px;">Échéance</th>
            <th style="width: 90px;">Statut</th>
            <th>Preuve / Livrable</th>
          </tr>
        </thead>
        <tbody>
          ${actions.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 16px; color: var(--muted);">Aucune action enregistrée pour le moment.</td></tr>' : ''}
          ${actions.map(a => {
            const statusLabel = a.status === 'cloturee' ? 'Clôturée' : a.status === 'en_retard' ? 'En retard' : a.status === 'en_cours' ? 'En cours' : a.status === 'a_faire' ? 'À faire' : 'Rejetée';
            const badgeClass = a.status === 'cloturee' ? 'badge-low' : a.status === 'en_retard' ? 'badge-critical' : 'badge-primary';
            return `
              <tr>
                <td style="font-weight: bold; font-family: monospace;">${a.code}</td>
                <td><strong>${a.title}</strong></td>
                <td><span class="badge ${a.priority === 'Critique' || a.priority === 'Haute' ? 'badge-high' : 'badge-low'}">${a.priority}</span></td>
                <td>${a.owner}</td>
                <td style="font-family: monospace;">${a.dueDate}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td style="color: var(--muted); font-size: 11px;">${a.evidenceOfClosure || 'En cours de formalisation'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </section>

    <!-- Section 3 : Déclaration d'Applicabilité (SoA) ISO 27001:2022 -->
    <section>
      <h2>
        <span>3. Déclaration d'Applicabilité ISO/IEC 27001:2022 (Taux global : ${soaRate}%)</span>
      </h2>
      <p style="color: var(--muted); margin-bottom: 12px;">
        Sur les <strong>93 mesures</strong> de référence de l’Annexe A, <strong>${applicableControls.length}</strong> sont applicables aux activités de <strong>${organization.name}</strong>. Actuellement, <strong>${implementedControls.length}</strong> mesures sont entièrement conformes et documentées avec preuves opérationnelles.
      </p>

      <div class="soa-breakdown-grid">
        ${soaBreakdown.map(cat => `
          <div class="soa-cat-card">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong>${cat.name} (${cat.key})</strong>
              <span style="font-weight: 800; font-family: monospace; color: var(--primary);">${cat.rate}%</span>
            </div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
              ${cat.implemented} conformes sur ${cat.total} applicables
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${cat.rate}%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 4 : Cartographie des Actifs Clés -->
    <section>
      <h2>
        <span>4. Cartographie des Actifs Essentiels (${assets.length} actifs répertoriés)</span>
      </h2>
      <table>
        <thead>
          <tr>
            <th style="width: 70px;">ID</th>
            <th>Nom de l'Actif</th>
            <th>Catégorie</th>
            <th>Criticité</th>
            <th>Propriétaire</th>
          </tr>
        </thead>
        <tbody>
          ${assets.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 16px; color: var(--muted);">Aucun actif cartographié.</td></tr>' : ''}
          ${assets.map(asset => `
            <tr>
              <td style="font-weight: bold; font-family: monospace;">${asset.id.slice(0, 8)}</td>
              <td><strong>${asset.name}</strong></td>
              <td style="text-transform: capitalize;">${asset.category || 'Système'}</td>
              <td><span class="badge ${asset.criticality === 'Critique' ? 'badge-critical' : asset.criticality === 'Élevée' ? 'badge-high' : 'badge-low'}">${asset.criticality || 'Moyenne'}</span></td>
              <td>${asset.owner || 'Direction'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>

    <!-- Bloc d'approbation et signatures formelles -->
    <div class="signatures-block">
      <div class="sig-box">
        <div>
          <div class="sig-role">Le Référent GRC & Sécurité :</div>
          <div class="sig-name">Hamani Massaoudou (Participant Sujet B14)</div>
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 10px; color: var(--muted);">
          Date et visa pour conformité : ____________________
        </div>
      </div>

      <div class="sig-box">
        <div>
          <div class="sig-role">La Direction Générale / Testeur PME :</div>
          <div class="sig-name">${organization.name} — Direction</div>
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 10px; color: var(--muted);">
          Date et mention « Bon pour validation » : ____________________
        </div>
      </div>
    </div>

    <footer>
      GRC-Goal · Plateforme Opérationnelle de Pilotage GRC pour TPE/PME · Programme d'Excellence Cybersécurité Niger 2026 · Sujet B14
    </footer>
  </div>

  <script>
    // Message de confirmation au chargement autonome
    window.addEventListener('DOMContentLoaded', () => {
      console.log('Rapport GRC-Goal chargé avec succès pour ${organization.name}');
    });
  </script>
</body>
</html>`;

  // Création du Blob et téléchargement direct
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const safeOrgName = sanitizeFilename(organization.name);
  const fileDate = new Date().toISOString().slice(0, 10);
  
  downloadLink.href = url;
  downloadLink.download = `Rapport_GRC_Goal_${safeOrgName}_${fileDate}.html`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Nettoyage après déclenchement
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Exporte le rapport au format CSV tabulaire
 */
export function exportGRCReportCSV(
  organization: Organization,
  risks: Risk[],
  actions: CorrectiveAction[]
): void {
  const headers = ['Type', 'Code', 'Titre', 'Actif/Responsable', 'Score/Priorité', 'Statut', 'Date'];
  
  const riskRows = risks.map(r => [
    'RISQUE',
    `"${r.code}"`,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${(r.owner || '').replace(/"/g, '""')}"`,
    r.score,
    `"${r.level}"`,
    `"${r.updatedAt || ''}"`
  ]);

  const actionRows = actions.map(a => [
    'ACTION',
    `"${a.code}"`,
    `"${a.title.replace(/"/g, '""')}"`,
    `"${(a.owner || '').replace(/"/g, '""')}"`,
    `"${a.priority}"`,
    `"${a.status}"`,
    `"${a.dueDate}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...riskRows.map(r => r.join(',')), ...actionRows.map(a => a.join(','))].join('\n');
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  const safeOrgName = sanitizeFilename(organization.name);
  const fileDate = new Date().toISOString().slice(0, 10);
  
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Synthese_GRC_${safeOrgName}_${fileDate}.csv`);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 300);
}
