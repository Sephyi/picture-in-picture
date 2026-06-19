import {
	EXTENSION_MESSAGES,
	type ExtensionMessage,
	type ExtensionResponse
} from '@/utils/messages';

export default defineContentScript({
	main() {
		const controller = new PictureInPictureController();

		document.addEventListener(
			'contextmenu',
			(event) => {
				controller.captureContextVideo(event);
			},
			true
		);

		browser.runtime.onMessage.addListener(
			(message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
				if (message.type !== EXTENSION_MESSAGES.TogglePictureInPicture) {
					return false;
				}

				void controller
					.toggle()
					.then(() => {
						sendResponse({ ok: true });
					})
					.catch((error: unknown) => {
						sendResponse({
							error: getErrorMessage(error),
							ok: false
						});
					});

				return true;
			}
		);
	},
	matches: ['<all_urls>']
});

class PictureInPictureController {
	private lastContextVideo: HTMLVideoElement | null = null;

	public captureContextVideo(event: MouseEvent): void {
		const video = this.findVideoFromEvent(event);
		this.lastContextVideo = video;
	}

	public async toggle(): Promise<void> {
		const video = this.lastContextVideo ?? this.findBestVideo();

		if (!video) {
			throw new Error('No suitable video element found.');
		}

		await this.togglePictureInPicture(video);
	}

	private async togglePictureInPicture(video: HTMLVideoElement): Promise<void> {
		if (!document.pictureInPictureEnabled) {
			throw new Error('Picture in Picture is not enabled.');
		}

		if (document.pictureInPictureElement === video) {
			await document.exitPictureInPicture();
			return;
		}

		this.enablePictureInPicture(video);

		if (video.paused) {
			await video.play().catch(() => {
				throw new Error('Video must be playing before entering PiP.');
			});
		}

		await video.requestPictureInPicture();
	}

	private enablePictureInPicture(video: HTMLVideoElement): void {
		video.disablePictureInPicture = false;
		video.removeAttribute('disablepictureinpicture');
	}

	private findVideoFromEvent(event: MouseEvent): HTMLVideoElement | null {
		for (const node of event.composedPath()) {
			if (node instanceof HTMLVideoElement) {
				return node;
			}

			if (node instanceof Element) {
				const nestedVideo = node.querySelector('video');

				if (nestedVideo instanceof HTMLVideoElement) {
					return nestedVideo;
				}
			}
		}

		return null;
	}

	private findBestVideo(): HTMLVideoElement | null {
		const videos = Array.from(document.querySelectorAll('video'));

		return (
			videos
				.filter(isUsableVideo)
				.sort((left, right) => getVideoScore(right) - getVideoScore(left))[0] ?? null
		);
	}
}

function isUsableVideo(video: HTMLVideoElement): boolean {
	const rect = video.getBoundingClientRect();

	return (
		video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
		rect.width >= 120 &&
		rect.height >= 80 &&
		!video.ended
	);
}

function getVideoScore(video: HTMLVideoElement): number {
	const rect = video.getBoundingClientRect();
	const area = rect.width * rect.height;

	let score = area;

	if (!video.paused) score += 10_000_000;
	if (!video.muted) score += 1_000_000;
	if (document.fullscreenElement?.contains(video)) score += 100_000_000;

	return score;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}
