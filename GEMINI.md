# GEMINI.md

## Project Overview

This project is a React-based web application called "RentalEase-CRM". It appears to be a Customer Relationship Management (CRM) tool specifically designed for the rental industry. The application is built with Vite, uses TypeScript for type safety, and leverages Redux for state management. It features role-based access control, with different user types such as "admin", "agent", "property-manager", "technician", and "team-member". The application communicates with a backend API for data, as defined in `src/services/api.ts`.

### Key Technologies:

*   **Frontend Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **State Management:** Redux Toolkit
*   **Routing:** React Router
*   **HTTP Client:** Axios
*   **Styling:** SCSS

### Architecture:

*   **Component-Based:** The application follows a component-based architecture, with components organized in the `src/components` directory.
*   **Role-Based Access Control (RBAC):** The application implements RBAC, with routes and UI elements conditionally rendered based on the user's role. The routing logic is defined in `src/config/roleBasedRoutes.ts` and `src/config/routeConfig.tsx`.
*   **API Service Layer:** API interactions are centralized in `src/services/api.ts`, which uses Axios to make HTTP requests to the backend. It includes interceptors for handling authentication and errors.
*   **State Management:** Redux is used for managing global application state, with slices defined in the `src/store` directory.

## Building and Running

### Development

To run the application in development mode:

```bash
npm run dev
```

This will start the Vite development server with Hot Module Replacement (HMR) enabled.

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build.

### Linting

To lint the codebase:

```bash
npm run lint
```

## Development Conventions

*   **Styling:** Use SCSS for styling, with each component having its own `.scss` file.
*   **State Management:** Use Redux Toolkit for managing global state. Create slices for different features and use `useAppDispatch` and `useAppSelector` hooks for interacting with the store.
*   **API Requests:** Use the `api` service in `src/services/api.ts` for all backend communication. Add new API methods to this file as needed.
*   **Routing:** Define routes in `src/config/routeConfig.tsx` and `src/config/roleBasedRoutes.ts`. Use the `Link` component from `react-router-dom` for navigation.
*   **Component Structure:** Organize components into their own directories, with each directory containing the component's `tsx` file, `scss` file, and an `index.ts` file for exporting the component.
