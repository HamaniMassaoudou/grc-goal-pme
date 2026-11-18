import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  User,
  Activity,
  X
} from 'lucide-react';
import { SecurityAuditLog, SecurityEventType } from '../../types/auth';
import { exportAuditLogsToCSV } from '../../services/storage';

interface AuditLogsViewProps {
  logs: SecurityAuditLog[];
  canExport: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  canExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch = 
        l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || l.severity === severityFilter;
      const matchesEvent = eventFilter === 'all' || l.eventType === eventFilter;

      return matchesSearch && matchesSeverity && matchesEvent;
    });
  }, [logs, searchQuery, severityFilter, eventFilter]);

  const getSeverityBadge = (sev: 'info' | 'warning' | 'critical') => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">Critique</span>;
      case 'warning':
        return <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">Alerte</span>;
      case 'info':
      default:
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Info</span>;
    }
  };

  const handleExport = () => {
    exportAuditLogsToCSV(logs);
  };

  return (
    <div className="space-y-4">
      
      {/* En-tête */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0B3B7B]" />
            <span>Journal d’Audit de Sécurité & Traçabilité ({logs.length} événements)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique infalsifiable des connexions, privilèges attribués et opérations sensibles
          </p>
        </div>

        {canExport && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="Exporter l'audit log en CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par acteur, IP, détails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtre Gravité */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Toutes les gravités</option>
            <option value="info">Information</option>
            <option value="warning">Avertissement</option>
            <option value="critical">Critique</option>
          </select>

          {/* Filtre Type d'événement */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none max-w-[200px] truncate"
          >
            <option value="all">Tous les types d'événements</option>
            <option value="LOGIN_SUCCESS">Connexions réussies</option>
            <option value="LOGIN_FAILED">Échecs de connexion</option>
            <option value="ACCOUNT_LOCKED">Comptes verrouillés</option>
            <option value="ROLE_ASSIGNED">Attributions de rôles</option>
            <option value="USER_CREATED">Création de compte</option>
            <option value="USER_STATUS_CHANGED">Changement de statut</option>
            <option value="PASSWORD_RESET">Réinitialisations MDP</option>
            <option value="PERMISSION_DENIED">Accès refusés (403)</option>
          </select>
        </div>
      </div>

      {/* Tableau des Événements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucun événement ne correspond à vos filtres</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-3">Gravité</th>
                  <th className="py-3 px-3">Événement</th>
                  <th className="py-3 px-4">Acteur</th>
                  <th className="py-3 px-3">Cible</th>
                  <th className="py-3 px-4">Détails de l’opération</th>
                  <th className="py-3 px-3 text-right">Inspecter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/70 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] font-bold text-slate-800">
                      {log.eventType}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                      {log.targetResource}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={log.details}>
                      {log.details}
                    </td>

                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-400 hover:text-[#0B3B7B] hover:bg-slate-100 rounded transition"
                        title="Consulter les détails techniques"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale d'inspection d'un journal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0B3B7B]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Détail de l’Événement de Sécurité
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ID Événement :</span>
                <span className="font-mono text-slate-800">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Horodatage précis :</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gravité :</span>
                <span>{getSeverityBadge(selectedLog.severity)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Type :</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.eventType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Acteur :</span>
                <span className="text-slate-900 font-semibold">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Adresse IP source :</span>
                <span className="font-mono text-slate-800">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ressource cible :</span>
                <span className="font-mono text-slate-800">{selectedLog.targetResource}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 block mb-1">Message d'opération :</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
