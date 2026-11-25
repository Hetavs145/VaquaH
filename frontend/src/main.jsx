import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById("root"));

const requiredEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_APP_ID',
];
const env = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};
const missing = requiredEnv.filter((k) => !env[k]);

const StartupError = ({ title, detail }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '10vh auto', padding: 16 }}>
    <h1 style={{ fontSize: 22, marginBottom: 12 }}>{title}</h1>
    <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f5', padding: 12, borderRadius: 8 }}>{detail}</pre>
  </div>
);

if (missing.length > 0) {
  // Without these, Firebase throws at import time and the page renders blank.
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  root.render(
    <StartupError
      title="App configuration missing"
      detail={`These environment variables were not set at build time:\n\n${missing.join('\n')}\n\nAdd them in your hosting provider (e.g. Vercel → Project → Settings → Environment Variables, for Production and Preview) and redeploy.`}
    />
  );
} else {
  import('./App.jsx')
    .then(({ default: App }) => root.render(<App />))
    .catch((err) => {
      console.error(err);
      root.render(<StartupError title="Something went wrong while starting the app" detail={String(err?.message || err)} />);
    });
}
