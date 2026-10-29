# Guide d'Installation et de Lancement - GRC-Goal-PME

Ce guide explique comment installer et lancer l'application GRC-Goal-PME avec le backend Django et le frontend React.

---

## Prérequis

- **Python 3.10+** (pour le backend)
- **Node.js 18+** (pour le frontend)
- **npm** ou **yarn** (gestionnaire de paquets Node.js)
- **Git** (optionnel, pour cloner le projet)

---

## Structure du Projet

```
grc-goal-pme/
├── frontend/              # Application React (existante)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Application Django (nouveau)
│   ├── apps/              # Applications Django
│   ├── grc_config/        # Configuration Django
│   ├── manage.py
│   ├── requirements.txt
│   └── venv/              # Environnement virtuel Python
├── docs/                  # Documentation
├── .env.example           # Exemple de configuration
└── README.md
```

---

## Installation du Backend Django

### 1. Créer l'environnement virtuel Python

```bash
cd backend
python -m venv venv
```

### 2. Activer l'environnement virtuel

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```bash
cd backend
copy .env.example .env
```

Éditez le fichier `.env` selon vos besoins :

```env
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Exécuter les migrations Django

```bash
python manage.py migrate
```

### 6. Charger les données de démonstration

```bash
python manage.py load_demo_data
```

Cette commande charge :
- 6 rôles utilisateurs (Super Admin, Org Admin, RSSI, Risk Owner, Auditor, Viewer)
- 1 organisation de démonstration
- 6 comptes utilisateurs (mot de passe par défaut: `PmeSecure2026!`)
- 6 collaborateurs
- 6 actifs informationnels
- 6 risques
- 5 actions correctives
- 3 contrôles SoA
- Paramètres de sécurité

### 7. Créer un superutilisateur Django (optionnel)

Pour accéder à l'interface d'administration Django :

```bash
python manage.py createsuperuser
```

Suivez les instructions pour créer un compte administrateur.

---

## Installation du Frontend React

### 1. Installer les dépendances Node.js

```bash
cd frontend
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` dans le dossier `frontend/` :

```bash
cd frontend
copy .env.example .env.local
```

Éditez le fichier `.env.local` :

```env
VITE_API_URL=http://localhost:8000/api
GEMINI_API_KEY=votre_clé_api_gemini  # Optionnel
```

---

## Lancement de l'Application

### Lancer le Backend Django

```bash
cd backend
venv\Scripts\activate  # Windows
python manage.py runserver
```

Le backend sera accessible à : `http://localhost:8000`

- **API REST:** `http://localhost:8000/api/`
- **Admin Django:** `http://localhost:8000/admin/`

### Lancer le Frontend React

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

Le frontend sera accessible à : `http://localhost:3000`

---

## Comptes de Démonstration

Les comptes suivants sont créés automatiquement avec la commande `load_demo_data` :

| Email | Mot de passe | Rôles | Organisation |
|-------|-------------|-------|--------------|
| massaoudhamani10@gmail.com | PmeSecure2026! | Super Admin, RSSI | PME Démonstration |
| direction@sirbacom.ne | PmeSecure2026! | Org Admin, Risk Owner | Sirba Communication |
| mentor.grc@apsi.ne | PmeSecure2026! | Auditor | Programme Cybersécurité Niger |
| a.diallo@sirbacom.ne | PmeSecure2026! | Risk Owner | Sirba Communication |
| i.moussa@sirbacom.ne | PmeSecure2026! | Viewer | Sirba Communication |
| suspendu@demo.ne | PmeSecure2026! | Viewer (suspendu) | PME Démonstration |

**⚠️ Important:** Changez ces mots de passe en production !

---

## Endpoints API Principaux

### Authentification

- `POST /api/auth/users/login/` - Connexion utilisateur
- `POST /api/auth/users/logout/` - Déconnexion utilisateur

### Utilisateurs et Rôles

- `GET /api/auth/users/` - Liste des utilisateurs
- `POST /api/auth/users/` - Créer un utilisateur
- `GET /api/auth/roles/` - Liste des rôles
- `GET /api/auth/sessions/` - Sessions utilisateur
- `GET /api/auth/audit-logs/` - Journaux d'audit

### Organisations

- `GET /api/organizations/` - Liste des organisations
- `POST /api/organizations/` - Créer une organisation

### Collaborateurs

- `GET /api/collaborators/` - Liste des collaborateurs
- `POST /api/collaborators/` - Inviter un collaborateur

### Actifs

- `GET /api/assets/` - Liste des actifs
- `POST /api/assets/` - Créer un actif

### Risques

- `GET /api/risks/` - Liste des risques
- `POST /api/risks/` - Créer un risque

### SoA (Statement of Applicability)

- `GET /api/soa-controls/` - Liste des contrôles SoA
- `POST /api/soa-controls/` - Créer un contrôle SoA

### Actions Correctives

- `GET /api/actions/` - Liste des actions
- `POST /api/actions/` - Créer une action

### Notifications

- `GET /api/notifications/` - Liste des notifications
- `PATCH /api/notifications/{id}/` - Marquer comme lu

---

## Développement

### Ajouter de nouvelles migrations

Après avoir modifié les modèles Django :

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Recharger les données de démonstration

```bash
cd backend
python manage.py load_demo_data
```

### Réinitialiser la base de données

⚠️ **Attention : Cela supprime toutes les données**

```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py load_demo_data
```

---

## Déploiement en Production

### Configuration de production

1. **Modifier `backend/.env` :**

```env
DEBUG=False
SECRET_KEY=votre_clé_secrète_production
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com
CORS_ALLOWED_ORIGINS=https://votre-domaine.com
```

2. **Collecter les fichiers statiques :**

```bash
cd backend
python manage.py collectstatic
```

3. **Utiliser un serveur WSGI (gunicorn, uWSGI) :**

```bash
pip install gunicorn
gunicorn grc_config.wsgi:application
```

4. **Utiliser Nginx comme reverse proxy :**

Configurer Nginx pour servir le frontend React et proxy les requêtes API vers Django.

5. **Configurer HTTPS :**

Utiliser Let's Encrypt ou un certificat SSL commercial.

---

## Dépannage

### Erreur : "ModuleNotFoundError: No module named 'django'"

**Solution :** Assurez-vous que l'environnement virtuel est activé et que les dépendances sont installées.

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur : "django.db.utils.OperationalError: no such table"

**Solution :** Exécutez les migrations.

```bash
cd backend
python manage.py migrate
```

### Erreur CORS lors des requêtes API

**Solution :** Vérifiez que `CORS_ALLOWED_ORIGINS` dans `.env` contient l'URL du frontend.

### Le frontend ne se connecte pas au backend

**Solution :** Vérifiez que :
1. Le backend Django est en cours d'exécution
2. L'URL de l'API dans `frontend/.env.local` est correcte
3. Le port du backend (8000) n'est pas bloqué par un firewall

---

## Ressources Supplémentaires

- **Documentation Django:** https://docs.djangoproject.com/
- **Documentation Django REST Framework:** https://www.django-rest-framework.org/
- **Documentation React:** https://react.dev/
- **Documentation Vite:** https://vitejs.dev/

---

## Support

Pour toute question ou problème, consultez :
1. Le rapport d'audit : `docs/AUDIT_REPORT.md`
2. Le README principal : `README.md`
3. Les commentaires dans le code source

---

**Version du document:** 1.0  
**Dernière mise à jour:** 2026-10-29
