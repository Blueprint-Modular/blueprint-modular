-- Configuration base locale pour blueprint-modular
-- Guide pas à pas : voir docs/SETUP-DB-LOCAL.md
--
-- IMPORTANT : exécuter en DEUX FOIS (pgAdmin ne peut pas exécuter CREATE DATABASE
-- dans une même transaction). Même mot de passe dans les deux parties.
--
-- 1) Remplacer MON_MOT_DE_PASSE par ton mot de passe ci-dessous (2 endroits).
-- 2) Exécuter toute la PARTIE 1 (sélectionner de "PARTIE 1" jusqu'à la fin de ALTER USER), puis F5.
-- 3) Exécuter toute la PARTIE 2 (sélectionner de "PARTIE 2" jusqu'à la fin), puis F5.

-- ========== PARTIE 1 : Créer l'utilisateur ==========
-- (Sélectionner de cette ligne jusqu'à "ALTER USER ... CREATEDB;" inclus, puis F5)

CREATE USER blueprint_user WITH PASSWORD 'MON_MOT_DE_PASSE';
ALTER USER blueprint_user CREATEDB;

-- ========== PARTIE 2a : Créer la base (UNE SEULE LIGNE, puis F5) ==========
-- Important : sélectionner UNIQUEMENT la ligne suivante, sinon erreur "cannot run inside a transaction block"

CREATE DATABASE blueprint_modular OWNER blueprint_user;

-- ========== PARTIE 2b : Droits (sélectionner les 2 lignes ci-dessous, puis F5) ==========

GRANT ALL ON SCHEMA public TO blueprint_user;
GRANT ALL PRIVILEGES ON DATABASE blueprint_modular TO blueprint_user;

-- Ensuite, dans .env à la racine du projet :
-- DATABASE_URL=postgresql://blueprint_user:MON_MOT_DE_PASSE@localhost:5432/blueprint_modular
-- Si le mot de passe contient @ # : / % etc., l'encoder en %XX (ex. @ -> %40, / -> %2F).
