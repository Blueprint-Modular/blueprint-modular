# Deploiement sur le VPS OVH depuis Windows.
# Prerequis : repo clone sur le VPS dans /home/ubuntu/blueprint-modular.
# Usage: .\scripts\deploy-vps-remote.ps1
# Ou: .\scripts\deploy-vps-remote.ps1 -VpsHost 145.239.199.236 -User ubuntu
# Voir COMMIT_DEPLOY.md pour la procedure complete.

param(
    [string]$VpsHost = $env:VPS_HOST,
    [string]$User = $env:VPS_USER,
    [string]$KeyPath = $env:VPS_SSH_KEY,
    [string]$RemoteDir = $env:VPS_REMOTE_DIR
)

# Valeurs par defaut pour le VPS OVH
if (-not $VpsHost) { $VpsHost = "145.239.199.236" }
if (-not $User) { $User = "ubuntu" }
if (-not $RemoteDir) { $RemoteDir = "/home/ubuntu/blueprint-modular" }
if (-not $KeyPath) { $KeyPath = Join-Path $env:USERPROFILE ".ssh\portfolio_beam_key" }

$SshArgs = @()
if (Test-Path $KeyPath) { $SshArgs += "-i", $KeyPath }
$SshTarget = "${User}@${VpsHost}"

# Deploy = fetch + reset --hard (ignore les modifs locales sur le VPS) + deploy-from-git.sh
$Cmd = "cd $RemoteDir && git fetch origin && git reset --hard origin/master && chmod +x deploy/deploy-from-git.sh && bash deploy/deploy-from-git.sh"

Write-Host "Connexion a $SshTarget et deploiement (git fetch + reset --hard + deploy-from-git.sh)..."
& ssh @SshArgs $SshTarget $Cmd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Deploiement termine. Vitrine + docs a jour sur le VPS."
