"""
BPM — Blueprint Modular runtime.
Registry $ (refs réactives) et @ (inscription / décorateurs).
APIs composants (title, button, write, metric, etc.) pour bpm run app.py.
"""
__version__ = "0.1.3"

from typing import Any, Callable, Optional, TypeVar

# --- Rendu : nœuds collectés pendant l'exécution du script ---
_current_nodes: list[dict[str, Any]] = []
_rerun_requested = False


class SessionState(dict):
    """État persisté entre les runs (équivalent session_state)."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)

    def __setattr__(self, key: str, value: Any) -> None:
        self[key] = value


# État de session partagé (une session par processus pour l'instant)
session_state = SessionState()


def _node(typ: str, **props: Any) -> None:
    _current_nodes.append({"type": typ, "props": props})


def get_current_nodes() -> list[dict[str, Any]]:
    """Retourne la liste des nœuds du run en cours (usage interne serveur)."""
    return list(_current_nodes)


def reset_current_nodes() -> None:
    """Réinitialise la liste des nœuds (usage interne serveur)."""
    global _current_nodes, _rerun_requested
    _current_nodes = []
    _rerun_requested = False


def rerun() -> None:
    """Demande un re-run du script (après interaction)."""
    global _rerun_requested
    _rerun_requested = True


def rerun_requested() -> bool:
    """Indique si rerun() a été appelé (usage interne serveur)."""
    return _rerun_requested


# --- APIs composants (enregistrent un nœud de rendu) ---
def title(text: str, level: int = 1) -> None:
    _node("title", text=text, level=level)


def write(text: str) -> None:
    _node("write", text=str(text))


def markdown(text: str) -> None:
    """Affiche du contenu Markdown (titres, listes, code, liens). Utilisez ``---`` sur une ligne pour une ligne horizontale."""
    _node("markdown", text=text)


def button(label: str, key: Optional[str] = None) -> bool:
    """Retourne True si le bouton a été cliqué (côté serveur, après re-run)."""
    _node("button", label=label, key=key or f"btn_{len(_current_nodes)}")
    return session_state.get(f"_clicked_{key or f'btn_{len(_current_nodes)-1}'}") is True


def metric(
    label: str,
    value: Any,
    delta: Optional[Any] = None,
    *,
    name: Optional[str] = None,
) -> None:
    """Affiche une métrique (valeur, label, delta optionnel). Si name est fourni, la métrique peut être référencée dans le chat IA via $metric:name ou @name."""
    props: dict[str, Any] = {"label": str(label), "value": value, "delta": delta}
    if name is not None:
        props["name"] = name
    _node("metric", **props)


def table(data: Any) -> None:
    """Accepte une liste de dicts ou un objet avec .to_dict('records')."""
    if hasattr(data, "to_dict"):
        rows = data.to_dict("records")
    elif isinstance(data, list) and data and isinstance(data[0], dict):
        rows = data
    else:
        rows = list(data) if data else []
    _node("table", rows=rows)


def header(text: str) -> None:
    _node("header", text=text)


def subheader(text: str) -> None:
    _node("subheader", text=text)


def caption(text: str) -> None:
    _node("caption", text=text)


def code(code: str, language: str = "python") -> None:
    _node("code", code=code, language=language)


def divider(label: Optional[str] = None, orientation: str = "horizontal") -> None:
    _node("divider", label=label, orientation=orientation)


def toggle(label: str, value: bool = False, key: Optional[str] = None) -> bool:
    _node("toggle", label=label, value=value, key=key or f"toggle_{len(_current_nodes)}")
    return session_state.get(f"_toggle_{key or f'toggle_{len(_current_nodes)-1}'}", value)


def panel(title_text: str, body: str = "", variant: str = "info") -> None:
    _node("panel", title=title_text, body=body, variant=variant)


def emptystate(
    title: str = "Aucune donnée",
    description: Optional[str] = None,
    action_label: Optional[str] = None,
) -> None:
    _node("emptystate", title=title, description=description, action_label=action_label)


def input(
    label: Optional[str] = None,
    value: str = "",
    placeholder: str = "",
    type: str = "text",
    key: Optional[str] = None,
    disabled: bool = False,
) -> str:
    k = key or f"input_{len(_current_nodes)}"
    _node("input", label=label, value=value, placeholder=placeholder, type=type, key=k, disabled=disabled)
    return str(session_state.get(f"_input_{k}", value))


def textarea(
    label: Optional[str] = None,
    value: str = "",
    placeholder: str = "",
    rows: int = 4,
    key: Optional[str] = None,
    disabled: bool = False,
) -> str:
    k = key or f"textarea_{len(_current_nodes)}"
    _node("textarea", label=label, value=value, placeholder=placeholder, rows=rows, key=k, disabled=disabled)
    return str(session_state.get(f"_textarea_{k}", value))


def checkbox(
    label: Optional[str] = None,
    value: bool = False,
    key: Optional[str] = None,
    disabled: bool = False,
) -> bool:
    k = key or f"checkbox_{len(_current_nodes)}"
    _node("checkbox", label=label, value=value, key=k, disabled=disabled)
    return bool(session_state.get(f"_checkbox_{k}", value))


def radiogroup(
    label: Optional[str] = None,
    options: Optional[list[Any]] = None,
    value: Optional[str] = None,
    key: Optional[str] = None,
    layout: str = "vertical",
    disabled: bool = False,
) -> Optional[str]:
    k = key or f"radiogroup_{len(_current_nodes)}"
    opts = options or []
    _node("radiogroup", label=label, options=opts, value=value, key=k, layout=layout, disabled=disabled)
    return session_state.get(f"_radiogroup_{k}", value)


def slider(
    label: Optional[str] = None,
    value: Optional[float] = None,
    min: float = 0,
    max: float = 100,
    step: float = 1,
    key: Optional[str] = None,
    disabled: bool = False,
) -> float:
    k = key or f"slider_{len(_current_nodes)}"
    v = value if value is not None else min
    _node("slider", label=label, value=v, min=min, max=max, step=step, key=k, disabled=disabled)
    return float(session_state.get(f"_slider_{k}", v))


def dateinput(
    label: Optional[str] = None,
    value: Optional[str] = None,
    min: Optional[str] = None,
    max: Optional[str] = None,
    key: Optional[str] = None,
    disabled: bool = False,
) -> Optional[str]:
    k = key or f"dateinput_{len(_current_nodes)}"
    _node("dateinput", label=label, value=value, min=min, max=max, key=k, disabled=disabled)
    return session_state.get(f"_dateinput_{k}", value)


def colorpicker(
    label: Optional[str] = None,
    value: str = "#000000",
    key: Optional[str] = None,
    disabled: bool = False,
) -> str:
    k = key or f"colorpicker_{len(_current_nodes)}"
    _node("colorpicker", label=label, value=value, key=k, disabled=disabled)
    return str(session_state.get(f"_colorpicker_{k}", value))


def chip(
    label: str = "",
    variant: str = "default",
    on_delete: bool = False,
    disabled: bool = False,
) -> None:
    _node("chip", label=label, variant=variant, on_delete=on_delete, disabled=disabled)


def breadcrumb(
    items: Optional[list[dict[str, Any]]] = None,
    separator: str = "›",
) -> None:
    _node("breadcrumb", items=items or [], separator=separator)


def stepper(
    steps: Optional[list[dict[str, Any]]] = None,
    current_step: int = 0,
) -> None:
    _node("stepper", steps=steps or [], current_step=current_step)


def set_page_config(
    page_title: str = "BPM App",
    layout: str = "centered",
    **kwargs: Any,
) -> None:
    """Configure la page (titre, layout). Pour l'instant enregistré mais pas utilisé par le rendu."""
    _node("page_config", page_title=page_title, layout=layout, **kwargs)


# --- Registry @ : stockage par nom ---
_REGISTRY: dict[str, Any] = {}


def register(name: str, value: Any) -> None:
    """Enregistre une valeur sous un nom (@)."""
    _REGISTRY[name] = value


def get_registered(name: str) -> Any:
    """Retourne la valeur enregistrée sous ce nom."""
    return _REGISTRY.get(name)


# --- Refs réactives $ ---
_REFS: dict[str, Any] = {}
_REF_SUBSCRIBERS: dict[str, list[Callable[[Any], None]]] = {}


class Ref:
    """Réf réactive : get/set/subscribe."""

    def __init__(self, name: str, initial: Any = None):
        self._name = name
        if name not in _REFS:
            _REFS[name] = initial
        if name not in _REF_SUBSCRIBERS:
            _REF_SUBSCRIBERS[name] = []

    def get(self) -> Any:
        return _REFS.get(self._name)

    def set(self, value: Any) -> None:
        _REFS[self._name] = value
        for cb in _REF_SUBSCRIBERS.get(self._name, []):
            cb(value)

    def subscribe(self, callback: Callable[[Any], None]) -> Callable[[], None]:
        _REF_SUBSCRIBERS.setdefault(self._name, []).append(callback)

        def unsubscribe():
            _REF_SUBSCRIBERS[self._name].remove(callback)

        return unsubscribe


def ref(name: str, initial: Any = None) -> Ref:
    """Crée ou récupère une ref réactive ($)."""
    return Ref(name, initial)


# --- Décorateurs @ ---
F = TypeVar("F", bound=Callable[..., Any])


def page(page_id: str) -> Callable[[F], F]:
    """Décorateur : enregistre une fonction comme page (@bpm.page('id'))."""

    def decorator(fn: F) -> F:
        register(f"page:{page_id}", fn)
        return fn

    return decorator


def sidebar(fn: F) -> F:
    """Décorateur : enregistre le contenu de la sidebar (@bpm.sidebar)."""
    register("sidebar", fn)
    return fn


def cache_data(fn: F) -> F:
    """Décorateur : cache le résultat de la fonction (@bpm.cache_data). Stub : pas de cache pour l'instant."""
    return fn


__all__ = [
    "set_page_config",
    "register",
    "get_registered",
    "ref",
    "Ref",
    "page",
    "sidebar",
    "cache_data",
    "session_state",
    "get_current_nodes",
    "reset_current_nodes",
    "rerun",
    "rerun_requested",
    "title",
    "write",
    "markdown",
    "button",
    "metric",
    "table",
    "header",
    "subheader",
    "caption",
    "code",
    "divider",
    "toggle",
    "panel",
    "emptystate",
    "input",
    "textarea",
    "checkbox",
    "radiogroup",
    "slider",
    "dateinput",
    "colorpicker",
    "chip",
    "breadcrumb",
    "stepper",
]
