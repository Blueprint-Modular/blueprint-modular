"""
Blueprint Modular — Site documentation (www.blueprint-modular.com)
Entrypoint pour déploiement VPS.
"""
import streamlit as st

st.set_page_config(
    page_title="Blueprint Modular — Documentation",
    page_icon="📐",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("Blueprint Modular")
st.markdown("**Briques prêtes à l'emploi.** Importez depuis `bpm`, le reste est déjà fait.")

st.divider()
st.subheader("Installation")
st.code("pip install blueprint-modular", language="bash")
st.caption("Prérequis : Python 3.9+")
st.code("""import bpm

bpm.metric("Valeur", 142500, delta=3.2)
bpm.table(df)
""", language="python")
st.caption("Après `bpm run app.py`, votre interface est servie.")

st.divider()
col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("### Get started")
    st.markdown("Installation, fondamentaux, premier tutoriel.")
    st.page_link("pages/1_Get_started.py", label="Commencer →", icon="🚀")
with col2:
    st.markdown("### API Reference")
    st.markdown("Tous les composants : texte, données, graphiques, inputs…")
    st.page_link("pages/2_API_Reference.py", label="Voir l'API →", icon="📚")
with col3:
    st.markdown("### Deploy")
    st.markdown("Concepts et plateformes (VPS, Docker, Nginx).")
    st.page_link("pages/3_Deploy.py", label="Déployer →", icon="☁️")
st.page_link("pages/4_Cheat_sheet.py", label="Cheat sheet →", icon="📋")

st.divider()
st.markdown("[Voir sur GitHub](https://github.com/remigit55/blueprint-modular)")
