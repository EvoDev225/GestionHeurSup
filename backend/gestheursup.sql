-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  jeu. 02 avr. 2026 à 12:54
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `statut` enum('valide','en_attente','rejete') DEFAULT 'en_attente',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idenseigner`),
  KEY `fk_enseigner_ens` (`idens`),
  KEY `fk_enseigner_mat` (`idmat`),
  KEY `fk_enseigner_anac` (`idanac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `journal`
--

DROP TABLE IF EXISTS `journal`;
CREATE TABLE IF NOT EXISTS `journal` (
  `idjourn` int(11) NOT NULL AUTO_INCREMENT,
  `idutil` int(11) NOT NULL,
  `description` text NOT NULL,
  `action` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idjourn`),
  KEY `fk_journal_util` (`idutil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `statut` enum('assignee','non_assignee') DEFAULT 'non_assignee',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`idmat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idutil`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Contraintes pour la table `journal`
--
ALTER TABLE `journal`
  ADD CONSTRAINT `fk_journal_util` FOREIGN KEY (`idutil`) REFERENCES `utilisateur` (`idutil`) ON DELETE CASCADE ON UPDATE CASCADE;

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
