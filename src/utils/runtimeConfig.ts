const DEFAULT_API_BASE_URL = "https://rentalease-cloud-server.onrender.com/api";

const getRuntimeEnv = (): string =>
  import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || "development";

export const getApiBaseUrl = (): string => {
  const env = getRuntimeEnv();

  switch (env) {
    case "production":
      return import.meta.env.VITE_API_BASE_URL_PROD || DEFAULT_API_BASE_URL;
    case "development":
    default:
      return import.meta.env.VITE_API_BASE_URL_DEV || DEFAULT_API_BASE_URL;
  }
};

export const isLocalDevHost = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

export const getWebSocketUrl = (): string => {
  const explicitWsUrl = import.meta.env.VITE_WS_URL?.trim();
  const explicitWsPort = import.meta.env.VITE_WS_PORT?.trim();

  if (explicitWsUrl) {
    if (
      explicitWsUrl.startsWith("ws://") ||
      explicitWsUrl.startsWith("wss://")
    ) {
      return explicitWsUrl;
    }

    if (
      explicitWsUrl.startsWith("http://") ||
      explicitWsUrl.startsWith("https://")
    ) {
      return explicitWsUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://");
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${explicitWsUrl}${explicitWsPort ? `:${explicitWsPort}` : ""}`;
  }

  const apiBaseUrl = getApiBaseUrl();

  try {
    const apiUrl = new URL(apiBaseUrl);
    const wsProtocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${apiUrl.host}`;
  } catch {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const port = explicitWsPort || "4000";
    return `${protocol}//${window.location.hostname}:${port}`;
  }
};
