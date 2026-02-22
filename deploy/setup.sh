#!/bin/bash
set -e

APP_DIR="/var/www/blueprint-modular"
REPO_URL="https://github.com/remigit55/blueprint-modular.git"
SERVICE_NAME="blueprint-modular"
PORT=8503

echo "📦 Clonage / mise à jour du repo..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR && git pull
else
  git clone $REPO_URL $APP_DIR
fi

echo "🐍 Création du virtualenv..."
cd $APP_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "⚙️  Configuration systemd..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Blueprint Modular — app BPM (bpm run)
After=network.target

[Service]
User=www-data
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/venv/bin/python -m bpm.cli run app.py --port $PORT --host 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME
echo "✅ Service $SERVICE_NAME démarré sur le port $PORT"
