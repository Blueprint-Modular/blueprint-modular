# Créer la base de données en local (étape par étape)

Ce guide décrit comment créer l’utilisateur et la base PostgreSQL pour le projet, **avec pgAdmin**, en suivant les étapes une par une.

---

## Prérequis

- **PostgreSQL** est installé sur ton PC (sinon : [télécharger PostgreSQL](https://www.postgresql.org/download/windows/)).
- **pgAdmin** est en général installé en même temps que PostgreSQL. Si tu ne le vois pas, cherche « pgAdmin » dans le menu Démarrer.

---

## Étape 1 : Ouvrir pgAdmin

1. Lance **pgAdmin 4** depuis le menu Démarrer.
2. Au premier lancement, on peut te demander de définir un mot de passe pour pgAdmin : choisis-en un et mémorise-le (c’est pour protéger les mots de passe enregistrés dans pgAdmin, pas pour PostgreSQL).

---

## Étape 2 : Te connecter au serveur PostgreSQL

1. Dans la fenêtre de gauche, tu vois un arbre avec **Servers**.
2. Clique sur **Servers** pour l’ouvrir.
3. Tu devrais voir une entrée du type **PostgreSQL 16** (ou 15, 17 selon ta version). Double-clique dessus.
4. Une fenêtre **Password** s’ouvre : entre le **mot de passe de l’utilisateur postgres** (celui que tu as choisi à l’installation de PostgreSQL).  
   - Si tu ne t’en souviens plus, il faut le réinitialiser (voir la doc PostgreSQL) ou utiliser l’utilisateur Windows si PostgreSQL a été configuré comme ça.
5. Coche éventuellement « Save password » pour ne pas le ressaisir à chaque fois, puis valide.

Une fois connecté, l’icône du serveur a un petit point vert ou le serveur se déplie avec des dossiers (**Databases**, **Login/Group Roles**, etc.).

---

## Étape 3 : Ouvrir l’outil de requêtes (Query Tool)

1. Dans l’arbre de gauche, **clic droit** sur le nom du serveur (ex. **PostgreSQL 16**), pas sur « Servers ».
2. Dans le menu qui s’affiche, clique sur **Query Tool**.

Une nouvelle fenêtre (ou onglet) s’ouvre avec une grande zone de texte vide : c’est là qu’on va coller le script SQL.

---

## Étape 4 : Ouvrir le fichier du script et modifier le mot de passe

1. Dans cette fenêtre Query Tool, va au menu **File** (Fichier) → **Open** (Ouvrir).
2. Navigue jusqu’au dossier de ton projet :  
   `C:\Users\remi.cabrit\blueprint-modular\scripts`
3. Sélectionne le fichier **setup-db-local.sql** et ouvre-le.  
   Le contenu du script apparaît dans la zone de texte.

4. **Modifier le mot de passe** :  
   - Avec Ctrl+F, ouvre la recherche et cherche : `MON_MOT_DE_PASSE`  
   - Remplace **toute** la chaîne `MON_MOT_DE_PASSE` par le mot de passe que tu veux donner à l’utilisateur de la base (par ex. `MaSuperBdd2025`).  
   - Il doit apparaître **entre guillemets** : `'MaSuperBdd2025'`  
   - Tu peux laisser `blueprint_user` tel quel, ou le remplacer par un autre nom d’utilisateur si tu préfères.

Exemple : si tu choisis le mot de passe `MaSuperBdd2025`, la ligne doit devenir :

```sql
CREATE USER blueprint_user WITH PASSWORD 'MaSuperBdd2025';
```

---

## Étape 5 : Exécuter le script en deux fois

PostgreSQL n’accepte pas `CREATE DATABASE` dans une transaction. Il faut donc exécuter le script **en deux fois** dans pgAdmin.

### 5a – Première exécution (créer l’utilisateur)

1. Dans le script, **sélectionne** uniquement les deux lignes suivantes (sans les commentaires) :
   ```sql
   CREATE USER blueprint_user WITH PASSWORD 'MON_MOT_DE_PASSE';
   ALTER USER blueprint_user CREATEDB;
   ```
   (En ayant bien remplacé `MON_MOT_DE_PASSE` par ton mot de passe à la ligne 1.)

2. Appuie sur **F5** (ou clique sur le bouton **▶ Execute/Refresh**).

3. En bas, onglet **Messages** : tu dois voir `Query returned successfully...`. L’utilisateur est créé.

### 5b – Deuxième exécution : créer la base (une seule ligne)

pgAdmin exécute tout dans une transaction. **CREATE DATABASE** doit être lancé **tout seul**, sans autre instruction avec.

1. **Sélectionne uniquement cette ligne** (rien d’autre) :
   ```sql
   CREATE DATABASE blueprint_modular OWNER blueprint_user;
   ```

2. Appuie sur **F5**.

3. **Messages** : `Query returned successfully...`. La base est créée.

### 5c – Troisième exécution : donner les droits

1. **Sélectionne** ces deux lignes :
   ```sql
   GRANT ALL ON SCHEMA public TO blueprint_user;
   GRANT ALL PRIVILEGES ON DATABASE blueprint_modular TO blueprint_user;
   ```

2. Appuie sur **F5**.

3. **Messages** : `Query returned successfully...`. Tu peux passer à l’étape 6.

Si une erreur s’affiche (par ex. « role already exists » ou « database already exists »), l’utilisateur ou la base existent déjà ; tu peux passer à l’étape 6.

---

## Étape 6 : Mettre à jour ton fichier .env

1. Ouvre le fichier **.env** à la racine du projet :  
   `C:\Users\remi.cabrit\blueprint-modular\.env`

2. Repère ou ajoute la ligne **DATABASE_URL**. Elle doit ressembler à :

   ```
   DATABASE_URL=postgresql://blueprint_user:TON_MOT_DE_PASSE@localhost:5432/blueprint_modular
   ```

   Remplace **TON_MOT_DE_PASSE** par **exactement** le même mot de passe que celui que tu as mis dans le script à l’étape 4 (sans guillemets dans le .env).

   Exemple avec le mot de passe `MaSuperBdd2025` :

   ```
   DATABASE_URL=postgresql://blueprint_user:MaSuperBdd2025@localhost:5432/blueprint_modular
   ```

3. **Si ton mot de passe contient des caractères spéciaux** (`@`, `#`, `:`, `/`, `%`), il faut les coder dans l’URL. Voir la section « Encodage du mot de passe » dans [DATABASE.md](DATABASE.md#52-créer-lutilisateur-et-la-base-première-fois-en-local).

4. Enregistre le fichier .env.

---

## Étape 7 : Lancer Prisma

Dans un terminal, à la racine du projet :

```powershell
cd C:\Users\remi.cabrit\blueprint-modular
npx prisma migrate deploy
npx tsx prisma/seed-organizations.ts
```

Si tout est bon, les commandes se terminent sans erreur d’authentification.

---

## En résumé

| Étape | Action |
|-------|--------|
| 1 | Ouvrir pgAdmin |
| 2 | Se connecter au serveur (mot de passe **postgres**) |
| 3 | Clic droit sur le serveur → Query Tool |
| 4 | File → Open → `scripts/setup-db-local.sql`, remplacer `MON_MOT_DE_PASSE` par ton mot de passe |
| 5a | Sélectionner les 2 lignes `CREATE USER` et `ALTER USER`, puis F5 |
| 5b | Sélectionner **uniquement** la ligne `CREATE DATABASE ...`, puis F5 |
| 5c | Sélectionner les 2 lignes `GRANT`, puis F5 |
| 6 | Dans `.env`, mettre `DATABASE_URL=postgresql://blueprint_user:TON_MOT_DE_PASSE@localhost:5432/blueprint_modular` |
| 7 | Lancer `npx prisma migrate deploy` puis `npx tsx prisma/seed-organizations.ts` |

Si une étape bloque (par ex. tu ne trouves pas pgAdmin ou le mot de passe postgres), dis à quelle étape tu es et quel message d’erreur tu vois.
