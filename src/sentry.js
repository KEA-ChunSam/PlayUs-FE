import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';

if (['prod', 'dev'].includes(import.meta.env.VITE_ENVIRONMENT)) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        environment: import.meta.env.VITE_ENVIRONMENT,
        beforeSend(event, hint) {
            const error = hint.originalException;
            if (error instanceof Error) {
                sendToSlack(error);
            }
            return event;
        },
    });
}

function sendToSlack(error) {
    const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;
    const SENTRY_REPOSITORY_URI = import.meta.env.VITE_SENTRY_REPOSITORY_URI;
    const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL;

    const now = new Date();
    const formattedTime = now.toISOString().replace('T', ' ').substring(0, 23);

    const logMessage = `*🚨[${ENVIRONMENT}]* ${formattedTime} ERROR ${error.name} - ${error.message}\n${error.stack ? `\`\`\`${error.stack}\`\`\`` : ''}\n<${SENTRY_REPOSITORY_URI}|Go-To-Sentry>`;

    fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: logMessage}),
    }).catch(console.error);
}
