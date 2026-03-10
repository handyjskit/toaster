const DEFAULT_POSITION = "top-right";
const DEFAULT_DURATION = 4000;
const DEFAULT_MAX_VISIBLE = 5;
const DEFAULT_OFFSET = Object.freeze({ edge: 24, gap: 12 });
const POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const TOAST_TYPES = ["success", "error", "info", "warning"];
const STYLE_TEXT = __TOASTER_CSS__;
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18.3 5.7-6.3 6.3-6.3-6.3-1.4 1.4 6.3 6.3-6.3 6.3 1.4 1.4 6.3-6.3 6.3 6.3 1.4-1.4-6.3-6.3 6.3-6.3z"/></svg>';

const DEFAULT_ICONS = Object.freeze({
  success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 16.4 5.3 12.15l-1.4 1.4 5.65 5.65L20.1 8.65l-1.4-1.4z"/></svg>',
  error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7h2v6h-2zm0 8h2v2h-2zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 10h2v7h-2zm0-3h2v2h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2zm12-3h-2v2h2zm0-8h-2v6h2z"/></svg>',
  neutral: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0m8-6a6 6 0 1 0 0 12 6 6 0 0 0 0-12"/></svg>'
});

const TYPE_PRESETS = Object.freeze({
  success: { color: "#106b39", background: "#f2fbf5", borderColor: "#b7e6c6", icon: DEFAULT_ICONS.success },
  error: { color: "#b42318", background: "#fff5f4", borderColor: "#f4b4ae", icon: DEFAULT_ICONS.error },
  info: { color: "#155eef", background: "#f5f8ff", borderColor: "#bfd2ff", icon: DEFAULT_ICONS.info },
  warning: { color: "#b54708", background: "#fff8f1", borderColor: "#f5c78f", icon: DEFAULT_ICONS.warning },
  neutral: { color: "#344054", background: "#f8fafc", borderColor: "#d5d9e0", icon: DEFAULT_ICONS.neutral }
});

let styleInjected = false;
let toastCounter = 0;
let defaultToaster;

function ensureDocument() {
  if (typeof document === "undefined") {
    throw new Error("Toaster requires a browser environment with document support.");
  }
}

function ensureStyles() {
  ensureDocument();
  if (styleInjected || document.getElementById("toaster-styles")) {
    styleInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.id = "toaster-styles";
  style.textContent = STYLE_TEXT;
  document.head.appendChild(style);
  styleInjected = true;
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizePosition(position) {
  return POSITIONS.includes(position) ? position : DEFAULT_POSITION;
}

function normalizeOffset(offset) {
  if (isNumber(offset)) {
    return { edge: offset, gap: DEFAULT_OFFSET.gap };
  }

  return {
    edge: isNumber(offset?.edge) ? offset.edge : DEFAULT_OFFSET.edge,
    gap: isNumber(offset?.gap) ? offset.gap : DEFAULT_OFFSET.gap
  };
}

function pickDefined(source, keys) {
  const result = {};
  if (!source) {
    return result;
  }

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  });

  return result;
}

function normalizeInput(input, fallbackType) {
  if (typeof input === "string") {
    return { message: input, type: fallbackType ?? "neutral" };
  }

  const normalized = pickDefined(input, [
    "message",
    "type",
    "icon",
    "color",
    "background",
    "borderColor",
    "duration",
    "position",
    "closeButton"
  ]);

  if (typeof normalized.message !== "string") {
    delete normalized.message;
  }
  if (typeof normalized.type !== "string") {
    delete normalized.type;
  }
  if (!normalized.type && fallbackType) {
    normalized.type = fallbackType;
  }

  return normalized;
}

function toHtml(icon) {
  if (icon == null || icon === false) {
    return "";
  }
  return typeof icon === "string" ? icon : String(icon);
}

function createDefaults(options = {}) {
  return {
    position: normalizePosition(options.position),
    duration: isNumber(options.duration) ? options.duration : DEFAULT_DURATION,
    closeButton: options.closeButton !== false,
    pauseOnHover: options.pauseOnHover !== false,
    maxVisible: isNumber(options.maxVisible) ? Math.max(1, options.maxVisible) : DEFAULT_MAX_VISIBLE,
    offset: normalizeOffset(options.offset),
    icons: { ...DEFAULT_ICONS, ...(options.icons || {}) },
    types: { ...TYPE_PRESETS, ...(options.types || {}) }
  };
}

function createContainer(position, offset) {
  const container = document.createElement("div");
  container.className = "toaster-container";
  container.dataset.position = position;
  container.style.gap = `${offset.gap}px`;
  container.style[position.startsWith("top") ? "top" : "bottom"] = `${offset.edge}px`;
  container.style[position.endsWith("left") ? "left" : "right"] = `${offset.edge}px`;
  document.body.appendChild(container);
  return container;
}

function resolveConfig(input, overrides, defaults) {
  const config = { ...normalizeInput(input), ...normalizeInput(overrides) };
  const type = config.type in defaults.types ? config.type : "neutral";
  const preset = defaults.types[type] || TYPE_PRESETS.neutral;

  return {
    ...config,
    type,
    preset,
    position: normalizePosition(config.position || defaults.position),
    duration: isNumber(config.duration) ? config.duration : defaults.duration,
    closeButton: typeof config.closeButton === "boolean" ? config.closeButton : defaults.closeButton,
    iconHtml: config.icon === false ? "" : toHtml(config.icon || preset.icon || defaults.icons[type] || "")
  };
}

function setToastStyles(toast, config) {
  toast.dataset.type = config.type;
  toast.style.setProperty("--toast-bg", config.background || config.preset.background || "#fff");
  toast.style.setProperty("--toast-color", config.color || config.preset.color || "#101828");
  toast.style.setProperty("--toast-border", config.borderColor || config.preset.borderColor || "rgba(16,24,40,.08)");
  toast.style.setProperty("--toast-enter-y", config.position.startsWith("top") ? "-10px" : "10px");
  toast.style.setProperty("--toast-exit-y", config.position.startsWith("top") ? "-8px" : "8px");
}

function buildToast(config, dismiss) {
  const toast = document.createElement("div");
  toast.className = "toaster-toast";
  toast.dataset.visible = "false";
  toast.id = `toast-${++toastCounter}`;
  setToastStyles(toast, config);

  const icon = document.createElement("div");
  icon.className = "toaster-icon";
  if (config.iconHtml) {
    icon.innerHTML = config.iconHtml;
  } else {
    icon.hidden = true;
  }

  const message = document.createElement("div");
  message.className = "toaster-message";
  message.textContent = config.message || "";

  toast.append(icon, message);

  if (config.closeButton) {
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "toaster-close";
    closeButton.setAttribute("aria-label", "Dismiss notification");
    closeButton.innerHTML = CLOSE_ICON;
    closeButton.addEventListener("click", dismiss);
    toast.appendChild(closeButton);
  }

  return toast;
}

function enableAutoDismiss(toast, duration, pauseOnHover, dismiss) {
  if (!(duration > 0)) {
    return;
  }

  let timerId = 0;
  let remaining = duration;
  let startedAt = 0;

  const start = () => {
    startedAt = Date.now();
    timerId = window.setTimeout(dismiss, remaining);
  };

  if (pauseOnHover) {
    toast.addEventListener("mouseenter", () => {
      if (!timerId) {
        return;
      }
      window.clearTimeout(timerId);
      timerId = 0;
      remaining -= Date.now() - startedAt;
    });

    toast.addEventListener("mouseleave", () => {
      if (!timerId && remaining > 0) {
        start();
      }
    });
  }

  start();
}

function createToaster(options = {}) {
  ensureStyles();
  const defaults = createDefaults(options);
  const containers = new Map();

  function getContainer(position) {
    const normalized = normalizePosition(position || defaults.position);
    if (!containers.has(normalized)) {
      containers.set(normalized, createContainer(normalized, defaults.offset));
    }
    return containers.get(normalized);
  }

  function dismissToast(toast, delay) {
    if (!toast || toast.dataset.closing === "true") {
      return;
    }
    toast.dataset.closing = "true";
    window.setTimeout(() => {
      toast.remove();
    }, delay);
  }

  function show(input, overrides = {}) {
    const config = resolveConfig(input, overrides, defaults);
    const container = getContainer(config.position);

    if (container.children.length >= defaults.maxVisible) {
      const oldest = config.position.startsWith("bottom") ? container.lastElementChild : container.firstElementChild;
      if (oldest) {
        dismissToast(oldest, 160);
      }
    }

    let toast;
    const dismiss = (delay = 180) => dismissToast(toast, delay);
    toast = buildToast(config, () => dismiss());

    if (config.position.startsWith("bottom")) {
      container.prepend(toast);
    } else {
      container.appendChild(toast);
    }

    requestAnimationFrame(() => {
      toast.dataset.visible = "true";
    });

    enableAutoDismiss(toast, config.duration, defaults.pauseOnHover, () => dismiss(220));

    return {
      id: toast.id,
      element: toast,
      dismiss
    };
  }

  const api = {
    show,
    clear(position) {
      if (position) {
        const container = containers.get(normalizePosition(position));
        if (container) {
          container.replaceChildren();
        }
        return;
      }
      containers.forEach((container) => container.replaceChildren());
    },
    destroy() {
      containers.forEach((container) => container.remove());
      containers.clear();
    }
  };

  TOAST_TYPES.forEach((type) => {
    api[type] = (message, options) => show({ ...(options || {}), message, type });
  });

  return api;
}

function getDefaultToaster() {
  if (!defaultToaster) {
    defaultToaster = createToaster();
  }
  return defaultToaster;
}

function callDefault(method, ...args) {
  return getDefaultToaster()[method](...args);
}

const defaultApi = {
  createToaster,
  get toaster() {
    return getDefaultToaster();
  },
  toast(message, options) {
    return callDefault("show", message, options);
  },
  POSITIONS,
  DEFAULT_ICONS,
  TYPE_PRESETS
};

TOAST_TYPES.forEach((type) => {
  defaultApi[type] = (message, options) => callDefault(type, message, options);
});

return defaultApi;
