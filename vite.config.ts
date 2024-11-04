import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
        base: mode === 'development' ? './' : '/webcomponents-comments',
        css: {
            devSourcemap: mode === 'development',
        },
        server: {
            host: true,
            open: true,
        },
    };
});
