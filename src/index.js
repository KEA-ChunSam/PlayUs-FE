import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import AppRouter from "./routes/AppRouter";

Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: "development",
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <div className="fullscreen-container">
            <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
                <AppRouter />
            </Sentry.ErrorBoundary>
        </div>
    </React.StrictMode>
);