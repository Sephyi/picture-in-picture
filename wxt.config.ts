import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		description: 'Enable Picture in Picture for any video via the context menu.',
		host_permissions: ['<all_urls>'],
		name: "Sephyi's Picture in Picture",
		permissions: ['contextMenus', 'scripting']
	},
	srcDir: 'src'
});
