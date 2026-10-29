# GRC-Goal-PME

Application de Gouvernance, Risques et Conformité (GRC) pour PME, conforme à ISO 27001:2022.

## Architecture

GRC-Goal-PME est une application web full-stack composée de :

- **Frontend :** React 19 + TypeScript + Vite + TailwindCSS
- **Backend :** Python + Django + Django REST Framework
- **Base de données :** SQLite

## Démarrage Rapide

### Prérequis

- Python 3.10+
- Node.js 18+
- npm ou yarn

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd grc-goal-pme
   ```

2. **Installer le backend Django**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py load_demo_data
   ```

3. **Installer le frontend React**
   ```bash
   cd frontend
   npm install
   ```

### Lancement

1. **Lancer le backend Django** (terminal 1)
   ```bash
   cd backend
   venv\Scripts\activate
   python manage.py runserver
   ```
   Accessible à : http://localhost:8000

2. **Lancer le frontend React** (terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Accessible à : http://localhost:3000

### Comptes de Démonstration

| Email | Mot de passe | Rôles |
|-------|-------------|-------|
| massaoudhamani10@gmail.com | PmeSecure2026! | Super Admin, RSSI |
| direction@sirbacom.ne | PmeSecure2026! | Org Admin, Risk Owner |
| mentor.grc@apsi.ne | PmeSecure2026! | Auditor |
| a.diallo@sirbacom.ne | PmeSecure2026! | Risk Owner |
| i.moussa@sirbacom.ne | PmeSecure2026! | Viewer |

## Documentation

- **Guide d'installation complet :** [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md)
- **Rapport d'audit :** [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md)

## Fonctionnalités

- **Gestion des risques :** Identification, évaluation (matrice 5x5), traitement
- **SoA ISO 27001:2022 :** 93 contrôles, applicabilité, maturité, preuves
- **Actions correctives :** Plan d'actions, suivi, clôture
- **Gestion des actifs :** Cartographie des actifs informationnels
- **Gouvernance :** Organisations, collaborateurs, rôles
- **IAM :** Gestion des utilisateurs, RBAC, audit de sécurité
- **Notifications :** Alertes contextuelles et rappels
- **Rapports :** Exports PDF et CSV

## Structure du Projet

```
grc-goal-pme/
├── frontend/              # Application React
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Application Django
│   ├── apps/              # Applications Django
│   ├── grc_config/        # Configuration
│   ├── manage.py
│   └── requirements.txt
├── docs/                  # Documentation
└── README.md
```

## Développement

### Backend Django

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend React

```bash
cd frontend
npm run dev
```

## Licence

Ce projet est développé dans le cadre du programme Cybersécurité Niger (APSI-NE).

## Support

Pour toute question, consultez la documentation dans le dossier `docs/`.
