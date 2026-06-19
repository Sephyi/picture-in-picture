import { togglePictureInPictureInTab } from '@/utils/picture-in-picture';

const CONTEXT_MENU_ID = 'picture-in-picture-video';

export default defineBackground(() => {
	browser.runtime.onInstalled.addListener(() => {
		createContextMenu();
	});

	browser.runtime.onStartup.addListener(() => {
		createContextMenu();
	});

	browser.contextMenus.onClicked.addListener((info, tab) => {
		if (info.menuItemId !== CONTEXT_MENU_ID) return;

		void handlePictureInPictureClick(tab);
	});
});

function createContextMenu(): void {
	browser.contextMenus.remove(CONTEXT_MENU_ID, () => {
		const removeError = browser.runtime.lastError;
		const removeMessage = removeError?.message ?? '';

		if (removeError && !removeMessage.includes('Cannot find menu item with id')) {
			console.warn('[PiP] Could not remove existing context menu:', removeMessage);
		}

		browser.contextMenus.create(
			{
				contexts: ['video', 'page'],
				documentUrlPatterns: ['http://*/*', 'https://*/*', 'file://*/*'],
				id: CONTEXT_MENU_ID,
				title: 'Picture in Picture'
			},
			() => {
				const createError = browser.runtime.lastError;
				const createMessage = createError?.message ?? '';

				if (createError) {
					console.warn('[PiP] Could not create context menu:', createMessage);
				}
			}
		);
	});
}

async function handlePictureInPictureClick(tab?: Browser.tabs.Tab): Promise<void> {
	if (!tab) {
		console.warn('[PiP] Missing active tab.');
		return;
	}

	const response = await togglePictureInPictureInTab(tab);

	if (!response.ok) {
		console.warn('[PiP] Failed:', response.error);
	}
}
