# AI Studio Application Rules

This document outlines the core technologies used in this application and provides guidelines for their usage to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack Overview

*   **Frontend Framework**: React with TypeScript for building dynamic user interfaces.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **Styling**: Tailwind CSS for a utility-first approach to styling, enabling rapid and consistent UI development.
*   **Backend & Database**: Supabase is used for database management and data persistence.
*   **AI Integration**: Google GenAI powers intelligent features, such as book detail suggestions.
*   **Icons**: Lucide React provides a comprehensive set of customizable SVG icons.
*   **Charting**: Recharts is utilized for creating interactive and responsive data visualizations.
*   **Component Library**: Shadcn/ui components are available and should be prioritized for building new UI elements.
*   **Routing**: Currently, view management is handled by React's `useState` in `App.tsx`. For more complex navigation, React Router is the designated library.

## Library Usage Rules

To maintain a consistent and efficient codebase, please adhere to the following rules when developing:

*   **UI Components**:
    *   **Prioritize Shadcn/ui**: For any new UI components (e.g., buttons, inputs, forms, dialogs), always check if a suitable component exists within the `shadcn/ui` library first.
    *   **Custom Components**: If a `shadcn/ui` component doesn't fit the exact requirement or needs extensive customization, create a new, dedicated component file in `src/components/` and style it using Tailwind CSS.
*   **Styling**:
    *   **Tailwind CSS Only**: All styling must be implemented using Tailwind CSS utility classes. Avoid writing custom CSS files or inline styles unless absolutely necessary for global overrides (like in `index.html`).
*   **Icons**:
    *   **Lucide React**: Use `lucide-react` for all icon needs. Import icons directly from this library.
*   **Charting and Data Visualization**:
    *   **Recharts**: Any graphs, charts, or complex data visualizations should be built using the `recharts` library.
*   **Data Persistence**:
    *   **DataService**: All interactions with the Supabase database (fetching, adding, updating, deleting books) must go through the `src/services/dataService.ts` module. Do not directly import `supabase` client elsewhere.
*   **AI Features**:
    *   **GeminiService**: Integrate AI functionalities by calling functions from `src/services/geminiService.ts`, which encapsulates the Google GenAI API calls.
*   **Routing**:
    *   **React Router**: While current navigation uses `useState`, for any future expansion requiring URL-based routing, `react-router-dom` should be implemented and used, with routes defined in `src/App.tsx`.
*   **State Management**:
    *   **React Hooks**: For component-level state, use React's built-in `useState` and `useReducer` hooks. For global state, consider the React Context API if a simple prop-drilling solution becomes cumbersome.