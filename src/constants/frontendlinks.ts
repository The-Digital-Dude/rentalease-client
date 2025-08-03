const getFrontendLink = () => {
  if (import.meta.env.VITE_NODE_ENV === "development") {
    return `${import.meta.env.VITE_API_BASE_URL_DEV}`;
  } else {
    return `${import.meta.env.VITE_API_BASE_URL_PROD}`;
  }
};

export default getFrontendLink;
