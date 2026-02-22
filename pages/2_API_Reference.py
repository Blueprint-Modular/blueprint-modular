import streamlit as st

st.set_page_config(page_title="API Reference — Blueprint Modular", page_icon="📐", layout="wide")
st.title("API Reference")
st.markdown("Référence API. Exemples :")
st.code("""bpm.title("Mon titre")
bpm.metric("Valeur", 142500, delta=3200)
bpm.table(df)
bpm.toggle("Activer")
bpm.panel("Info", variant="info")
bpm.chart.line(df)""", language="python")
st.markdown("Voir le dépôt pour la référence complète et le cheat sheet.")
st.markdown("[Voir sur GitHub](https://github.com/remigit55/blueprint-modular)")
