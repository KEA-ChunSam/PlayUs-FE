import axios from "axios";
axios.defaults.withCredentials = true;
import './sentry';
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import AppRouter from "./routes/AppRouter";
import { SearchProvider } from "./components/SearchContext";
import { AuthProvider } from "./utils/AuthContext";
import ReactQueryProvider from "./QueryClientProvider";
import {HashRouter} from "react-router-dom";

import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
    <ReactQueryProvider>
        <HashRouter>
            <AuthProvider>
                    <div className="fullscreen-container">
                        <AppRouter />
                    </div>
            </AuthProvider>
        </HashRouter>
    </ReactQueryProvider>
);
