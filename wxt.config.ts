import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: 'Linkedin Puzzle Solver',
        permissions: ['storage', 'sidePanel'],
        host_permissions: ["<all_urls>"]
    },
});
