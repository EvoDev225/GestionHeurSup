-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 10 avr. 2026 à 00:35
-- Version du serveur :  10.4.10-MariaDB
-- Version de PHP :  7.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `gestheursup`
--

-- --------------------------------------------------------

--
-- Structure de la table `administrateur`
--

DROP TABLE IF EXISTS `administrateur`;
CREATE TABLE IF NOT EXISTS `administrateur` (
  `idadmin` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `idutil` int(11) NOT NULL,
  PRIMARY KEY (`idadmin`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `idutil` (`idutil`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `administrateur`
--

INSERT INTO `administrateur` (`idadmin`, `reference`, `idutil`) VALUES
(2, 'ADM-20260402-0001', 5);

-- --------------------------------------------------------

--
-- Structure de la table `annee_academique`
--

DROP TABLE IF EXISTS `annee_academique`;
CREATE TABLE IF NOT EXISTS `annee_academique` (
  `idanac` int(11) NOT NULL AUTO_INCREMENT,
  `date_debut` year(4) NOT NULL,
  `date_fin` year(4) NOT NULL,
  `equ_cm_td` decimal(4,2) NOT NULL DEFAULT 1.50,
  `equ_cm_tp` decimal(4,2) NOT NULL DEFAULT 2.00,
  `statut` enum('en_cours','terminee') DEFAULT 'en_cours',
  PRIMARY KEY (`idanac`)
) ;

--
-- Déchargement des données de la table `annee_academique`
--

INSERT INTO `annee_academique` (`idanac`, `date_debut`, `date_fin`, `equ_cm_td`, `equ_cm_tp`, `statut`) VALUES
(2, 2025, 2026, '1.50', '2.00', 'en_cours');

-- --------------------------------------------------------

--
-- Structure de la table `enseignant`
--

DROP TABLE IF EXISTS `enseignant`;
CREATE TABLE IF NOT EXISTS `enseignant` (
  `idens` int(11) NOT NULL AUTO_INCREMENT,
  `referencens` varchar(50) NOT NULL,
  `grade` varchar(100) NOT NULL,
  `statut` enum('permanent','vacataire') NOT NULL,
  `departement` varchar(100) NOT NULL,
  `tauxh` decimal(10,2) NOT NULL DEFAULT 0.00,
  `idutil` int(11) NOT NULL,
  PRIMARY KEY (`idens`),
  UNIQUE KEY `referencens` (`referencens`),
  UNIQUE KEY `idutil` (`idutil`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `enseignant`
--

INSERT INTO `enseignant` (`idens`, `referencens`, `grade`, `statut`, `departement`, `tauxh`, `idutil`) VALUES
(2, 'ENS-20260403-0001', 'Maître de conférence', 'permanent', 'Informatique', '5000.00', 14),
(10, 'ENS-20260407-0002', 'Maître de conférence', 'permanent', 'Droit', '6000.00', 24);

-- --------------------------------------------------------

--
-- Structure de la table `enseigner`
--

DROP TABLE IF EXISTS `enseigner`;
CREATE TABLE IF NOT EXISTS `enseigner` (
  `idenseigner` int(11) NOT NULL AUTO_INCREMENT,
  `idens` int(11) NOT NULL,
  `idmat` int(11) NOT NULL,
  `idanac` int(11) NOT NULL,
  `date` date NOT NULL,
  `type` enum('CM','TD','TP') NOT NULL,
  `duree` decimal(4,2) NOT NULL,
  `salle` varchar(50) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idenseigner`),
  KEY `fk_enseigner_ens` (`idens`),
  KEY `fk_enseigner_mat` (`idmat`),
  KEY `fk_enseigner_anac` (`idanac`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `enseigner`
--

INSERT INTO `enseigner` (`idenseigner`, `idens`, `idmat`, `idanac`, `date`, `type`, `duree`, `salle`, `observation`, `created_at`) VALUES
(14, 2, 7, 2, '2026-04-09', 'CM', '2.00', 'Salle 13', NULL, '2026-04-09 20:16:00');

-- --------------------------------------------------------

--
-- Structure de la table `journal`
--

DROP TABLE IF EXISTS `journal`;
CREATE TABLE IF NOT EXISTS `journal` (
  `idjourn` int(11) NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `action` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idjourn`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `journal`
--

INSERT INTO `journal` (`idjourn`, `description`, `action`, `created_at`) VALUES
(4, 'Ajout d\'une séance CM pour l\'enseignant id 2 — matière id 4', 'INSERT', '2026-04-04 00:43:56'),
(5, 'Mise à jour de l\'année académique id 2', 'UPDATE', '2026-04-06 23:22:12'),
(6, 'Ajout de l\'enseignant Carl Marx', 'INSERT', '2026-04-06 23:45:06'),
(7, 'Mise à jour de l\'utilisateur id 23', 'UPDATE', '2026-04-06 23:47:32'),
(8, 'Suppression de l\'utilisateur id 23', 'DELETE', '2026-04-06 23:48:02'),
(9, 'Changement de statut de l\'utilisateur id 14 → inactif', 'UPDATE', '2026-04-07 00:28:57'),
(10, 'Changement de statut de l\'utilisateur id 14 → actif', 'UPDATE', '2026-04-07 00:29:01'),
(11, 'Mise à jour de l\'utilisateur id 14', 'UPDATE', '2026-04-07 00:29:43'),
(12, 'Mise à jour de l\'année académique id 2', 'UPDATE', '2026-04-07 00:30:03'),
(13, 'Mise à jour de l\'année académique id 2', 'UPDATE', '2026-04-07 00:30:07'),
(14, 'Suppression de l\'utilisateur id 13', 'DELETE', '2026-04-07 12:17:34'),
(15, 'Ajout de l\'enseignant Marco Polo', 'INSERT', '2026-04-07 12:18:45'),
(16, 'Changement de statut de l\'utilisateur id 24 → inactif', 'UPDATE', '2026-04-07 12:21:22'),
(17, 'Changement de statut de l\'utilisateur id 24 → actif', 'UPDATE', '2026-04-07 12:21:26'),
(18, 'Mise à jour de la matière id 6', 'UPDATE', '2026-04-08 00:26:23'),
(19, 'Suppression de la matière id 6', 'DELETE', '2026-04-08 00:26:30'),
(20, 'Mise à jour de la matière id 7', 'UPDATE', '2026-04-08 23:13:00'),
(21, 'Ajout d\'une séance CM pour l\'enseignant id 2 — matière id 7', 'INSERT', '2026-04-08 23:35:24'),
(22, 'Ajout d\'une séance TD pour l\'enseignant id 2 — matière id 7', 'INSERT', '2026-04-08 23:36:19'),
(23, 'Ajout d\'une séance TP pour l\'enseignant id 2 — matière id 7', 'INSERT', '2026-04-08 23:36:28'),
(24, 'Ajout d\'une séance TD pour l\'enseignant id 2 — matière id 7', 'INSERT', '2026-04-08 23:47:58'),
(25, 'Ajout d\'une séance TP pour l\'enseignant id 10 — matière id 7', 'INSERT', '2026-04-09 18:28:33'),
(26, 'Suppression de la séance id 13', 'DELETE', '2026-04-09 20:14:51'),
(27, 'Suppression de la séance id 7', 'DELETE', '2026-04-09 20:15:25'),
(28, 'Suppression de la séance id 6', 'DELETE', '2026-04-09 20:15:28'),
(29, 'Suppression de la séance id 5', 'DELETE', '2026-04-09 20:15:31'),
(30, 'Suppression de la séance id 4', 'DELETE', '2026-04-09 20:15:36'),
(31, 'Ajout d\'une séance CM pour l\'enseignant id 2 — matière id 7', 'INSERT', '2026-04-09 20:16:00'),
(32, 'Mise à jour de la séance id 14', 'UPDATE', '2026-04-09 20:40:05');

-- --------------------------------------------------------

--
-- Structure de la table `matiere`
--

DROP TABLE IF EXISTS `matiere`;
CREATE TABLE IF NOT EXISTS `matiere` (
  `idmat` int(11) NOT NULL AUTO_INCREMENT,
  `intitule` varchar(150) NOT NULL,
  `filiere` varchar(100) NOT NULL,
  `niveau` enum('L1','L2','L3','M1','M2') NOT NULL,
  `volumhor` decimal(6,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idmat`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `matiere`
--

INSERT INTO `matiere` (`idmat`, `intitule`, `filiere`, `niveau`, `volumhor`, `created_at`) VALUES
(7, 'Algorithme et Programmation', 'Informatique', 'L1', '60.00', '2026-04-08 23:12:02');

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

DROP TABLE IF EXISTS `paiement`;
CREATE TABLE IF NOT EXISTS `paiement` (
  `idpaie` int(11) NOT NULL AUTO_INCREMENT,
  `idens` int(11) NOT NULL,
  `idanac` int(11) NOT NULL,
  `datepaie` date NOT NULL,
  `montpaie` decimal(12,2) NOT NULL DEFAULT 0.00,
  `mois` varchar(20) NOT NULL,
  `statut` enum('genere','valide','paye') DEFAULT 'genere',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idpaie`),
  KEY `fk_paiement_ens` (`idens`),
  KEY `fk_paiement_anac` (`idanac`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `paiement`
--

INSERT INTO `paiement` (`idpaie`, `idens`, `idanac`, `datepaie`, `montpaie`, `mois`, `statut`, `created_at`) VALUES
(2, 2, 2, '2026-04-03', '160000.00', 'Avril', 'paye', '2026-04-03 18:23:57');

-- --------------------------------------------------------

--
-- Structure de la table `ressource_humaine`
--

DROP TABLE IF EXISTS `ressource_humaine`;
CREATE TABLE IF NOT EXISTS `ressource_humaine` (
  `idrh` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `idutil` int(11) NOT NULL,
  PRIMARY KEY (`idrh`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `idutil` (`idutil`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `ressource_humaine`
--

INSERT INTO `ressource_humaine` (`idrh`, `reference`, `idutil`) VALUES
(1, 'RH-20260402-0001', 6);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `idutil` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `sexe` enum('M','F') NOT NULL,
  `email` varchar(150) NOT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `role` enum('admin','rh','enseignant') NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `stat` enum('actif','inactif') DEFAULT 'actif',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idutil`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`idutil`, `nom`, `prenom`, `sexe`, `email`, `contact`, `role`, `mdp`, `stat`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`) VALUES
(5, 'Doe', 'John', 'M', 'John2@gmail.com', '0101010101', 'admin', '$2b$10$e3NuJumAlg7owcuuNUt4sOfPEbcPK3o9BGriWDnRMW1CR0ZycFz.a', 'actif', NULL, NULL, '2026-04-02 15:36:46', '2026-04-02 17:17:53'),
(6, 'Hong', 'Chenlee', 'F', 'Chenlee@gmail.com', NULL, 'rh', '$2b$10$3YzDpo4a9oGKgQA29F1wUeiens7hp0QxLAA02xYaMUac3yrLcO7QC', 'actif', NULL, NULL, '2026-04-02 15:38:39', '2026-04-02 19:04:15'),
(14, 'Kouassi', 'Jean-Marc', 'M', 'jm.kouassi@univ.ci', '0709080506', 'enseignant', '$2b$10$IVITztBABt0SIyZhBbJhTemSo1LFDHYDYzwlf0lYFObn/yR5/.Gxq', 'actif', NULL, NULL, '2026-04-03 18:21:18', '2026-04-07 00:29:43'),
(24, 'Marco', 'Polo', 'M', 'polo@gmail.com', '0574879963', 'enseignant', '$2b$10$QUvRfLbcWhUZ0EVHQ8p9yec.OySFmenNkO.UkgP0OM7hqG8UixkZ6', 'actif', NULL, NULL, '2026-04-07 12:18:45', '2026-04-07 12:21:26');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `administrateur`
--
ALTER TABLE `administrateur`
  ADD CONSTRAINT `fk_admin_util` FOREIGN KEY (`idutil`) REFERENCES `utilisateur` (`idutil`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `enseignant`
--
ALTER TABLE `enseignant`
  ADD CONSTRAINT `fk_ens_util` FOREIGN KEY (`idutil`) REFERENCES `utilisateur` (`idutil`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `enseigner`
--
ALTER TABLE `enseigner`
  ADD CONSTRAINT `fk_enseigner_anac` FOREIGN KEY (`idanac`) REFERENCES `annee_academique` (`idanac`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enseigner_ens` FOREIGN KEY (`idens`) REFERENCES `enseignant` (`idens`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enseigner_mat` FOREIGN KEY (`idmat`) REFERENCES `matiere` (`idmat`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `fk_paiement_anac` FOREIGN KEY (`idanac`) REFERENCES `annee_academique` (`idanac`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_paiement_ens` FOREIGN KEY (`idens`) REFERENCES `enseignant` (`idens`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `ressource_humaine`
--
ALTER TABLE `ressource_humaine`
  ADD CONSTRAINT `fk_rh_util` FOREIGN KEY (`idutil`) REFERENCES `utilisateur` (`idutil`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
