import './sentry';
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import AppRouter from "./routes/AppRouter";
import { SearchProvider } from "./components/SearchContext"; 
import { AuthProvider } from "./utils/AuthContext";
ReactDOM.createRoot(document.getElementById("root")).render(
        <AuthProvider>
            <div className="fullscreen-container">
                <AppRouter/>
            </div>
        </AuthProvider>
);
