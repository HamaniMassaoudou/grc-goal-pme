# Rapport d'Audit - Module de Gestion des Utilisateurs GRC-Goal-PME

**Date :** 30 Octobre 2026  
**Auditeur :** Cascade AI Assistant  
**Périmètre :** Authentification, gestion des utilisateurs, rôles, permissions, organisations et collaborateurs

---

## 1. Tableau de Diagnostic des Fonctionnalités

| Fonctionnalité | État actuel | Problèmes identifiés | Amélioration proposée | Priorité |
|---------------|-------------|----------------------|------------------------|----------|
| **A. Authentification et Sessions** | | | | |
| Connexion utilisateur | Partielle | - Double appel API dans handleLoginSuccess (ligne 303) avec mot de passe hardcodé<br>- LoginScreen utilise API mais handleLoginSuccess crée aussi une session locale<br>- Pas de gestion cohérente entre JWT et session locale | - Supprimer l'appel API hardcodé dans handleLoginSuccess<br>- Unifier la gestion : utiliser uniquement JWT ou synchroniser les deux<br>- Implémenter la vérification d'expiration de token côté frontend | Haute |
| Déconnexion | Partielle | - Appel API logout présent mais pas de vérification de succès<br>- Session locale supprimée sans attendre la réponse API<br>- Pas de nettoyage du localStorage des tokens | - Attendre la réponse API avant de supprimer la session locale<br>- Nettoyer les tokens du localStorage après logout réussi<br>- Gérer les erreurs de logout API | Haute |
| Vérification identifiants | Fonctionnelle | - Backend utilise authenticate() Django standard<br>- Pas de rate limiting sur les tentatives de connexion<br>- Pas de verrouillage de compte après échecs multiples (modèle existe mais non utilisé) | - Implémenter le compteur d'échecs et le verrouillage dans la vue login<br>- Ajouter rate limiting avec Django Ratelimit ou similar<br>- Utiliser les champs failed_login_attempts et locked_until du modèle | Haute |
| Gestion des mots de passe | Partielle | - Validation de force côté frontend uniquement<br>- Backend utilise validateurs Django standards mais pas les paramètres personnalisés SecuritySettings<br>- Pas de vérification de l'historique des mots de passe | - Implémenter un custom password validator utilisant SecuritySettings<br>- Ajouter validation backend avec les paramètres de sécurité<br>- Stocker l'historique des hash de mots de passe | Moyenne |
| Gestion erreurs authentification | Partielle | - Messages d'erreur génériques côté backend<br>- Pas de logging détaillé des échecs de connexion<br>- LoginScreen affiche "Une erreur technique est survenue" sans détails | - Améliorer les messages d'erreur backend avec détails sécurisés<br>- Logger les échecs avec IP, user-agent, timestamp<br>- Afficher des messages plus spécifiques côté frontend (format invalide, compte inexistant, etc.) | Moyenne |
| Expiration de session | Défaillante | - JWT expire après 2h mais pas de vérification automatique côté frontend<br>- Pas de rafraîchissement automatique du token avant expiration<br>- Session locale a une expiration mais n'est jamais vérifiée | - Implémenter un interceptor Axios/fetch pour vérifier l'expiration<br>- Rafraîchir le token automatiquement à 80% de sa durée de vie<br>- Afficher un avertissement avant expiration et proposer de rester connecté | Haute |
| Maintien session après refresh | Défaillante | - État d'authentification stocké dans state React (volatile)<br>- Pas de persistance de la session après rechargement de page<br>- Tokens JWT stockés mais pas utilisés pour restaurer la session | - Stocker l'état d'authentification dans localStorage/sessionStorage<br>- Au chargement, vérifier la validité du token et restaurer la session<br>- Utiliser le refresh token si nécessaire | Haute |
| Protection routes authentifiées | Absente | - Pas de protection des routes côté frontend (React Router)<br)- Toutes les pages accessibles sans authentification<br>- Seul l'écran de login conditionne l'accès | - Implémenter un ProtectedRoute wrapper avec vérification JWT<br>- Rediriger vers login si non authentifié<br>- Vérifier la validité du token à chaque navigation | Haute |
| Redirection après connexion | Fonctionnelle | - Redirection vers dashboard après connexion<br>- Pas de redirection vers la page demandée initialement (deep linking) | - Stocker l'URL demandée avant redirection vers login<br>- Rediriger vers l'URL demandée après connexion réussie<br>- Fallback vers dashboard si pas d'URL stockée | Basse |
| **B. Gestion des Comptes Utilisateurs** | | | | |
| Création de compte | Partielle | - UserModal existe mais utilise localStorage<br>- Pas d'appel API pour créer l'utilisateur<br>- Validation frontend mais pas backend des contraintes métier | - Intégrer apiService.createUser() dans UserModal<br>- Ajouter validation backend (unicité email, format, etc.)<br>- Logger la création dans SecurityAuditLog | Haute |
| Liste des utilisateurs | Partielle | - UsersList affiche les utilisateurs depuis state<br>- Données chargées depuis localStorage ou API au démarrage<br>- Pas de rafraîchissement automatique | - Intégrer apiService.getUsers() pour le chargement<br>- Ajouter un bouton de rafraîchissement manuel<br>- Implémenter le polling ou WebSocket pour mises à jour en temps réel | Moyenne |
| Détails utilisateur | Fonctionnelle | - Affichage complet des informations dans UsersList<br>- Pas de page de détail dédiée | - Créer une page de détail utilisateur avec historique<br>- Afficher les sessions actives de l'utilisateur<br>- Afficher les journaux d'audit liés à l'utilisateur | Basse |
| Modification compte | Partielle | - UserModal permet la modification<br>- Modifications appliquées à state uniquement<br>- Pas de synchronisation avec backend | - Intégrer apiService.updateUser() dans UserModal<br>- Valider les modifications côté backend<br>- Logger les modifications dans SecurityAuditLog | Haute |
| Activation/Désactivation compte | Partielle | - handleToggleUserStatus existe<br>- Modification locale uniquement<br>- Pas d'appel API | - Intégrer apiService.updateUser() avec changement de statut<br>- Implémenter la logique de verrouillage côté backend<br>- Révoquer toutes les sessions de l'utilisateur lors de la désactivation | Haute |
| Suppression compte | Partielle | - handleDeleteUser existe<br>- Suppression locale uniquement<br>- Pas de confirmation ni appel API | - Intégrer apiService.deleteUser()<br>- Ajouter une confirmation avec impact (données associées)<br>- Soft delete ou archivage au lieu de suppression hard | Haute |
| Gestion profils | Partielle | - Champs profile existent (job_title, department, phone)<br>- Pas de page de profil personnel pour l'utilisateur connecté | - Créer une page "Mon Profil" accessible à tous<br>- Permettre à l'utilisateur de modifier ses propres informations<br>- Séparer les droits d'admin vs self-service | Moyenne |
| Réinitialisation mot de passe | Partielle | - ResetPasswordModal existe<br>- Génération de mot de passe temporaire locale<br>- Pas d'appel API pour appliquer le changement | - Intégrer apiService pour la réinitialisation<br>- Implémenter un endpoint backend dédié au reset<br>- Envoyer un email avec le mot de passe temporaire (optionnel) | Haute |
| Changement mot de passe | Absente | - Pas de formulaire de changement de mot de passe pour l'utilisateur connecté<br>- Obligation de passer par un admin pour réinitialiser | - Créer un formulaire de changement de mot de passe dans "Mon Profil"<br>- Vérifier l'ancien mot de passe avant changement<br>- Forcer le changement si must_change_password est true | Haute |
| Prévention doublons | Partielle | - Backend : email unique via Django model<br>- Frontend : pas de validation en temps réel avant soumission | - Ajouter une validation asynchrone frontend lors de la saisie email<br>- Vérifier la disponibilité de l'email avant création<br>- Afficher un message si l'email existe déjà | Moyenne |
| **C. Gestion des Rôles et Permissions** | | | | |
| Identification des rôles | Fonctionnelle | - 6 rôles système prédéfinis<br>- Stockés dans state et chargés depuis backend | - Aucun changement nécessaire | - |
| Attribution des rôles | Partielle | - RoleModal permet l'assignation<br>- Modifications locales uniquement<br>- Pas d'appel API | - Intégrer apiService.updateUser() pour les rôles<br>- Logger les changements de rôle dans SecurityAuditLog<br>- Empêcher la suppression du dernier rôle d'un utilisateur | Haute |
| Modification des rôles | Partielle | - RoleModal permet la modification des permissions<br>- Modifications locales uniquement<br>- Pas d'appel API | - Intégrer apiService.updateRole()<br>- Empêcher la modification des rôles système (is_system=true)<br>- Logger les modifications dans SecurityAuditLog | Haute |
| Vérification permissions | Défaillante | - hasPermission() côté frontend uniquement<br>- Aucune vérification backend des permissions<br>- Vulnérable à la manipulation du state React | - Implémenter des permissions Django custom ou Django Guardian<br>- Ajouter des permission classes DRF basées sur les rôles<br>- Vérifier les permissions côté backend pour chaque action critique | Critique |
| Contrôle d'accès aux pages | Défaillante | - Vérification frontend avant affichage des modales<br>- Pas de protection au niveau des routes<br>- Accès direct possible via URL manipulation | - Implémenter des middleware de permission Django<br>- Protéger les endpoints API avec les permissions appropriées<br>- Ajouter des vérifications backend pour chaque opération | Critique |
| Restriction par rôle | Défaillante | - Filtres visuels dans l'UI (boutons grisés, etc.)<br>- Aucune restriction backend réelle | - Implémenter des ViewSets avec permission classes personnalisées<br>- Utiliser Django Rules ou similar pour les permissions complexes<br>- Filtrer les querysets selon les rôles de l'utilisateur | Critique |
| Prévention accès non autorisé | Défaillante | - Pas de protection contre l'accès direct aux API<br>- Un utilisateur avec un token valide peut appeler n'importe quel endpoint | - Sécuriser tous les endpoints avec IsAuthenticated + permissions<br>- Ajouter des vérifications d'appartenance organisationnelle<br>- Implémenter des scopes OAuth2 si nécessaire | Critique |
| **D. Gestion des Organisations et Collaborateurs** | | | | |
| Association utilisateur-organisation | Partielle | - UserAccount a organization_id et organization_ids<br>- Pas de validation backend de l'appartenance | - Créer un modèle ManyToMany explicite avec through<br>- Valider l'appartenance avant d'accorder l'accès aux données<br>- Logger les changements d'organisation | Haute |
| Invitation collaborateurs | Partielle | - CollaboratorModal existe<br>- Pas d'envoi réel d'invitation email<br>- Statut "invite" mais pas de workflow | - Implémenter un système d'invitation par email<br>- Générer un token d'invitation valide 7 jours<br>- Créer un endpoint pour accepter/refuser l'invitation | Moyenne |
| Multi-organisation | Partielle | - organization_ids permet multi-org<br>- Bascule d'organisation fonctionnelle côté frontend<br>- Pas de vérification backend de l'appartenance | - Valider l'appartenance à l'organisation côté backend<br>- Filtrer les données selon l'organisation active dans les querysets<br>- Implémenter un middleware pour définir l'org contextuelle | Haute |
| Attribution responsabilités | Partielle | - Champ grc_responsibilities dans Collaborator<br>- Texte libre, pas structuré | - Structurer les responsabilités (enum ou relation)<br>- Lier les responsabilités aux permissions<br>- Afficher les responsabilités dans le profil utilisateur | Basse |
| Isolation des données | Défaillante | - Filtrage frontend par organizationId<br>- Aucune isolation backend des données entre organisations | - Ajouter organization_id à tous les modèles métier<br>- Filtrer automatiquement les querysets par organization<br>- Empêcher l'accès cross-organisation via l'API | Critique |
| **E. Profil et Expérience Utilisateur** | | | | |
| Consultation profil personnel | Absente | - Pas de page "Mon Profil"<br>- Informations affichées uniquement dans le header | - Créer une page de profil personnel<br>- Afficher toutes les informations de l'utilisateur<br>- Permettre la modification des champs self-service | Haute |
| Modification profil | Absente | - Pas d'interface pour modifier son propre profil<br>- Obligation de passer par un admin | - Créer un formulaire de modification de profil<br>- Limiter les champs modifiables (email, phone, job_title)<br>- Valider les modifications côté backend | Haute |
| Modification mot de passe self-service | Absente | - Pas d'option pour changer son propre mot de passe<br>- Dépend d'un admin pour réinitialiser | - Ajouter un formulaire de changement de mot de passe<br>- Exiger l'ancien mot de passe<br>- Appliquer les règles de force de mot de passe | Haute |
| Affichage nom/rôle/organisation | Fonctionnelle | - Header affiche le nom et l'organisation<br>- Rôle affiché dans certains contextes | - Améliorer l'affichage du rôle dans le header<br>- Ajouter un badge de rôle visible partout<br>- Afficher l'organisation active de manière plus visible | Basse |
| Cohérence après modification | Partielle | - Modifications synchronisées dans le state<br>- Pas de rafraîchissement depuis le backend | - Rafraîchir les données depuis le backend après modification<br>- Mettre à jour le header immédiatement après changement de profil<br>- Afficher une confirmation de succès | Moyenne |
| Navigation entre pages compte | Fonctionnelle | - Onglets dans IamView (users, roles, sessions, audit)<br>- Navigation fluide | - Aucun changement nécessaire | - |

---

## 2. Risques de Sécurité Identifiés

### Critiques

1. **Absence de permissions backend** : Toutes les vérifications de permissions se font côté frontend uniquement. Un utilisateur malveillant peut manipuler le state React ou appeler directement les API pour contourner les restrictions.

2. **Isolation des données défaillante** : Le filtrage par organisation se fait uniquement côté frontend. Un utilisateur avec un token valide peut accéder aux données de n'importe quelle organisation en manipulant les requêtes API.

3. **Gestion double des sessions** : L'application utilise à la fois les tokens JWT et des sessions locales sans synchronisation, créant des incohérences potentielles et des failles de sécurité.

4. **Pas de rate limiting sur l'authentification** : Les endpoints de login sont vulnérables aux attaques par force brute.

### Hautes

5. **Mot de passe hardcodé dans handleLoginSuccess** : La ligne 303 de App.tsx contient un appel API avec un mot de passe en clair.

6. **Pas de vérification de l'expiration des tokens** : Les tokens JWT expirent après 2h mais le frontend ne vérifie pas leur validité, permettant l'utilisation de tokens expirés.

7. **Pas de protection des routes** : Toutes les pages sont accessibles sans authentification via manipulation d'URL.

8. **Suppression hard des utilisateurs** : La suppression d'un utilisateur ne prévient pas la perte de données associées (risques, actions, etc.).

### Moyennes

9. **Validation mot de passe frontend uniquement** : Les règles de complexité des mots de passe ne sont pas appliquées côté backend.

10. **Pas d'historique des mots de passe** : Un utilisateur peut réutiliser un ancien mot de passe.

11. **Pas de logging détaillé des événements de sécurité** : Les échecs de connexion et tentatives d'accès non autorisées ne sont pas suffisamment tracés.

---

## 3. Problèmes d'Expérience Utilisateur

1. **Pas de page de profil personnel** : Les utilisateurs ne peuvent pas modifier leurs propres informations.

2. **Pas de changement de mot de passe self-service** : Dépendance complète sur les administrateurs.

3. **Session non persistante après refresh** : L'utilisateur doit se reconnecter après chaque rechargement de page.

4. **Messages d'erreur génériques** : Les erreurs d'authentification ne donnent pas d'indications utiles.

5. **Pas d'avertissement d'expiration de session** : L'utilisateur est déconnecté brutalement après 2h sans avertissement.

---

## 4. Architecture Technique Actuelle

### Backend Django

- **Authentification** : JWT avec SimpleJWT (access token 2h, refresh token 7j)
- **Modèles** : UserAccount (custom), RoleDefinition, UserSession, SecurityAuditLog, SecuritySettings
- **Permissions** : IsAuthenticated par défaut, pas de permissions basées sur les rôles
- **API** : REST Framework avec ViewSets standard

### Frontend React

- **État** : Géré avec React state (volatile, pas de persistence)
- **Authentification** : LoginScreen utilise apiService.login(), handleLoginSuccess crée session locale
- **Permissions** : hasPermission() côté client uniquement
- **Stockage** : localStorage pour les tokens, state React pour les données

### Incohérences Architecturelles

1. Double gestion de l'authentification (JWT + session locale)
2. Permissions frontend vs backend asymétriques
3. Données chargées depuis API mais stockées dans state sans synchronisation
4. Filtre organisation frontend mais pas backend

---

## 5. Propositions d'Amélioration Priorisées

### Priorité Critique

#### 1. Implémenter les permissions backend
**Problème** : Aucune vérification des permissions côté backend  
**Solution** : 
- Créer des permission classes DRF personnalisées basées sur les rôles
- Utiliser Django Rules ou implémenter un système similaire
- Sécuriser tous les ViewSets avec les permissions appropriées

**Modifications** :
- Backend : Créer `apps/users/permissions.py` avec classes de permissions
- Backend : Ajouter `permission_classes` dans tous les ViewSets
- Backend : Implémenter la vérification des permissions dans chaque action
- Tests : Tests unitaires pour chaque permission

#### 2. Isoler les données par organisation
**Problème** : Pas d'isolation backend des données entre organisations  
**Solution** :
- Ajouter `organization_id` à tous les modèles métier (risques, assets, actions, soa)
- Filtrer automatiquement les querysets par l'organisation de l'utilisateur
- Empêcher l'accès cross-organisation

**Modifications** :
- Backend : Migration pour ajouter organization_id aux modèles
- Backend : Override `get_queryset()` dans tous les ViewSets
- Backend : Middleware pour définir l'organisation contextuelle
- Tests : Tests d'accès cross-organisation

#### 3. Sécuriser les routes frontend
**Problème** : Pas de protection des routes, accès possible sans authentification  
**Solution** :
- Implémenter un composant `ProtectedRoute` avec vérification JWT
- Vérifier la validité du token à chaque navigation
- Rediriger vers login si non authentifié

**Modifications** :
- Frontend : Créer `src/components/common/ProtectedRoute.tsx`
- Frontend : Wrapper autour de toutes les routes protégées
- Frontend : Vérification du token dans useEffect
- Tests : Tests de navigation avec/without auth

### Priorité Haute

#### 4. Unifier la gestion de l'authentification
**Problème** : Double gestion JWT + session locale  
**Solution** :
- Utiliser uniquement JWT pour l'authentification
- Supprimer la gestion locale des sessions
- Persister l'état d'authentification dans localStorage

**Modifications** :
- Frontend : Supprimer la création de session locale dans handleLoginSuccess
- Frontend : Stocker uniquement l'ID utilisateur et le token dans localStorage
- Frontend : Restaurer la session au chargement depuis le token
- Backend : Supprimer le modèle UserSession (ou le garder pour audit uniquement)

#### 5. Implémenter le rate limiting sur l'authentification
**Problème** : Vulnérabilité aux attaques par force brute  
**Solution** :
- Installer Django Ratelimit ou similar
- Limiter les tentatives de connexion par IP
- Implémenter le verrouillage de compte après échecs

**Modifications** :
- Backend : Ajouter django-ratelimit aux dépendances
- Backend : Décorateur @ratelimit sur l'endpoint login
- Backend : Utiliser les champs failed_login_attempts et locked_until
- Tests : Tests de rate limiting

#### 6. Intégrer l'API pour la gestion des utilisateurs
**Problème** : UserModal et autres modales utilisent localStorage uniquement  
**Solution** :
- Intégrer apiService.createUser(), updateUser(), deleteUser()
- Synchroniser les modifications avec le backend
- Logger toutes les opérations dans SecurityAuditLog

**Modifications** :
- Frontend : Modifier UserModal pour utiliser apiService
- Frontend : Modifier ResetPasswordModal pour utiliser apiService
- Frontend : Ajouter la gestion des erreurs API
- Backend : Vérifier que les endpoints sont correctement sécurisés

#### 7. Créer la page "Mon Profil"
**Problème** : Pas d'interface self-service pour les utilisateurs  
**Solution** :
- Créer une page de profil personnel
- Permettre la modification des informations de base
- Ajouter le formulaire de changement de mot de passe

**Modifications** :
- Frontend : Créer `src/components/profile/ProfileView.tsx`
- Frontend : Formulaire de modification du profil
- Frontend : Formulaire de changement de mot de passe
- Backend : Endpoint pour la modification self-service

#### 8. Implémenter la vérification d'expiration des tokens
**Problème** : Tokens expirés utilisables indéfiniment côté frontend  
**Solution** :
- Vérifier l'expiration du token avant chaque requête API
- Rafraîchir automatiquement le token avant expiration
- Afficher un avertissement avant déconnexion

**Modifications** :
- Frontend : Interceptor dans apiService pour vérifier l'expiration
- Frontend : Rafraîchissement automatique à 80% de la durée de vie
- Frontend : Modal d'avertissement d'expiration
- Tests : Tests d'expiration et rafraîchissement

### Priorité Moyenne

#### 9. Améliorer la validation des mots de passe
**Problème** : Validation frontend uniquement  
**Solution** :
- Créer un validator Django personnalisé utilisant SecuritySettings
- Appliquer les règles de complexité côté backend
- Ajouter la validation de l'historique des mots de passe

**Modifications** :
- Backend : Créer `apps/users/validators.py`
- Backend : Intégrer dans UserAccountCreateSerializer
- Backend : Stocker l'historique des hash de mots de passe
- Tests : Tests de validation de mot de passe

#### 10. Implémenter le système d'invitation par email
**Problème** : Invitation collaborateur sans envoi réel  
**Solution** :
- Générer un token d'invitation valide 7 jours
- Envoyer un email avec le lien d'inscription
- Créer un endpoint pour accepter l'invitation

**Modifications** :
- Backend : Ajouter un champ invitation_token à Collaborator
- Backend : Endpoint pour envoyer l'invitation email
- Backend : Endpoint pour accepter/refuser l'invitation
- Frontend : Interface pour gérer les invitations en attente

#### 11. Améliorer le logging des événements de sécurité
**Problème** : Logging insuffisant des événements de sécurité  
**Solution** :
- Logger tous les échecs de connexion avec détails
- Logger les tentatives d'accès non autorisées
- Logger les changements de permissions

**Modifications** :
- Backend : Améliorer le logging dans la vue login
- Backend : Logger les violations de permissions
- Backend : Créer des alertes automatiques sur événements critiques
- Tests : Vérification des logs dans SecurityAuditLog

### Priorité Basse

#### 12. Créer une page de détail utilisateur
**Problème** : Pas de vue détaillée des informations utilisateur  
**Solution** :
- Page avec toutes les informations de l'utilisateur
- Historique des sessions
- Journal d'audit lié à l'utilisateur

**Modifications** :
- Frontend : Créer `src/components/iam/UserDetailView.tsx`
- Frontend : Intégration avec apiService pour charger les données
- Backend : Endpoint pour récupérer les détails complets

#### 13. Améliorer l'affichage des rôles dans l'UI
**Problème** : Rôle pas toujours visible dans l'interface  
**Solution** :
- Ajouter un badge de rôle dans le header
- Afficher le rôle de manière plus visible
- Indiquer l'organisation active de manière plus claire

**Modifications** :
- Frontend : Modifier Header pour afficher le rôle
- Frontend : Améliorer l'affichage de l'organisation active
- Aucun changement backend nécessaire

#### 14. Implémenter le deep linking après connexion
**Problème** : Redirection systématique vers dashboard  
**Solution** :
- Stocker l'URL demandée avant redirection login
- Rediriger vers l'URL demandée après connexion
- Fallback vers dashboard

**Modifications** :
- Frontend : Stocker l'URL demandée dans localStorage
- Frontend : Redirection intelligente après login
- Tests : Tests de deep linking

---

## 6. Plan de Mise en Œuvre

### Phase 1 : Sécurité Critique (Semaine 1)
1. Implémenter les permissions backend
2. Isoler les données par organisation
3. Sécuriser les routes frontend

### Phase 2 : Authentification (Semaine 2)
4. Unifier la gestion de l'authentification
5. Implémenter le rate limiting
6. Vérification d'expiration des tokens

### Phase 3 : Gestion des Utilisateurs (Semaine 3)
7. Intégrer l'API pour la gestion des utilisateurs
8. Créer la page "Mon Profil"
9. Améliorer la validation des mots de passe

### Phase 4 : Expérience Utilisateur (Semaine 4)
10. Système d'invitation par email
11. Amélioration du logging
12. Page de détail utilisateur

### Phase 5 : Améliorations Mineures (Semaine 5)
13. Affichage des rôles
14. Deep linking

---

## 7. Fichiers et Composants Concernés

### Backend
- `backend/apps/users/views.py` : Ajouter permissions, rate limiting
- `backend/apps/users/permissions.py` : Nouveau fichier pour les permissions
- `backend/apps/users/validators.py` : Nouveau fichier pour les validators
- `backend/apps/users/models.py` : Ajouter organization_id aux modèles métier
- `backend/apps/*/views.py` : Filtrer les querysets par organisation
- `backend/grc_config/settings.py` : Configuration rate limiting
- `backend/requirements.txt` : Ajouter django-ratelimit, django-rules

### Frontend
- `src/App.tsx` : Supprimer la gestion locale de session
- `src/components/auth/LoginScreen.tsx` : Améliorer la gestion des erreurs
- `src/components/common/ProtectedRoute.tsx` : Nouveau composant
- `src/components/iam/UserModal.tsx` : Intégrer apiService
- `src/components/iam/ResetPasswordModal.tsx` : Intégrer apiService
- `src/components/profile/ProfileView.tsx` : Nouveau composant
- `src/services/api.ts` : Ajouter vérification expiration token
- `src/components/common/Header.tsx` : Afficher le rôle

---

## 8. Tests de Validation

Pour chaque amélioration, les tests suivants doivent être effectués :

### Tests de Sécurité
- Tentative d'accès non autorisé aux endpoints API
- Tentative d'accès aux données d'une autre organisation
- Tentative de force brute sur le login
- Utilisation de tokens expirés

### Tests Fonctionnels
- Création/modification/suppression d'utilisateur
- Changement de mot de passe self-service
- Attribution de rôles
- Bascule d'organisation
- Invitation de collaborateurs

### Tests UX
- Navigation avec/without authentification
- Persistance de session après refresh
- Redirection après login
- Affichage des erreurs

---

## 9. Conclusion

Le module de gestion des utilisateurs de GRC-Goal-PME présente une architecture solide mais souffre de lacunes critiques en matière de sécurité, principalement dues à l'absence de vérifications des permissions côté backend et à l'isolation insuffisante des données entre organisations.

Les améliorations proposées visent à :
- Sécuriser l'application en implémentant des permissions backend robustes
- Isoler correctement les données par organisation
- Unifier la gestion de l'authentification
- Améliorer l'expérience utilisateur avec des fonctionnalités self-service
- Maintenir la cohérence entre frontend et backend

Le plan de mise en œuvre s'étend sur 5 semaines, en priorisant les corrections critiques de sécurité avant les améliorations fonctionnelles.
