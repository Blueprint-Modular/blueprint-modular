# Deploiement du site Blueprint Modular vers le VPS
# Usage: depuis le dossier blueprint-modular, executer .\deploy_blueprint_modular.ps1
# Prealable: dossier /var/www/blueprint-modular cree sur le serveur (voir DEPLOIEMENT_DOMAINE.md)

$ErrorActionPreference = "Stop"

$SSH_KEY = "$env:USERPROFILE\.ssh\portfolio_beam_key"
$SERVER_USER = "ubuntu"
$SERVER_IP = "145.239.199.236"
$REMOTE_PATH = "/var/www/blueprint-modular"

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "[ERREUR] Cle SSH introuvable: $SSH_KEY" -ForegroundColor Red
    Write-Host "   Modifiez `$SSH_KEY dans ce script ou creez la cle." -ForegroundColor Yellow
    exit 1
}

$files = @("index.html", "doc.css", "components.html", "reference.html", "cheat-sheet.html", "Logo BPM.png")
foreach ($f in $files) {
    if (-not (Test-Path $f)) {
        Write-Host "[ERREUR] Fichier manquant: $f" -ForegroundColor Red
        exit 1
    }
}

$scpFileList = @("index.html", "doc.css", "components.html", "reference.html", "cheat-sheet.html", "Logo BPM.png")
if (Test-Path "favicon.ico") {
    $scpFileList += "favicon.ico"
    Write-Host "favicon.ico inclus (optionnel)." -ForegroundColor Gray
}

Write-Host "Deploiement Blueprint Modular vers $SERVER_USER@${SERVER_IP}:$REMOTE_PATH" -ForegroundColor Cyan
Write-Host ""

# Copie des fichiers a la racine
$scpArgs = @("-i", $SSH_KEY) + $scpFileList + "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
& scp @scpArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec de la copie (scp). Verifiez la cle SSH et l'acces au serveur." -ForegroundColor Red
    exit 1
}

# Copie des dossiers de la doc (pour que la sidebar et les liens fonctionnent)
$docDirs = @("get-started", "api-reference", "deploy", "knowledge-base")
foreach ($dir in $docDirs) {
    if (Test-Path $dir) {
        Write-Host "Copie de $dir/ ..." -ForegroundColor Gray
        scp -i $SSH_KEY -r "${dir}" "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ATTENTION] Echec copie $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "[OK] Fichiers deployes." -ForegroundColor Green
Write-Host ""
Write-Host "Verification sur le serveur:" -ForegroundColor Cyan
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "ls -la $REMOTE_PATH"
Write-Host ""
Write-Host "Site disponible (apres config Nginx + SSL): https://VOTRE_DOMAINE.fr" -ForegroundColor Cyan
