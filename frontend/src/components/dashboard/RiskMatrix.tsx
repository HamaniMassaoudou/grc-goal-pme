import React, { useState } from 'react';
import { Risk, RiskLevel } from '../../types/grc';
import { calculateRiskLevel } from '../../services/storage';

interface RiskMatrixProps {
  risks: Risk[];
  onSelectRisk?: (risk: Risk) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, onSelectRisk }) => {
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  // Échelles documentées (§7 EF-04)
  const probabilityLabels = [
    { value: 5, label: '5. Très forte (Hebdomadaire)' },
    { value: 4, label: '4. Forte (Mensuelle)' },
    { value: 3, label: '3. Moyenne (Annuelle)' },
    { value: 2, label: '2. Faible (Pluriannuelle)' },
    { value: 1, label: '1. Très faible (Exceptionnelle)' }
  ];

  const impactLabels = [
    { value: 1, label: '1. Négligeable' },
    { value: 2, label: '2. Mineur' },
    { value: 3, label: '3. Modéré' },
    { value: 4, label: '4. Majeur' },
    { value: 5, label: '5. Critique' }
  ];

  // Helper pour obtenir la classe de couleur de fond selon le seuil officiel B14
  const getCellBg = (p: number, i: number, isSelected: boolean) => {
    const score = p * i;
    const level = calculateRiskLevel(score);

    let base = '';
    switch (level) {
      case 'Critique':
        base = isSelected ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border-rose-300';
        break;
      case 'Élevé':
        base = isSelected ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-300';
        break;
      case 'Moyen':
        base = isSelected ? 'bg-yellow-500 text-slate-900 ring-2 ring-yellow-400' : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200 border-yellow-300';
        break;
      case 'Faible':
      default:
        base = isSelected ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-300';
        break;
    }
    return base;
  };

  const getRisksInCell = (p: number, i: number) => {
    return risks.filter(r => r.status !== 'clôturé' && r.probability === p && r.impact === i);
  };

  const selectedCellRisks = selectedCell ? getRisksInCell(selectedCell.p, selectedCell.i) : [];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Matrice d’évaluation des risques (5 × 5)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calcul automatique du Score = Probabilité × Impact · Seuils officiels B14
          </p>
        </div>

        {/* Légende épurée (sans pilules superflues) */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span>Faible (1-3)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 inline-block" />
            <span>Moyen (4-7)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Élevé (8-14)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>Critique (15-25)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Grille 5x5 */}
        <div className="lg:col-span-8 overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-1">
              Probabilité (P) ↑
            </div>

            <div className="space-y-1.5">
              {probabilityLabels.map((pRow) => (
                <div key={pRow.value} className="flex items-center gap-2">
                  <div className="w-24 text-[11px] font-medium text-slate-500 text-right truncate">
                    P{pRow.value}
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 flex-1">
                    {impactLabels.map((iCol) => {
                      const p = pRow.value;
                      const i = iCol.value;
                      const cellScore = p * i;
                      const inCell = getRisksInCell(p, i);
                      const isSelected = selectedCell?.p === p && selectedCell?.i === i;

                      return (
                        <button
                          key={`${p}-${i}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCell(null);
                            } else {
                              setSelectedCell({ p, i });
                            }
                          }}
                          className={`h-11 rounded-lg border text-center transition flex flex-col items-center justify-center relative p-1 cursor-pointer ${getCellBg(p, i, isSelected)}`}
                          title={`Score: ${cellScore} (P:${p} × I:${i}) - ${inCell.length} risque(s)`}
                        >
                          <span className="text-[10px] font-mono tabular-nums opacity-75 leading-none">
                            {cellScore}
                          </span>
                          {inCell.length > 0 && (
                            <span className={`text-xs font-bold font-mono tabular-nums mt-0.5 px-1 rounded ${
                              isSelected ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            }`}>
                              {inCell.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Axe X - Impact */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
              <div className="w-24 text-[10px] text-slate-400 text-right">Impact (I) →</div>
              <div className="grid grid-cols-5 gap-1.5 flex-1 text-center">
                {impactLabels.map((i) => (
                  <div key={i.value} className="text-[10px] font-medium text-slate-500 truncate" title={i.label}>
                    I{i.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Détail de la cellule sélectionnée ou aperçu rapide */}
        <div className="lg:col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200 min-h-[220px]">
          {selectedCell ? (
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Case P{selectedCell.p} × I{selectedCell.i} (Score {selectedCell.p * selectedCell.i})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Niveau : {calculateRiskLevel(selectedCell.p * selectedCell.i)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Fermer
                </button>
              </div>

              {selectedCellRisks.length === 0 ? (
                <p className="text-xs text-slate-500 italic mt-4 text-center">
                  Aucun risque ouvert ne correspond à cette combinaison P × I.
                </p>
              ) : (
                <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {selectedCellRisks.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => onSelectRisk && onSelectRisk(r)}
                      className="p-2 bg-white rounded border border-slate-200 hover:border-blue-400 cursor-pointer transition text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold font-mono text-[#0B3B7B]">{r.code}</span>
                        <span className="text-[10px] font-medium text-slate-500">Resp: {r.owner}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 truncate mt-0.5">{r.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p className="text-xs font-medium text-slate-700">Exploration interactive</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                Cliquez sur n’importe quelle case pour filtrer et afficher les risques associés.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">{risks.filter(r => r.status !== 'clôturé').length}</span> risques ouverts analysés
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
