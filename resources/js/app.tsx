import '../css/app.css';

import background from '@/assets/backgroung.jpg'; // ✅ make sure path is correct
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${background})`,
                }}
            >
                <div className="min-h-screen bg-black/40 backdrop-blur-sm">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 5000,
                        }}
                        reverseOrder={false}
                    />
                    <App {...props} />
                </div>
            </div>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
