const DEFAULT_API_BASE_URL = "https://rentalease-cloud-server.onrender.com/api";

const getFrontendLink = () => {
  if (import.meta.env.VITE_NODE_ENV === "development") {
    return `${import.meta.env.VITE_API_BASE_URL_DEV || DEFAULT_API_BASE_URL}`;
  } else {
    return `${import.meta.env.VITE_API_BASE_URL_PROD || DEFAULT_API_BASE_URL}`;
  }
};

export default getFrontendLink;
