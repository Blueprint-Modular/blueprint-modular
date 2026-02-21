import streamlit as st

st.set_page_config(page_title="Get started — Blueprint Modular", page_icon="📐", layout="wide")
st.title("Get started")
st.markdown("### Installation")
st.code("pip install blueprint-modular\nbpm run app.py", language="bash")
st.markdown("### Fundamentals")
st.markdown("BPM exécute votre script de haut en bas à chaque interaction. L'état est dans `bpm.session_state`.")
st.markdown("### First app")
st.markdown("Tutoriel : [Installation](1_Get_started) → titre, métrique, tableau, toggle.")
st.markdown("[Voir sur GitHub](https://github.com/remigit55/blueprint-modular)")
