# Déploiement sur le VPS depuis ta machine Windows.
# Prérequis : le repo est déjà cloné sur le VPS (git clone ... /opt/blueprint-modular).
# Usage: .\scripts\deploy-vps-remote.ps1 -Host "ton-vps.com" -User "root"
# Ou: $env:VPS_HOST="ton-vps.com"; $env:VPS_USER="root"; .\scripts\deploy-vps-remote.ps1

param(
    [string]$VpsHost = $env:VPS_HOST,
    [string]$User = $env:VPS_USER,
    [string]$KeyPath = $env:VPS_SSH_KEY,
    [string]$RemoteDir = $env:VPS_REMOTE_DIR
)

if (-not $VpsHost -or -not $User) {
    Write-Host "Usage: .\scripts\deploy-vps-remote.ps1 -VpsHost IP_OU_DOMAINE -User UTILISATEUR_SSH [-RemoteDir /opt/blueprint-modular]"
    Write-Host "Ou: `$env:VPS_HOST='...'; `$env:VPS_USER='...'; .\scripts\deploy-vps-remote.ps1"
    exit 1
}

if (-not $RemoteDir) { $RemoteDir = "/opt/blueprint-modular" }

$SshArgs = @()
if ($KeyPath) { $SshArgs += "-i", $KeyPath }
$SshTarget = "${User}@${VpsHost}"
$Cmd = "cd $RemoteDir && git pull && chmod +x scripts/deploy-vps.sh && bash scripts/deploy-vps.sh"

Write-Host "Connexion a $SshTarget et deploiement (git pull + script)..."
& ssh @SshArgs $SshTarget $Cmd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Deploiement termine. Verifie que .env est rempli sur le VPS ($RemoteDir/.env)."
