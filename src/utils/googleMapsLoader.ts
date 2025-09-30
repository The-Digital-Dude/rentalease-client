const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";
let loaderPromise: Promise<void> | null = null;

const hasPlacesLibrary = () =>
  typeof window !== "undefined" &&
  !!window.google?.maps?.places?.Autocomplete;

export const loadGooglePlacesLibrary = (apiKey: string) => {
  if (hasPlacesLibrary()) {
    return Promise.resolve();
  }

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY in your environment."
      )
    );
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      if (existingScript.getAttribute("data-google-maps-loaded") === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => {
        loaderPromise = null;
        reject(
          new Error("Failed to load Google Maps script: existing script errored.")
        );
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      script.setAttribute("data-google-maps-loaded", "true");
      resolve();
    };

    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
};

export const resetGooglePlacesLoader = () => {
  loaderPromise = null;
  const script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
  if (script) {
    script.remove();
  }
};
