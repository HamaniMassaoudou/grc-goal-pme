# GRC-Goal-PME

Système de Management de la Sécurité de l'Information (SMSI) et Plateforme de Gouvernance, Risques et Conformité (GRC) pour PME, conforme au standard international **ISO/IEC 27001:2022**.

---

## 🏛️ Architecture du Projet

GRC-Goal-PME est une application web Full-Stack professionnelle découplée :

- **Frontend :** Single Page Application (SPA) développée en **React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Lucide Icons**.
- **Backend :** API REST modulaire développée en **Python 3.12+ + Django 5 + Django REST Framework (DRF) + SimpleJWT**.
- **Base de données :** **SQLite3** (`backend/db.sqlite3`) configurée avec relations d'intégrité, contraintes d'unicité, cascades contrôlées et support multi-organisations.
- **Sécurité & RBAC :** Authentification JWT Bearer avec rotation des tokens, hachage sécurisé des mots de passe (PBKDF2/SHA256), isolation organisationnelle des données et matrice RBAC stricte sur chaque ressource.

---

## 🚀 Démarrage Rapide

### Prérequis

- **Python 3.10+** (recommandé : Python 3.12)
- **Node.js 18+** (recommandé : Node.js 22 LTS)
- **npm** (inclus avec Node.js)

---

### Étape 1 : Initialisation du Backend Django

1. Ouvrez un terminal dans le dossier `backend` :
   ```bash
   cd backend
   ```

2. Créez et activez l'environnement virtuel Python :
   - **Windows PowerShell :**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS :**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

4. Appliquez les migrations vers la base SQLite :
   ```bash
   python manage.py migrate
   ```

5. Chargez le jeu complet de données de démonstration :
   ```bash
   python manage.py load_demo_data
   ```

6. Lancez le serveur de développement Django :
   ```bash
   python manage.py runserver 8000
   ```
   > Le backend est accessible sur **http://127.0.0.1:8000**  
   > L'interface d'administration Django est sur **http://127.0.0.1:8000/admin/**

---

### Étape 2 : Lancement du Frontend React

1. Ouvrez un **second terminal** dans le dossier `frontend` (ou utilisez le raccourci racine) :
   ```bash
   cd frontend
   npm install
   ```

2. Démarrez le serveur Vite :
   ```bash
   npm run dev
   ```
   > L'application frontend est accessible sur **http://127.0.0.1:5173** (ou port configuré par Vite).

*(Note : Vous pouvez également lancer `npm run dev` directement depuis la racine du projet).*

---

## 👥 Comptes de Démonstration

Tous les comptes de démonstration sont pré-configurés avec le mot de passe : **`PmeSecure2026!`**

| Nom & Prénom | Email | Rôle RBAC | Périmètre / Fonction |
|---|---|---|---|
| **Hamani Massaoudou** | `massaoudhamani10@gmail.com` | **Super Administrateur** & RSSI | Concepteur GRC-Goal & Développeur B14 (Droits complets) |
| **Abdoul Salam Issifi** | `direction@sirbacom.ne` | **Admin Organisation** & Risk Owner | Gérant de Sirba Communication SARL (Validation, Risques) |
| **Aboubacar Yacouba Mai Birni** | `mentor.grc@apsi.ne` | **Auditeur** | Mentor Référent GRC — APSI-NE (Consultation, Évaluation SoA) |
| **Aïchatou Diallo** | `a.diallo@sirbacom.ne` | **Propriétaire de Risque** | Responsable Pôle Clients & Facturation |
| **Ibrahim Moussa** | `i.moussa@sirbacom.ne` | **Lecteur (Viewer)** | Graphiste & Chargé de Projets Web |
| **Compte Suspendu** | `suspendu@demo.ne` | **Lecteur (Suspendu)** | Démonstration du blocage de sécurité HTTP 403 |

---

## 🧪 Tests Automatisés

### Tests du Backend Django
Le projet inclut une suite de tests unitaires et d'intégration couvrant l'authentification JWT, l'étanchéité des rôles RBAC, le calcul des risques ISO 27005, le catalogue des 93 mesures SoA ISO 27001:2022 et le protocole d'évaluation :

```bash
cd backend
.\venv\Scripts\activate
python manage.py test apps
```
*(Résultat : `Ran 12 tests - OK`)*

### Contrôle TypeScript & Build de Production Frontend
```bash
# Vérification des types
npm run lint

# Génération du bundle optimisé
npm run build
```

---

## 📊 Modules Métier Intégrés

1. **Tableau de Bord Exécutif :** Vue consolidée des scores de sécurité, radar des 4 domaines ISO 27001, top risques et actions prioritaires.
2. **Gestion des Risques (ISO 27005) :** Identification, calcul automatique du score ($Score = P \times I$) et du niveau qualitatif (Faible, Moyen, Élevé, Critique), stratégies de traitement (Réduire, Transférer, Accepter, Éviter) et calcul du risque résiduel.
3. **Déclaration d'Applicabilité (SoA ISO 27001:2022) :** Référentiel complet des **93 contrôles** répartis sur les 4 domaines (A.5 Organisationnel, A.6 Personnes, A.7 Physique, A.8 Technologique), suivi de maturité (1 à 5), statuts de mise en œuvre et références de preuves.
4. **Plans d'Actions Correctives :** Création, assignation, suivi des échéances, commentaires de suivi et clôture formelle avec pièces justificatives.
5. **Inventaire des Actifs :** Cartographie du SI par catégories (matériel, logiciel, réseau, données, personnes, prestataires) et criticité (Faible, Moyenne, Élevée, Critique).
6. **Gouvernance & IAM :** Gestion des profils collaborateurs, gestion des utilisateurs, définition des rôles personnalisés avec matrice de permissions granulaires et journal d'audit de sécurité inviolable.
7. **Protocole de Validation & Fiches B14 :** Grilles d'évaluation de la conformité, suivi des critères d'homologation et rapports d'audits.
8. **Centre de Notifications :** Alertes contextuelles en temps réel sur les risques critiques et actions en retard.
9. **Exports & Rapports :** Génération de rapports complets au format PDF et exports CSV.

---

## 📁 Arborescence du Projet

```
grc-goal-pme/
├── backend/                             # Backend Python / Django
│   ├── apps/
│   │   ├── actions/                     # Plans d'actions correctives
│   │   ├── assets/                      # Cartographie des actifs du SI
│   │   ├── core/                        # Preuves scellées SHA-256 & commandes (load_demo_data)
│   │   ├── governance/                  # Collaborateurs et gouvernance
│   │   ├── notifications/               # Système de notifications
│   │   ├── organizations/               # Entités & organisations multi-tenant
│   │   ├── risks/                       # Gestion des risques ISO 27005
│   │   ├── soa/                         # Catalogue SoA 93 contrôles ISO 27001:2022
│   │   ├── testing/                     # Fiches de tests B14 & protocoles
│   │   └── users/                       # Authentification JWT, IAM, Rôles & Audit
│   ├── grc_config/                      # Configuration Django (settings, urls, wsgi)
│   ├── db.sqlite3                       # Base de données relationnelle SQLite
│   ├── manage.py                        # CLI Django
│   └── requirements.txt                 # Dépendances Python
│
├── frontend/                            # Application Frontend React 19 + TypeScript
│   ├── src/                             # Code source de l'interface utilisateur
│   │   ├── components/                  # Composants UI modulaires (lazy-loaded)
│   │   ├── services/
│   │   │   ├── api.ts                   # Client REST HTTP et communication backend
│   │   │   ├── apiAdapter.ts            # Adaptateur bi-directionnel snake_case <-> camelCase
│   │   │   ├── gemini.ts                # Assistant IA d'analyse GRC
│   │   │   ├── pdfExport.ts             # Moteur d'export PDF officiel SoA et fiches B14
│   │   │   └── security.ts              # Fonctions utilitaires de sécurité
│   │   ├── types/                       # Typages TypeScript stricts
│   │   ├── App.tsx                      # Composant racine & orchestrateur d'état
│   │   └── index.css                    # Styles Tailwind CSS v4
│   ├── index.html                       # Point d'entrée HTML
│   ├── package.json                     # Dépendances et scripts frontend
│   ├── tsconfig.json                    # Configuration TypeScript frontend
│   ├── vite.config.ts                   # Configuration de bundling Vite
│   └── .env.local                       # Configuration locale (VITE_API_URL)
│
├── docs/                                # Documentation technique et guides d'installation
├── package.json                         # Raccourcis racine de build et dev
└── README.md                            # Documentation générale du projet
```

---

## 📄 Licence & Reconnaissance

Ce projet est développé et maintenu par **Hamani Massaoudou** dans le cadre du programme de renforcement des compétences en cybersécurité et conformité pour les PME (**APSI-NE / Niger Cyber Security**).
