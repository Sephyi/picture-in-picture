export const EXTENSION_MESSAGES = {
	TogglePictureInPicture: 'TOGGLE_PICTURE_IN_PICTURE'
} as const;

export type ExtensionMessage = {
	readonly type: typeof EXTENSION_MESSAGES.TogglePictureInPicture;
};

export type ExtensionResponse =
	| {
			readonly ok: true;
	  }
	| {
			readonly ok: false;
			readonly error: string;
	  };
