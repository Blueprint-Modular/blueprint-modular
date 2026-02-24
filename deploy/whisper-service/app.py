"""
Micro-service faster-whisper pour Blueprint Modular.
Port 9000 — accepte un fichier audio, retourne la transcription.
Modèle : medium (bon français, ~1.5 Go, CPU)

Déploiement VPS : copier ce fichier dans /home/ubuntu/whisper-service/app.py
Puis : pm2 start app.py --name whisper-service --interpreter python3
"""

from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import tempfile
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Chargement du modèle au démarrage (une seule fois)
# "medium" = bon équilibre qualité/vitesse pour le français
# "small" si mémoire insuffisante
logger.info("Chargement du modèle Whisper medium...")
model = WhisperModel("medium", device="cpu", compute_type="int8")
logger.info("Modèle Whisper prêt.")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "medium"})


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "Fichier audio manquant (champ 'audio')"}), 400

    audio_file = request.files["audio"]
    if not audio_file.filename:
        return jsonify({"error": "Fichier audio vide"}), 400

    # Sauvegarde temporaire
    suffix = os.path.splitext(audio_file.filename or ".webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        logger.info(f"Transcription de {tmp_path}...")
        segments, info = model.transcribe(
            tmp_path,
            language="fr",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
        logger.info(f"Transcription OK : {len(text)} caractères, langue détectée : {info.language}")
        return jsonify({
            "transcription": text,
            "language": info.language,
            "duration": info.duration,
        })
    except Exception as e:
        logger.error(f"Erreur transcription : {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9000, debug=False)
