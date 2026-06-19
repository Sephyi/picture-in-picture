import './style.css';

import { togglePictureInPictureOnActiveTab } from '@/utils/picture-in-picture';

type StatusVariant = 'info' | 'success' | 'error';

const appElement = getRequiredElement<HTMLDivElement>('#app');

appElement.innerHTML = `
	<main class="popup">
		<h1>Picture in Picture</h1>
		<p class="hint">Open a page with a video, then use the page’s context menu or the button below to toggle Picture-in-Picture mode.</p>
		<button id="toggle-pip" type="button">Toggle PiP on Active Tab</button>
		<p id="status" class="status" role="status" aria-live="polite"></p>
	</main>
`;

const toggleButton = getRequiredElement<HTMLButtonElement>('#toggle-pip');
const statusElement = getRequiredElement<HTMLParagraphElement>('#status');

toggleButton.addEventListener('click', () => {
	void handleTogglePictureInPicture();
});

async function handleTogglePictureInPicture(): Promise<void> {
	setStatus('Toggling PiP...', 'info');
	toggleButton.disabled = true;

	try {
		const response = await togglePictureInPictureOnActiveTab();

		if (!response.ok) {
			throw new Error(response.error);
		}

		setStatus('Success. PiP toggled.', 'success');
	} catch (error) {
		setStatus(getErrorMessage(error), 'error');
	} finally {
		toggleButton.disabled = false;
	}
}

function setStatus(message: string, variant: StatusVariant): void {
	statusElement.textContent = message;
	statusElement.dataset.variant = variant;
}

function getRequiredElement<TElement extends Element>(
	selector: string,
	parent: ParentNode = document
): TElement {
	const element = parent.querySelector<TElement>(selector);

	if (!element) {
		throw new Error(`Required element not found: ${selector}`);
	}

	return element;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}
