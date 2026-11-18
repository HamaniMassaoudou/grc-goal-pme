import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Search, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Inbox,
  ShieldCheck,
  Building
} from 'lucide-react';
import { AppNotification, NotificationPriority, NotificationCategory } from '../../types/notification';
import { UserAccount } from '../../types/auth';

interface NotificationsViewProps {
  currentUser: UserAccount;
  notifications: AppNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAsUnread: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClearReadNotifications: () => void;
  onNavigateToResource: (module: string, resourceId?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearReadNotifications,
  onNavigateToResource
}) => {
  // Filtres
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filtrage strict par utilisateur connecté (RBAC / isolation)
  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.recipientUserId === currentUser.id);
  }, [notifications, currentUser.id]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const criticalCount = useMemo(() => {
    return userNotifications.filter(n => n.priority === 'critique').length;
  }, [userNotifications]);

  // Filtrage combiné (Recherche, Statut, Catégorie, Priorité)
  const filteredNotifications = useMemo(() => {
    return userNotifications.filter(n => {
      // Filtre de statut
      if (statusFilter === 'unread' && n.isRead) return false;
      if (statusFilter === 'read' && !n.isRead) return false;

      // Filtre de catégorie
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

      // Filtre de priorité
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;

      // Recherche textuelle
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        const matchesCategory = n.category.toLowerCase().includes(query);
        return matchesTitle || matchesMessage || matchesCategory;
      }

      return true;
    });
  }, [userNotifications, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  // Calculs de pagination
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper de formatage de date
  const formatNotificationDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let relative = '';
      if (diffMinutes < 1) relative = 'À l’instant';
      else if (diffMinutes < 60) relative = `Il y a ${diffMinutes} min`;
      else if (diffHours < 24) relative = `Il y a ${diffHours} h`;
      else if (diffDays === 1) relative = 'Hier';
      else relative = `Il y a ${diffDays} jours`;

      const exact = date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return { relative, exact };
    } catch {
      return { relative: 'Date inconnue', exact: '' };
    }
  };

  // Badges visuels par priorité
  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'critique':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Critique</span>
          </span>
        );
      case 'haute':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Haute</span>
          </span>
        );
      case 'moyenne':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span>Moyenne</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span>Information</span>
          </span>
        );
    }
  };

  // Icône & libellé par catégorie
  const getCategoryMeta = (cat: NotificationCategory) => {
    switch (cat) {
      case 'risques':
        return {
          label: 'Risques de Sécurité',
          icon: ShieldAlert,
          color: 'text-rose-600 bg-rose-50 border-rose-100'
        };
      case 'actions':
        return {
          label: 'Plan d’Actions',
          icon: Clock,
          color: 'text-amber-600 bg-amber-50 border-amber-100'
        };
      case 'soa':
        return {
          label: 'SoA ISO 27001',
          icon: ShieldCheck,
          color: 'text-blue-600 bg-blue-50 border-blue-100'
        };
      case 'iam':
        return {
          label: 'Sécurité & IAM',
          icon: Lock,
          color: 'text-purple-600 bg-purple-50 border-purple-100'
        };
      case 'gouvernance':
      default:
        return {
          label: 'Gouvernance',
          icon: Building,
          color: 'text-slate-600 bg-slate-100 border-slate-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-[#0B3B7B] rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Centre de Notifications
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Alertes opérationnelles, risques prioritaires et tâches assignées à <strong className="text-slate-700">{currentUser.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'actions globales */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B3B7B] bg-blue-50 border border-blue-200/80 rounded-lg hover:bg-blue-100/70 transition shadow-xs whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout marquer comme lu</span>
            </button>
          )}

          {userNotifications.some(n => n.isRead) && (
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous supprimer toutes les notifications déjà lues ?')) {
                  onClearReadNotifications();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs whitespace-nowrap"
              title="Supprimer les notifications déjà consultées"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Purger les lues</span>
            </button>
          )}
        </div>
      </div>

      {/* Cartes statistiques rapides (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total reçues</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {userNotifications.length}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Non lues</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#0B3B7B] font-mono">
                {unreadCount}
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                  À traiter
                </span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-[#0B3B7B]">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Alertes critiques</p>
            <p className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
              {criticalCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Profil & Périmètre</p>
            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px] mt-1">
              {currentUser.jobTitle || 'Utilisateur'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser.organizationName || 'GRC-Goal'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre d'outils, filtres et recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Onglets de statut (Toutes, Non lues, Lues) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold shrink-0">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({userNotifications.length})
            </button>
            <button
              onClick={() => { setStatusFilter('unread'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                statusFilter === 'unread'
                  ? 'bg-white text-[#0B3B7B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Non lues</span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter('read'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                statusFilter === 'read'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lues ({userNotifications.length - unreadCount})
            </button>
          </div>

          {/* Champ de recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Rechercher par mot-clé, code (RSK, ACT), titre..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3B7B] focus:bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

        </div>

        {/* Filtres par Catégorie et Priorité */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </span>

          {/* Filtre Catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Toutes les catégories</option>
            <option value="risques">Risques de Sécurité</option>
            <option value="actions">Plan d’Actions</option>
            <option value="soa">SoA ISO 27001</option>
            <option value="iam">Sécurité & IAM</option>
            <option value="gouvernance">Gouvernance</option>
          </select>

          {/* Filtre Priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="critique">Critique</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="info">Information</option>
          </select>

          {(categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-[#0B3B7B] hover:underline font-medium ml-auto"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          /* État vide */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucune notification ne correspond à vos filtres'
                : 'Aucune notification pour le moment'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                ? 'Essayez de modifier vos critères de recherche ou réinitialisez les filtres.'
                : 'Toutes vos alertes de sécurité, risques et actions assignées apparaîtront ici dès leur génération.'}
            </p>
            {(searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#0B3B7B] bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                Afficher toutes les notifications
              </button>
            )}
          </div>
        ) : (
          /* Cartes de notification */
          paginatedNotifications.map((notif) => {
            const catMeta = getCategoryMeta(notif.category);
            const CatIcon = catMeta.icon;
            const dateInfo = formatNotificationDate(notif.createdAt);

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 transition shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  !notif.isRead 
                    ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-100' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Icône de catégorie + Indicateur non lu */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${catMeta.color}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    {!notif.isRead && (
                      <span 
                        className="w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white absolute -top-1 -right-1 shadow-xs animate-pulse" 
                        title="Notification non lue"
                      />
                    )}
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm tracking-tight ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {notif.title}
                      </span>
                      {getPriorityBadge(notif.priority)}
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {catMeta.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pr-2">
                      {notif.message}
                    </p>

                    {/* Métadonnées temporelles */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="font-medium text-slate-500">{dateInfo.relative}</span>
                      <span>·</span>
                      <span>{dateInfo.exact}</span>
                      {notif.isRead && notif.readAt && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lue</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Actions spécifiques sur la notification */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {notif.targetModule && (
                    <button
                      onClick={() => {
                        if (!notif.isRead) {
                          onMarkAsRead(notif.id);
                        }
                        onNavigateToResource(notif.targetModule!, notif.targetResourceId);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs whitespace-nowrap"
                    >
                      <span>{notif.actionLabel || 'Consulter'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (notif.isRead) {
                          onMarkAsUnread(notif.id);
                        } else {
                          onMarkAsRead(notif.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition text-xs flex items-center gap-1"
                      title={notif.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    >
                      {notif.isRead ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline text-[11px]">Non lu</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline text-[11px]">Marquer lu</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteNotification(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Supprimer cette notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs text-xs">
          <span className="text-slate-500">
            Affichage de <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> à <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredNotifications.length)}</strong> sur <strong className="text-slate-800">{filteredNotifications.length}</strong> notifications
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                  currentPage === page
                    ? 'bg-[#0B3B7B] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
