import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if (['prod', 'dev'].includes(process.env.REACT_APP_ENVIRONMENT)) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        environment: process.env.REACT_APP_ENVIRONMENT,
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
    const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT
    const SENTRY_REPOSITORY_URI = process.env.REACT_APP_SENTRY_REPOSITORY_URI

    const now = new Date();
    const formattedTime = now.toISOString().replace('T', ' ').substring(0, 23);

    const logMessage = `*🚨[${ENVIRONMENT}]* ${formattedTime} 0000 ERROR ${error.name} - ${error.message} <${SENTRY_REPOSITORY_URI}|Go-To-Sentry>`;

    fetch(process.env.REACT_APP_SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: logMessage }),
    }).catch(console.error);
}
