import './style.css';
import iconUrl from '@/assets/icon.png';

import { togglePictureInPictureOnActiveTab } from '@/utils/picture-in-picture';

type StatusVariant = 'info' | 'success' | 'error';

const appElement = getRequiredElement<HTMLDivElement>('#app');

appElement.innerHTML = `
	<main class="popup">
		<header class="header">
			<img
				class="logo"
				src="${iconUrl}"
				alt="Picture in Picture Logo"
				width="32"
				height="32"
			/>

			<h1>Picture in Picture</h1>
		</header>

		<p class="hint">
			Open a page with a video, then use the page’s context menu or the button below to toggle Picture-in-Picture mode.
		</p>

		<button id="toggle-pip" type="button">
			Toggle PiP on Active Tab
		</button>

		<p id="status" class="status" role="status" aria-live="polite"></p>

		<footer class="footer">
			<div
				class="signature"
				aria-label="Crafted by Sephyi"
			>
				<span>♥️ Sephyi</span>
			</div>

			<div class="footer-links">
				<a
					href="https://github.com/Sephyi/picture-in-picture"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub Repository"
				>
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.15c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.77.11 3.06.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
						/>
					</svg>
				</a>
				<!--
				<a
					href="https://sephy.io"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Website"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20" />
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
					</svg>
				</a>
				-->
			</div>
		</footer>
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
