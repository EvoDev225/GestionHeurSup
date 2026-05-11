# EduGest — Système de Gestion des Heures d'Enseignement du Supérieur

> Application web fullstack de gestion des heures d'enseignement, de validation et de calcul de rémunération des enseignants dans les établissements d'enseignement supérieur.

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancement](#lancement)
- [Rôles et accès](#rôles-et-accès)
- [Modules principaux](#modules-principaux)
- [Auteur](#auteur)

---

## Aperçu

**EduGest** est une application fullstack développée pour automatiser la gestion des heures d'enseignement dans les établissements du supérieur. Elle couvre l'ensemble du cycle : saisie des heures par les enseignants, validation par le service RH, calcul de la rémunération (incluant les dépassements), et génération de rapports exportables en PDF et Excel.

L'accès est sécurisé par authentification JWT avec des tableaux de bord différenciés selon le rôle de l'utilisateur.

---

## Fonctionnalités

### Commun à tous les rôles
- Authentification sécurisée (JWT via cookies HTTP-only)
- Modification du profil (nom, prénom, email, mot de passe)
- Réinitialisation du mot de passe par email
- Interface responsive avec support du thème clair/sombre

### Administrateur
- Gestion des utilisateurs (CRUD : Admin, RH, Enseignant)
- Gestion des matières (CRUD)
- Gestion des années académiques et des paramètres globaux
- Consultation des statistiques générales
- Journal d'audit des actions (logs)
- Import de données (enseignants, matières)
- Export global (PDF / Excel)

### Responsable RH
- Validation des heures saisies par les enseignants
- Saisie manuelle des heures
- Consultation et export des statistiques RH
- Calcul automatique des rémunérations et dépassements

### Enseignant
- Saisie des heures par type (CM, TD, TP)
- Consultation du récapitulatif personnel
- Visualisation de la rémunération calculée

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Composants UI | shadcn/ui, Framer Motion, react-icons |
| Graphiques | Chart.js (react-chartjs-2) |
| Notifications | react-hot-toast |
| Backend | Node.js 24.1.0, Express.js |
| Base de données | MySQL 8.0.18 (requêtes SQL brutes, sans ORM) |
| Authentification | JWT (cookies HTTP-only) |
| Emails | Nodemailer |
| Exports | pdfkit-table (PDF), ExcelJS (Excel) |

---

## Architecture du projet

```
EduGest/
│
├── APPLICATION/                  # Backend Node.js/Express
│   ├── src/
│   │   ├── config/               # Configuration DB et autres
│   │   ├── controllers/
│   │   │   ├── anneeController.js
│   │   │   ├── enseignerController.js
│   │   │   ├── exportController.js
│   │   │   ├── importController.js
│   │   │   ├── journalController.js
│   │   │   ├── journalHelper.js   # Utilitaire audit log
│   │   │   ├── matiereController.js
│   │   │   ├── paieController.js
│   │   │   ├── statsController.js
│   │   │   └── userController.js
│   │   ├── mail/
│   │   │   ├── mail.js
│   │   │   └── template.js
│   │   ├── middlewares/
│   │   │   ├── generateJWT.js
│   │   │   ├── genererRef.js
│   │   │   └── verificationJeton.js
│   │   └── routes/
│   │       ├── importRoutes.js
│   │       ├── routeAnac.js
│   │       ├── routeEnseigner.js
│   │       ├── routeExport.js
│   │       ├── routeJournal.js
│   │       ├── routeMatiere.js
│   │       ├── routePaie.js
│   │       ├── routeStats.js
│   │       └── routeUtilisateur.js
│   ├── index.js                  # Point d'entrée Express
│   ├── gestheursup.sql           # Script SQL de la base de données
│   ├── .env
│   └── package.json
│
└── frontend/                     # Frontend React/Vite
    ├── public/
    └── src/
        ├── Admin/                # Composants dashboard Admin
        │   ├── DashboardAdmin*.jsx
        │   └── SidebarAdmin.jsx
        ├── Enseignant/           # Composants dashboard Enseignant
        │   ├── DashboardEns*.jsx
        │   └── SidebarEnseignant.jsx
        ├── RH/                   # Composants dashboard RH
        │   ├── DashboardRH*.jsx
        │   ├── SidebarRH.jsx
        │   └── ImportModal.jsx
        ├── context/
        │   └── ThemeContext.jsx  # Gestion du thème clair/sombre
        ├── fonctions/            # Appels API (Axios)
        │   ├── Anac.jsx
        │   ├── Enseigner.jsx
        │   ├── Export.jsx
        │   ├── Import.jsx
        │   ├── Journal.jsx
        │   ├── Matiere.jsx
        │   ├── Stats.jsx
        │   └── Utilisateur.jsx
        ├── Navbar.jsx
        ├── Sidebar.jsx
        ├── Accueil.jsx
        ├── Motdepasse.jsx        # Réinitialisation mot de passe
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        └── vite.config.js
```

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) **v24.1.0** ou supérieur
- [MySQL](https://www.mysql.com/) **8.0.18** ou supérieur
- Un client MySQL (MySQL Workbench, phpMyAdmin, WAMP, etc.)
- `npm` ou `yarn`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/<votre-username>/edugest.git
cd edugest
```

### 2. Créer la base de données

Depuis votre client MySQL, exécutez le script fourni :

```sql
SOURCE APPLICATION/gestheursup.sql;
```

Ou via la ligne de commande :

```bash
mysql -u root -p < APPLICATION/gestheursup.sql
```

### 3. Installer les dépendances backend

```bash
cd APPLICATION
npm install
```

### 4. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

---

## Variables d'environnement

Créez un fichier `.env` à la racine du dossier `APPLICATION/` avec le contenu suivant :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gestheursup
NODE_ENV=development
JWT_SECRET_KEY=myconnection
EMAIL=votre_email@gmail.com
PASSWORD=votre_mot_de_passe_app
LINK=http://localhost:3000
FRONT_ADD=http://localhost:5173
```

> ⚠️ **Important** : Ne commitez jamais votre fichier `.env` sur un dépôt public. Il est déjà listé dans le `.gitignore`.

> 📧 **EMAIL / PASSWORD** : utilisez un mot de passe d'application Gmail (Google App Password), pas votre mot de passe principal.

---

## Lancement

### Démarrer le backend

```bash
cd APPLICATION
npm run dev
# ou
node index.js
```

Le serveur démarre sur : `http://localhost:3000`

### Démarrer le frontend

```bash
cd frontend
npm run dev
```

L'application est accessible sur : `http://localhost:5173`

> Lancez le backend **avant** le frontend.

---

## Rôles et accès

| Rôle | Description | Accès |
|---|---|---|
| `admin` | Administrateur système | Gestion complète : utilisateurs, matières, années, logs, stats, imports/exports |
| `rh` | Responsable RH | Validation des heures, saisie, calcul rémunérations, exports RH |
| `enseignant` | Enseignant | Saisie de ses heures, consultation de son récapitulatif et de sa rémunération |

Les comptes sont créés par l'administrateur. La connexion génère un token JWT stocké en cookie HTTP-only.

---

## Modules principaux

### Calcul de rémunération

La formule appliquée pour le calcul du montant dû à un enseignant est :

```
montant = (nb_cm + nb_td × equ_cm_td + nb_tp × equ_cm_tp) × tauxh
```

Où `equ_cm_td`, `equ_cm_tp` et `tauxh` sont des paramètres configurables par l'administrateur via le module **Paramètres** / **Année académique**.

### Exports

- **PDF** : générés avec `pdfkit-table`, disponibles par enseignant ou globalement
- **Excel** : générés avec `ExcelJS`, avec feuilles formatées par rôle

### Journal d'audit

Chaque action significative (création, modification, suppression, validation) est enregistrée via `journalHelper.js` avec horodatage, utilisateur et description de l'action.

### Réinitialisation du mot de passe

Flux complet par email : l'utilisateur reçoit un lien temporaire pour redéfinir son mot de passe sans intervention de l'administrateur.

---

## Auteur

**Kambou Oziel**
Étudiant en Licence 3 — Réseaux et Génie Logiciel
[Pigier Côte d'Ivoire](https://www.pigier.com/cote-d-ivoire), Abidjan

---

> Projet académique — Tous droits réservés © 2025 Kambou Oziel
