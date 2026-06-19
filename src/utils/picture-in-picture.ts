import {
	EXTENSION_MESSAGES,
	type ExtensionMessage,
	type ExtensionResponse
} from '@/utils/messages';

const CONTENT_SCRIPT_PATH = '/content-scripts/content.js';
const MISSING_RECEIVER_ERROR = 'Could not establish connection. Receiving end does not exist.';
const UNSUPPORTED_TAB_ERROR =
	'Picture in Picture is only supported on http, https, and file pages.';

const togglePictureInPictureMessage: ExtensionMessage = {
	type: EXTENSION_MESSAGES.TogglePictureInPicture
};

export async function togglePictureInPictureOnActiveTab(): Promise<ExtensionResponse> {
	const [activeTab] = await browser.tabs.query({
		active: true,
		currentWindow: true
	});

	if (!activeTab) {
		return {
			error: 'Could not find an active tab.',
			ok: false
		};
	}

	return togglePictureInPictureInTab(activeTab);
}

export async function togglePictureInPictureInTab(
	tab: Browser.tabs.Tab
): Promise<ExtensionResponse> {
	const tabId = tab.id;

	if (typeof tabId !== 'number') {
		return {
			error: 'Could not determine the target tab.',
			ok: false
		};
	}

	if (!isSupportedTabUrl(tab.url)) {
		return {
			error: UNSUPPORTED_TAB_ERROR,
			ok: false
		};
	}

	try {
		return await sendToggleMessage(tabId);
	} catch (error) {
		if (!isMissingReceiverError(error)) {
			return {
				error: getErrorMessage(error),
				ok: false
			};
		}

		try {
			await browser.scripting.executeScript({
				files: [CONTENT_SCRIPT_PATH],
				target: { tabId }
			});

			return await sendToggleMessage(tabId);
		} catch (retryError) {
			return {
				error: getErrorMessage(retryError),
				ok: false
			};
		}
	}
}

function isSupportedTabUrl(tabUrl?: string): boolean {
	if (!tabUrl) {
		return false;
	}

	return /^(https?|file):\/\//.test(tabUrl);
}

function isMissingReceiverError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	return error.message.includes(MISSING_RECEIVER_ERROR);
}

async function sendToggleMessage(tabId: number): Promise<ExtensionResponse> {
	const response = await browser.tabs.sendMessage<ExtensionMessage, ExtensionResponse>(
		tabId,
		togglePictureInPictureMessage
	);

	if (!response) {
		return {
			error: 'No response from the content script.',
			ok: false
		};
	}

	return response;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}
