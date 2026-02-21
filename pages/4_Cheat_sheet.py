import streamlit as st

st.set_page_config(page_title="Cheat sheet — Blueprint Modular", page_icon="📐", layout="wide")
st.title("Cheat sheet")
st.markdown("Toutes les fonctions BPM en un coup d'œil. Copier-collable.")
st.code("""import bpm

# Texte
bpm.title("Mon titre")
bpm.markdown("Du **markdown**")
bpm.metric("Valeur", 142500, delta=3200)

# Layout
col1, col2 = bpm.columns(2)
tab1, tab2 = bpm.tabs(["Onglet 1", "Onglet 2"])
with bpm.sidebar:
    bpm.select("Page", ["Accueil", "Données"])

# Inputs
val = bpm.toggle("Activer")
date = bpm.date_input("Date")

# Charts
bpm.chart.line(df)
bpm.chart.bar(df)

# Panels
bpm.panel("Info importante", variant="info")
bpm.panel("Attention", variant="warning")

# Status
with bpm.spinner("Chargement..."):
    time.sleep(2)
bpm.toast("Terminé !")

# Cache
@bpm.cache_data
def load_data():
    return pd.read_csv("data.csv")
""", language="python")
st.markdown("[Voir sur GitHub](https://github.com/remigit55/blueprint-modular)")
