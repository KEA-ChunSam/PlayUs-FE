import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
    dsn: "https://827f0d242113917609e71527db4fd2da@o4509111730634752.ingest.us.sentry.io/4509111732142080",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0, // 퍼포먼스 트래킹 비율 (0.0 ~ 1.0)
    environment: "development", // 또는 "production"
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
            <App />
        </Sentry.ErrorBoundary>
    </React.StrictMode>
);
