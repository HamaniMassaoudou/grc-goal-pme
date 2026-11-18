import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  RotateCcw,
  ChevronDown,
  LogOut,
  Smartphone,
  Lock,
  Users,
  Bell,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { Organization } from '../../types/grc';
import { UserAccount, RoleDefinition } from '../../types/auth';
import { AppNotification } from '../../types/notification';

interface HeaderProps {
  organization: Organization;
  organizations?: Organization[];
  onSwitchOrganization?: (orgId: string) => void;
  onOpenCreateOrganization?: () => void;
  accounts: UserAccount[];
  roles: RoleDefinition[];
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
  onOpenTestScenario: () => void;
  onOpenReport: () => void;
  onResetData: () => void;
  onLogout: () => void;
  activeModule: string;
  onNavigate: (module: string) => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  organization,
  organizations = [organization],
  onSwitchOrganization = () => {},
  onOpenCreateOrganization = () => {},
  accounts,
  roles,
  currentUser,
  onSelectUser,
  onOpenTestScenario,
  onOpenReport,
  onResetData,
  onLogout,
  activeModule,
  onNavigate,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onMarkAllNotificationsAsRead = () => {}
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);

  // Filtrage strict des notifications destinées à l'utilisateur connecté
  const userNotifications = notifications
    .filter(n => n.recipientUserId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  // Trouver les rôles de l'utilisateur
  const userRoles = roles.filter(r => currentUser.roleIds.includes(r.id));
  const primaryRole = userRoles[0] || { name: 'Utilisateur', color: 'bg-slate-600' };

  // Filtrer les organisations accessibles à cet utilisateur (Super admin voit tout)
  const isSuperAdmin = currentUser.roleIds.includes('role-super-admin');
  const userOrgs = isSuperAdmin 
    ? organizations 
    : organizations.filter(o => 
        (currentUser.organizationIds || [currentUser.organizationId]).includes(o.id) ||
        o.id === currentUser.organizationId
      );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1 : Identité & Marque GRC-Goal */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 text-left group transition"
            >
              <img 
                src="/assets/aistudio/Logo_GRC-Goal___croissance_et_conformit__dd12a5d7.png" 
                alt="GRC-Goal Logo" 
                className="h-10 w-auto object-contain rounded"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-lg text-[#0B3B7B] tracking-tight">GRC-</span>
                  <span className="font-extrabold text-lg text-[#F25C05] tracking-tight">Goal</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
                  Pilotez votre GRC · TPE & PME
                </p>
              </div>
            </button>

            {/* Séparateur discret */}
            <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

            {/* Sélecteur / Switcher d'Organisation Interactive */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowOrgMenu(!showOrgMenu);
                  if (showUserMenu) setShowUserMenu(false);
                  if (showNotifMenu) setShowNotifMenu(false);
                }}
                className={`flex items-center gap-2 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-lg transition text-left ${
                  showOrgMenu ? 'ring-2 ring-[#0B3B7B]/20 bg-blue-50/50' : ''
                }`}
                title="Changer d'organisation ou en créer une"
                aria-expanded={showOrgMenu}
              >
                <div className="w-5 h-5 rounded bg-[#0B3B7B]/10 text-[#0B3B7B] flex items-center justify-center font-bold text-[10px] shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <div className="leading-tight max-w-[160px] sm:max-w-[200px]">
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                    <span>{organization.name}</span>
                    {organization.isDemo && (
                      <span className="text-[9px] font-bold bg-blue-100 text-[#0B3B7B] px-1 rounded">
                        Démo
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {organization.sector.split(',')[0]}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showOrgMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu déroulant des organisations */}
              {showOrgMenu && (
                <div 
                  className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowOrgMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Organisations Autorisées
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        {isSuperAdmin ? 'Accès Super-Administrateur (Toutes)' : `${userOrgs.length} espace(s) disponible(s)`}
                      </p>
                    </div>
                    {userOrgs.length > 1 && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                        Multi-tenant
                      </span>
                    )}
                  </div>

                  {/* Liste des organisations */}
                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {userOrgs.map(org => {
                      const isCurrent = org.id === organization.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => {
                            if (!isCurrent) {
                              onSwitchOrganization(org.id);
                            }
                            setShowOrgMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                            isCurrent 
                              ? 'bg-blue-50/80 border border-blue-200/80 text-[#0B3B7B] font-bold' 
                              : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCurrent ? 'bg-[#0B3B7B] text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div className="truncate font-bold flex items-center gap-1.5">
                                <span>{org.name}</span>
                                {org.isDemo && (
                                  <span className="text-[9px] font-semibold text-blue-600 bg-blue-100/70 px-1 rounded">
                                    Démo B14
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {org.sector.split(',')[0]} · {org.size}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-emerald-600 font-bold shrink-0 text-xs">Actif</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Boutons d'action : Créer une organisation & Gérer */}
                  <div className="p-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowOrgMenu(false);
                        onOpenCreateOrganization();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition justify-center shadow-xs"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>+ Créer une nouvelle organisation</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowOrgMenu(false);
                        onNavigate('governance');
                      }}
                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                    >
                      <span>Gérer la fiche & les collaborateurs</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Zone 3 : Actions primaires & Switcher de rôle utilisateur */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Bouton Rapport Synthétique */}
            <button
              onClick={onOpenReport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs whitespace-nowrap"
              title="Générer la synthèse GRC imprimable"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Rapport GRC</span>
            </button>

            {/* Icône de Notification (Cloche) avec badge dynamique */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (showUserMenu) setShowUserMenu(false);
                }}
                className={`relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-[#0B3B7B] ${
                  showNotifMenu || activeModule === 'notifications' ? 'bg-blue-50 text-[#0B3B7B]' : ''
                }`}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={showNotifMenu}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-75"
                    aria-label={`${unreadCount} notifications non lues`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Popover / Menu rapide des notifications */}
              {showNotifMenu && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowNotifMenu(false)}
                >
                  {/* Entête du popover */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-blue-100 text-[#0B3B7B] px-1.5 py-0.2 rounded-full">
                          {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllNotificationsAsRead();
                        }}
                        className="text-[11px] font-semibold text-[#0B3B7B] hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Tout marquer lu</span>
                      </button>
                    )}
                  </div>

                  {/* Liste des dernières notifications */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <span>Aucune notification</span>
                      </div>
                    ) : (
                      userNotifications.slice(0, 5).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) {
                              onMarkNotificationAsRead(notif.id);
                            }
                            if (notif.targetModule) {
                              onNavigate(notif.targetModule);
                            } else {
                              onNavigate('notifications');
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ${
                            !notif.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="mt-1 shrink-0">
                            {!notif.isRead ? (
                              <span className="w-2 h-2 rounded-full bg-blue-600 block ring-2 ring-blue-100" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {notif.title}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                notif.priority === 'critique' ? 'bg-rose-100 text-rose-700' :
                                notif.priority === 'haute' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {notif.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pied de page du popover */}
                  <div className="px-3 pt-2 pb-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onNavigate('notifications');
                        setShowNotifMenu(false);
                      }}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-[#0B3B7B] bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Consulter toutes les notifications</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Utilisateur / Profil */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
                aria-expanded={showUserMenu}
              >
                <div className={`w-7 h-7 rounded-md ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="hidden xl:block leading-tight text-xs pr-1">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-slate-500 text-[10px] truncate max-w-[120px]">{primaryRole.name}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Compte Authentifié</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {userRoles.map(r => (
                        <span key={r.id} className={`text-[10px] text-white font-bold px-1.5 py-0.2 rounded ${r.color}`}>
                          {r.name}
                        </span>
                      ))}
                      {currentUser.mfaEnabled && (
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-0.5">
                          <Smartphone className="w-2.5 h-2.5" />
                          <span>MFA</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accès rapide au module IAM */}
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <button
                      onClick={() => {
                        onNavigate('iam');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#0B3B7B] font-semibold hover:bg-blue-50 rounded transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Gérer les Utilisateurs & Rôles</span>
                    </button>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Tester sous un autre profil RBAC
                    </p>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {accounts.map(u => {
                        const rName = roles.find(r => u.roleIds.includes(r.id))?.name || 'Rôle';
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition ${
                              isCurrent
                                ? 'bg-blue-50 text-[#0B3B7B] font-semibold' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                              {u.firstName[0]}
                            </div>
                            <div className="truncate flex-1">
                              <div className="truncate">{u.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{rName}</div>
                            </div>
                            {u.status === 'suspendu' && (
                              <span className="text-[9px] text-rose-600 bg-rose-50 px-1 rounded font-bold">
                                Bloqué
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-3 py-1 space-y-1">
                    <button
                      onClick={() => {
                        if (window.confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration B14 ?')) {
                          onResetData();
                          setShowUserMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Réinitialiser les données démo</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Se déconnecter de la session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
