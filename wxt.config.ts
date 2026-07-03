import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		description:
			'Enable Picture-in-Picture for any HTML5 video via the page context menu or extension popup. Open-source, lightweight, and privacy-focused.',
		host_permissions: ['<all_urls>'],
		name: "Sephyi's Picture in Picture",
		permissions: ['contextMenus', 'scripting']
	},
	srcDir: 'src'
});
