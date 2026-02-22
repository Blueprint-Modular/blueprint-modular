import streamlit as st

st.set_page_config(page_title="Deploy — Blueprint Modular", page_icon="📐", layout="wide")
st.title("Deploy")
st.markdown("### Concepts")
st.markdown("En production : processus Python (BPM) + reverse proxy Nginx. Variables d'environnement et `bpm.secrets` pour les secrets.")
st.markdown("### Platforms")
st.markdown("- **VPS Ubuntu** : systemd + Nginx (voir `deploy/setup.sh` et `deploy/nginx.conf`).")
st.markdown("- **Docker** : Dockerfile avec `pip install blueprint-modular` et `bpm run app.py`.")
st.markdown("[Voir sur GitHub](https://github.com/remigit55/blueprint-modular)")
