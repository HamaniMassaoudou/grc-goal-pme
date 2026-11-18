import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  CheckSquare, 
  ListTodo, 
  Boxes, 
  Building, 
  ClipboardCheck, 
  BookOpen, 
  Users,
  Lock,
  Activity,
  Bell
} from 'lucide-react';
import { Risk, CorrectiveAction, SoAControl } from '../../types/grc';
import { UserAccount, RoleDefinition, ModuleResource } from '../../types/auth';
import { hasPermission } from '../../services/security';

interface SidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  risks: Risk[];
  actions: CorrectiveAction[];
  soa: SoAControl[];
  currentUser: UserAccount | null;
  roles: RoleDefinition[];
  accountsCount: number;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onNavigate,
  risks,
  actions,
  soa,
  currentUser,
  roles,
  accountsCount,
  unreadNotificationsCount = 0
}) => {
  const criticalRisksCount = risks.filter(r => r.status !== 'clôturé' && (r.level === 'Critique' || r.level === 'Élevé')).length;
  const overdueActionsCount = actions.filter(a => a.status === 'en_retard').length;
  
  const applicableControls = soa.filter(c => c.isApplicable);
  const implementedCount = applicableControls.filter(c => c.implementationStatus === 'mis_en_oeuvre').length;
  const soaRate = applicableControls.length > 0 ? Math.round((implementedCount / applicableControls.length) * 100) : 0;

  // Définition des modules et vérification des permissions RBAC
  const canViewDashboard = hasPermission(currentUser, roles, 'dashboard', 'view');
  const canViewRisks = hasPermission(currentUser, roles, 'risks', 'view');
  const canViewSoA = hasPermission(currentUser, roles, 'soa', 'view');
  const canViewActions = hasPermission(currentUser, roles, 'actions', 'view');
  const canViewAssets = hasPermission(currentUser, roles, 'assets', 'view');
  const canViewGovernance = hasPermission(currentUser, roles, 'governance', 'view');
  const canViewIam = hasPermission(currentUser, roles, 'users', 'view') || hasPermission(currentUser, roles, 'roles', 'view') || hasPermission(currentUser, roles, 'audit_logs', 'view');
  const canViewTestProtocol = hasPermission(currentUser, roles, 'test_protocol', 'view');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      description: 'KPIs, matrice 5x5 & synthèse',
      icon: LayoutDashboard,
      allowed: canViewDashboard,
      badge: null
    },
    {
      id: 'risks',
      label: 'Registre des risques',
      description: 'Évaluation P × I & traitement',
      icon: ShieldAlert,
      allowed: canViewRisks,
      badge: criticalRisksCount > 0 ? {
        text: `${criticalRisksCount} critiques/élevés`,
        color: 'text-amber-700 bg-amber-50'
      } : null
    },
    {
      id: 'soa',
      label: 'Déclaration (SoA)',
      description: '93 mesures ISO 27001:2022',
      icon: CheckSquare,
      allowed: canViewSoA,
      badge: {
        text: `${soaRate}% appliqué`,
        color: 'text-blue-700 bg-blue-50'
      }
    },
    {
      id: 'actions',
      label: 'Plan d’actions',
      description: 'Remédiation « écart → preuve »',
      icon: ListTodo,
      allowed: canViewActions,
      badge: overdueActionsCount > 0 ? {
        text: `${overdueActionsCount} en retard`,
        color: 'text-rose-700 bg-rose-50'
      } : null
    },
    {
      id: 'assets',
      label: 'Actifs informationnels',
      description: 'Inventaire matériel & logiciel',
      icon: Boxes,
      allowed: canViewAssets,
      badge: null
    },
    {
      id: 'iam',
      label: 'Accès, IAM & Sécurité',
      description: 'Utilisateurs, Rôles RBAC & Audit',
      icon: Users,
      allowed: canViewIam,
      badge: {
        text: `${accountsCount} comptes`,
        color: 'text-[#0B3B7B] bg-blue-50 font-bold'
      }
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Alertes, tâches & suivi',
      icon: Bell,
      allowed: true,
      badge: unreadNotificationsCount > 0 ? {
        text: `${unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount} non lues`,
        color: 'text-rose-700 bg-rose-50 font-bold'
      } : null
    },
    {
      id: 'governance',
      label: 'Gouvernance & Périmètre',
      description: 'Organisation, rôles & politique',
      icon: Building,
      allowed: canViewGovernance,
      badge: null
    },
    {
      id: 'test-protocol',
      label: 'Fiches de Test & Protocole',
      description: 'Évaluations par utilisateur & PDF',
      icon: ClipboardCheck,
      allowed: canViewTestProtocol,
      badge: {
        text: 'Annexe C · PDF',
        color: 'text-orange-700 bg-orange-50 font-bold'
      }
    },
    {
      id: 'documentation',
      label: 'Notice d’utilisation',
      description: 'Guide pratique pour PME/TPE',
      icon: BookOpen,
      allowed: true,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Modules Métier GRC
          </p>
          <div className="space-y-1">
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isAllowed = item.allowed;

              return (
                <button
                  key={item.id}
                  title={!isAllowed ? 'Accès restreint RBAC' : item.description}
                  onClick={() => {
                    if (isAllowed) {
                      onNavigate(item.id);
                    } else {
                      alert("Accès refusé par la politique RBAC : Votre rôle ne dispose pas des privilèges nécessaires pour consulter ce module.");
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition group ${
                    !isAllowed
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : isActive
                        ? 'bg-blue-50/80 text-[#0B3B7B]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="shrink-0 relative">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3B7B]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!isAllowed && (
                      <Lock className="w-2.5 h-2.5 text-rose-500 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold truncate block ${isActive ? 'text-[#0B3B7B]' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Cadrage & Livrables
          </p>
          <div className="space-y-1">
            {navItems.slice(7).map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isAllowed = item.allowed;

              return (
                <button
                  key={item.id}
                  title={!isAllowed ? 'Accès restreint RBAC' : item.description}
                  onClick={() => {
                    if (isAllowed) {
                      onNavigate(item.id);
                    } else {
                      alert("Accès refusé par la politique RBAC.");
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition group ${
                    !isAllowed
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : isActive
                        ? 'bg-blue-50/80 text-[#0B3B7B]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="shrink-0 relative">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3B7B]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!isAllowed && (
                      <Lock className="w-2.5 h-2.5 text-rose-500 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold truncate block ${isActive ? 'text-[#0B3B7B]' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cadre de statut utilisateur & session */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-start gap-2 text-[11px] text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div className="space-y-0.5 leading-snug min-w-0">
            <p className="font-semibold text-slate-700 truncate">
              {currentUser?.name || 'Session invité'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              Rôle actif : {roles.find(r => currentUser?.roleIds.includes(r.id))?.name || 'Lecteur'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
