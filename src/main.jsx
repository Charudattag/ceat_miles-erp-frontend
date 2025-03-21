// import React from "react";
// import ReactDOM from "react-dom";
// import "./styles/common.scss";
// import "./styles/constants.scss";
// import App from "./App";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React from "react";
import { createRoot } from "react-dom/client"; // Use the latest createRoot method
import "./styles/common.scss";
import "./styles/constants.scss";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Correct import for the latest React Query version

// Initialize the react-query client
const queryClient = new QueryClient();

// Create the root element
const root = createRoot(document.getElementById("root"));

// Render the app wrapped in QueryClientProvider
root.render(
  <React.StrictMode>
    {/* Wrap the whole app with QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// import React from "react";
// import ReactDOM from "react-dom"; // use the older ReactDOM API
// import { QueryClient, QueryClientProvider } from "react-query"; // or @tanstack/react-query for the latest version
// import App from "./App"; // your main app component
// import "./styles/common.scss";
// import "./styles/constants.scss";

// // Initialize the query client
// const queryClient = new QueryClient();

// // Render the app wrapped in QueryClientProvider
// ReactDOM.render(
//   <QueryClientProvider client={queryClient}>
//     <App />
//   </QueryClientProvider>,
//   document.getElementById("root")
// );
