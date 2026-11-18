# Guide d'Installation, Déploiement et Exploitation — GRC-Goal-PME

Ce guide technique détaille pas-à-pas la mise en œuvre, la configuration et le lancement de l'application **GRC-Goal-PME** avec son backend Python / Django et son frontend React 19.

---

## 1. Prérequis Système

| Composant | Version Minimale Recommandée | Rôle |
|---|---|---|
| **Python** | 3.10+ (recommandé 3.12+) | Exécution du backend Django, API REST et ORM SQLite |
| **Node.js** | 18+ (recommandé 22.x LTS) | Bundling, exécution du frontend React & Vite |
| **npm** | 9+ (inclus avec Node.js) | Gestion des packages frontend |
| **Git** | 2.x | Suivi de versions du code source |

---

## 2. Structure Réelle du Projet

Le projet sépare strictement le backend Python/Django et le frontend React tout en conservant une structure claire et exploitable :

```
grc-goal-pme/
├── backend/                     # Serveur d'API & Persistance Django
│   ├── apps/
│   │   ├── actions/             # Actions correctives & clôtures
│   │   ├── assets/              # Inventaire des actifs
│   │   ├── core/                # Commandes système (load_demo_data), preuves scellées
│   │   ├── governance/          # Collaborateurs & gouvernance
│   │   ├── notifications/       # Notifications & alertes
│   │   ├── organizations/       # Organisations & isolations
│   │   ├── risks/               # Risques ISO 27005 (Score, Niveaux)
│   │   ├── soa/                 # SoA ISO 27001 (93 contrôles) + pièces jointes
│   │   ├── testing/             # Fiches de test & protocole B14
│   │   └── users/               # Utilisateurs, Authentification JWT, RBAC & Audit
│   ├── grc_config/              # Configuration Django (settings, urls, wsgi)
│   ├── db.sqlite3               # Base de données SQLite3
│   ├── manage.py                # Point d'entrée CLI Django
│   ├── media/                   # Stockage des fichiers uploadés (preuves SoA)
│   ├── requirements.txt         # Dépendances Python
│   └── venv/                    # Environnement virtuel Python (local)
│
├── frontend/                    # Application Frontend React 19 + TypeScript
│   ├── src/                     # Code source de l'interface React
│   │   ├── components/          # 35+ composants UI modulaires (lazy-loaded)
│   │   ├── services/
│   │   │   ├── api.ts           # Client REST HTTP avec refresh token automatique
│   │   │   ├── apiAdapter.ts    # Adaptateur snake_case ↔ camelCase
│   │   │   ├── gemini.ts        # Assistant IA d'analyse GRC (Google GenAI)
│   │   │   ├── pdfExport.ts     # Moteur d'export PDF (jsPDF)
│   │   │   ├── security.ts      # Utilitaires de sécurité
│   │   │   └── storage.ts       # Gestion de l'état GRC (localStorage fallback)
│   │   ├── types/               # Typages TypeScript stricts
│    │   ├── data/                # Données initiales et rôles
│   │   ├── App.tsx              # Composant racine & orchestrateur d'état
│   │   ├── main.tsx             # Point d'entrée React
│   │   └── index.css            # Styles Tailwind CSS v4
│   ├── index.html               # Point d'entrée HTML
│   ├── package.json             # Dépendances et scripts frontend
│   ├── tsconfig.json            # Configuration TypeScript
│   ├── vite.config.ts           # Configuration du bundler Vite
│   └── .env.local               # Configuration locale (VITE_API_URL)
│
├── docs/                        # Documentation technique et guides
├── package.json                 # Raccourcis racine de build et dev
├── README.md                    # Documentation générale du projet
└── .gitignore                   # Fichiers ignorés par Git
```

---

## 3. Installation et Configuration du Backend Django

### Étape 3.1 — Préparation de l'environnement virtuel

Dans un terminal, positionnez-vous dans le répertoire `backend/` :

```powershell
cd backend
python -m venv venv
```

Activez l'environnement virtuel :
- **Sous Windows (PowerShell) :**
  ```powershell
  .\venv\Scripts\activate
  ```
- **Sous Linux / macOS :**
  ```bash
  source venv/bin/activate
  ```

### Étape 3.2 — Installation des dépendances Python

```powershell
pip install -r requirements.txt
```

Les packages clés installés comprennent :
- `django>=5.0,<5.1`
- `djangorestframework>=3.14,<3.15`
- `djangorestframework-simplejwt>=5.3,<5.4`
- `django-cors-headers>=4.3,<4.4`
- `django-filter>=23.5,<24.0`
- `python-dotenv>=1.0,<1.1`
- `Pillow>=10.0,<11.0` (support des images et fichiers uploadés)
- `reportlab>=4.1,<4.2` (génération PDF)

### Étape 3.3 — Configuration de l'environnement (.env)

Créez ou vérifiez le fichier `backend/.env` :
```env
DEBUG=True
DJANGO_SECRET_KEY=django-insecure-xyz-+f$h)*25!*8#$&h_3b#$yn%1vf07)@(kr&s7-us4fobb6a
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
```

### Étape 3.4 — Application des migrations SQLite

Initialisez le schéma relationnel de la base de données :
```powershell
python manage.py migrate
```

> **Note importante :** Les migrations récentes incluent :
> - `soa.0002_soacontrol_evidence_file` : Ajout du champ FileField pour les pièces jointes de preuves SoA (PDF/images)
> - `users.0004_remove_useraccount_organization_id_and_more` : Remplacement de `organization_id` (CharField) par `organization` (ForeignKey vers Organization) pour une meilleure intégrité référentielle

### Étape 3.5 — Chargement des données de démonstration

Chargez le jeu complet de données de test sans doublons :
```powershell
python manage.py load_demo_data
```

Cette commande initialise de manière idempotente :
- **6 rôles RBAC :** Super Administrateur, Admin Organisation, RSSI, Risk Owner, Auditeur, Lecteur.
- **1 organisation pilote :** *PME Démonstration (Sirba Communication SARL)*.
- **6 comptes utilisateurs :** avec mot de passe universel haché `PmeSecure2026!`.
- **6 profils collaborateurs** associés.
- **6 actifs du système d'information** avec valorisation de criticité.
- **6 risques majeurs** avec matrice d'impact/probabilité et plans de traitement.
- **5 actions correctives** avec suivi des statuts, commentaires et échéances.
- **93 contrôles SoA ISO 27001:2022** couvrant l'intégralité des 4 domaines officiels (A.5, A.6, A.7, A.8).
- **1 protocole d'homologation & 2 fiches d'évaluation B14**.
- **6 notifications opérationnelles & 4 événements d'audit initiaux**.

### Étape 3.6 — Démarrage du serveur Django

```powershell
python manage.py runserver 8000
```
- API REST accessible à l'adresse : **`http://127.0.0.1:8000/api/`**
- Administration Django : **`http://127.0.0.1:8000/admin/`**

---

## 4. Installation et Démarrage du Frontend React

Ouvrez un **deuxième terminal** et placez-vous dans le répertoire `frontend/` :

### Étape 4.1 — Installation des dépendances Node.js

```powershell
cd frontend
npm install
```

Les packages clés installés comprennent :
- `react@^19.0.1` et `react-dom@^19.0.1` (Framework UI)
- `typescript@^7.0.2` (Typage strict)
- `vite@^8.3.0` (Bundler ultra-rapide)
- `tailwindcss@^4.3.3` (Framework CSS utility-first)
- `lucide-react@^0.546.0` (Bibliothèque d'icônes)
- `motion@^12.23.24` (Animations fluides)
- `jspdf@^4.2.1` (Génération PDF côté client)
- `@google/genai@^2.4.0` (Assistant IA d'analyse GRC)
- `express@^4.21.2` (Serveur HTTP pour production)

### Étape 4.2 — Configuration de l'API cible

Le frontend dispose d'un fichier `.env.local` à la racine pointant vers le backend Django :
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Étape 4.3 — Lancement du serveur Vite

```powershell
npm run dev
```

L'application web s'ouvre sur **`http://127.0.0.1:5173`** (ou le port indiqué par Vite).

---

## 5. Comptes de Démonstration et Personas

Tous les comptes ont pour mot de passe : **`PmeSecure2026!`**

| Utilisateur | Email | Profil / Rôle | Capacités principales |
|---|---|---|---|
| **Hamani Massaoudou** | `massaoudhamani10@gmail.com` | **Super Administrateur & RSSI** | Accès universel, administration IAM, gestion des politiques, édition de tous les modules |
| **Abdoul Salam Issifi** | `direction@sirbacom.ne` | **Admin Organisation & Risk Owner** | Direction de la PME, validation des risques d'entreprise et approbation des budgets d'action |
| **Aboubacar Yacouba Mai Birni** | `mentor.grc@apsi.ne` | **Auditeur Externe (APSI-NE)** | Évaluation de conformité SoA, consultation du protocole B14, audit des journaux de sécurité |
| **Aïchatou Diallo** | `a.diallo@sirbacom.ne` | **Propriétaire de Risque** | Gestion des risques pôle clients, déclarations d'incidents et mise à jour des actions |
| **Ibrahim Moussa** | `i.moussa@sirbacom.ne` | **Lecteur (Viewer)** | Consultation en lecture seule des tableaux de bord et indicateurs de sécurité |
| **Compte Suspendu** | `suspendu@demo.ne` | **Lecteur Désactivé** | Test du blocage HTTP 403 Forbidden sur compte suspendu |

> 💡 **Bascule rapide de profil (Persona Switcher) :**  
> Dans l'application, l'icône de profil en haut à droite permet de basculer instantanément d'un persona à un autre sans ressaisir le mot de passe, en générant un jeton JWT valide auprès du backend Django.

---

## 6. Vérification de la Qualité et Tests

### 6.1 Tests automatisés du Backend Django

Exécutez la suite complète de 12 tests automatisés :
```powershell
cd backend
.\venv\Scripts\activate
python manage.py test apps
```
**Résultat attendu :**
```
Ran 12 tests in ~15-20s
OK
```

### 6.2 Contrôle de Typage TypeScript
```powershell
npm run lint
```
*(Résultat : 0 erreur de typage).*

### 6.3 Compilation de Production Frontend
```powershell
npm run build
```
*(Résultat : Bundle optimisé généré dans `dist/` en ~2 à 3 secondes).*

---

## 7. Résolution des Problèmes Courants (Troubleshooting)

### Problème 1 : Erreur CORS dans le navigateur
- **Cause :** L'URL du frontend n'est pas répertoriée dans `CORS_ALLOWED_ORIGINS`.
- **Solution :** Vérifiez `backend/.env` ou `backend/grc_config/settings.py`. Les origines autorisées par défaut sont `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`.

### Problème 2 : Port 8000 déjà utilisé
- **Solution :** Spécifiez un autre port pour Django, par exemple :
  ```powershell
  python manage.py runserver 8080
  ```
  Et mettez à jour `.env.local` du frontend :
  ```env
  VITE_API_URL=http://127.0.0.1:8080/api
  ```

### Problème 3 : Réinitialisation complète de la base SQLite
Si vous souhaitez repartir d'une base vierge avec les données de démonstration :
```powershell
cd backend
Remove-Item db.sqlite3 -Force
python manage.py migrate
python manage.py load_demo_data
```

### Problème 4 : Upload de fichiers échoue (SoA preuves)
- **Cause :** Le dossier `backend/media/` n'existe pas ou n'a pas les permissions d'écriture.
- **Solution :** Assurez-vous que le dossier `media/` existe dans `backend/` et est accessible en écriture. Django le créera automatiquement lors du premier upload si les permissions sont correctes.

---

## 8. Architecture API et Sécurité

### 8.1 Authentification JWT
Le backend utilise **djangorestframework-simplejwt** avec les caractéristiques suivantes :
- **Access Token Lifetime :** 2 heures
- **Refresh Token Lifetime :** 7 jours
- **Rotation des refresh tokens :** Activée (sécurité renforcée)
- **Blacklist après rotation :** Activée (prévention de réutilisation)
- **Algorithme de signature :** HS256
- **Header d'authentification :** `Authorization: Bearer <token>`

Le frontend gère automatiquement le refresh des tokens via le service `api.ts`.

### 8.2 CORS Configuration
Les origines frontend autorisées par défaut sont :
- `http://localhost:3000` et `http://127.0.0.1:3000`
- `http://localhost:5173` et `http://127.0.0.1:5173`
- `http://localhost:5174` et `http://127.0.0.1:5174`

Pour ajouter une nouvelle origine, modifiez `backend/.env` ou `backend/grc_config/settings.py`.

### 8.3 Modèles de Données Récents
**UserAccount :**
- Remplacement de `organization_id` (CharField) par `organization` (ForeignKey vers Organization)
- Meilleure intégrité référentielle et support des requêtes relationnelles
- Maintien de `organization_ids` (JSONField) pour le support multi-organisations

**SoAControl :**
- Ajout de `evidence_file` (FileField) pour les pièces jointes de preuves
- Upload path : `soa_evidences/%Y/%m/`
- Support des fichiers PDF et images

### 8.4 Sérialiseurs API
Les serializers ont été mis à jour pour gérer les nouveaux champs :
- `UserAccountSerializer` : inclut `organization` et `organization_id` (read-only)
- `UserAccountCreateSerializer` : accepte `organization_id` et le convertit en ForeignKey
- `UserAccountUpdateSerializer` : gère la mise à jour de l'organisation
- `SoAControlCreateSerializer` : inclut `evidence_file` pour l'upload de preuves

---

## 9. Nouvelles Fonctionnalités

### 9.1 Assistant IA GRC (Gemini)
Le frontend intègre un assistant IA basé sur Google GenAI (`services/gemini.ts`) pour :
- Analyse des risques et recommandations de traitement
- Suggestions d'amélioration de la conformité SoA
- Génération de descriptions de contrôles
- Aide à la rédaction de plans d'actions

### 9.2 Export PDF Avancé
Le service `services/pdfExport.ts` utilise jsPDF pour générer :
- Rapports SoA complets avec les 93 contrôles
- Fiches d'évaluation B14
- Rapports de risques
- Plans d'actions correctives

### 9.3 Gestion des Preuves SoA
Les contrôles SoA peuvent maintenant inclure des pièces jointes :
- Upload de fichiers PDF et images via FileField
- Stockage organisé par date (`soa_evidences/%Y/%m/`)
- Références de preuves textuelles et fichiers

### 9.4 Isolation Organisationnelle Renforcée
La relation ForeignKey entre UserAccount et Organization assure :
- Intégrité référentielle stricte
- Suppression en cascade contrôlée
- Requêtes relationnelles optimisées
- Protection contre les données orphelines

---

## 10. Scripts Raccourcis (Racine)

Le fichier `package.json` à la racine du projet contient des scripts pratiques :
```json
{
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "clean": "cd frontend && npm run clean",
    "lint": "cd frontend && npm run lint"
  }
}
```

Vous pouvez lancer le frontend directement depuis la racine :
```powershell
npm run dev
```

---

## 11. Environnement de Production

### 11.1 Configuration Recommandée
Pour un déploiement en production, modifiez `backend/.env` :
```env
DEBUG=False
DJANGO_SECRET_KEY=<votre-clé-secrète-forte>
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com
CORS_ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

### 11.2 Base de Données de Production
Pour la production, il est recommandé de migrer vers PostgreSQL :
1. Installer `psycopg2-binary`
2. Modifier la configuration DATABASE dans `settings.py`
3. Exécuter les migrations sur la nouvelle base

### 11.3 Stockage de Fichiers
Pour la production, utilisez un stockage cloud (AWS S3, MinIO) :
- Installer `django-storages`
- Configurer les paramètres AWS S3 ou MinIO
- Modifier `MEDIA_URL` et `MEDIA_ROOT`

### 11.4 Serveur de Production
Utilisez Gunicorn ou uWSGI pour servir Django :
```powershell
pip install gunicorn
gunicorn grc_config.wsgi:application --bind 0.0.0.0:8000
```

Pour le frontend, servez les fichiers statiques avec Nginx ou utilisez le serveur Express intégré.

---

## 12. Support et Maintenance

### 12.1 Logs et Débogage
- **Backend Django :** Logs dans la console (développement) ou fichiers (production)
- **Frontend React :** Console du navigateur (F12)
- **Base de données :** `backend/db.sqlite3` (peut être inspecté avec DB Browser for SQLite)

### 12.2 Mises à jour
Pour mettre à jour les dépendances :
```powershell
# Backend
cd backend
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
```

### 12.3 Sauvegarde
Sauvegardez régulièrement :
- `backend/db.sqlite3` (base de données)
- `backend/media/` (fichiers uploadés)
- `backend/.env` (configuration sensible)

---

## 13. Ressources Supplémentaires

- **Documentation Django :** https://docs.djangoproject.com/
- **Documentation DRF :** https://www.django-rest-framework.org/
- **Documentation React :** https://react.dev/
- **Documentation Vite :** https://vitejs.dev/
- **Standard ISO 27001:2022 :** https://www.iso.org/standard/81275.html

---

**Dernière mise à jour du guide :** Novembre 2026
**Version du projet :** 1.0.0
**Développeur :** Hamani Massaoudou (APSI-NE / Niger Cyber Security)
