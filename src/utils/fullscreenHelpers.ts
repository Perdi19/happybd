/**
 * Cross-browser Fullscreen API helpers for Chapter 7 video presentation.
 * Isolates standard Fullscreen API, Safari webkit prefixes, iOS video fullscreen,
 * blocked gesture fallbacks, and clean exit-on-leave cleanup for unit testing.
 */

export type FullscreenCapability = 'container' | 'webkit-container' | 'ios-video' | 'none';

export type AutoFullscreenStatus =
  | 'idle'
  | 'attempting'
  | 'active'
  | 'blocked'
  | 'unsupported'
  | 'exited';

export type FullscreenAttemptOutcome =
  | 'entered'
  | 'blocked'
  | 'unsupported'
  | 'already-active';

export interface FullscreenDocumentLike {
  fullscreenEnabled?: boolean;
  webkitFullscreenEnabled?: boolean;
  fullscreenElement?: unknown;
  webkitFullscreenElement?: unknown;
  exitFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
}

export interface FullscreenElementLike {
  requestFullscreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
}

export interface FullscreenVideoLike {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
  webkitSupportsFullscreen?: boolean;
  readyState?: number;
}

export function getFullscreenElement(doc: FullscreenDocumentLike | null | undefined): unknown {
  if (!doc) return null;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function isFullscreenActive(
  doc: FullscreenDocumentLike | null | undefined,
  video?: FullscreenVideoLike | null
): boolean {
  return Boolean(getFullscreenElement(doc) || video?.webkitDisplayingFullscreen);
}

export function detectFullscreenCapability(
  container: FullscreenElementLike | null | undefined,
  video: FullscreenVideoLike | null | undefined,
  doc: FullscreenDocumentLike | null | undefined
): FullscreenCapability {
  if (container?.requestFullscreen && doc?.fullscreenEnabled !== false) {
    return 'container';
  }
  if (container?.webkitRequestFullscreen && doc?.webkitFullscreenEnabled !== false) {
    return 'webkit-container';
  }
  if (video?.webkitEnterFullscreen) {
    return 'ios-video';
  }
  return 'none';
}

export function shouldAttemptAutoFullscreen(options: {
  isVideoAvailable: boolean;
  hasAttempted: boolean;
}): boolean {
  return options.isVideoAvailable && !options.hasAttempted;
}

export async function enterNativeFullscreen(options: {
  container: FullscreenElementLike | null | undefined;
  video?: FullscreenVideoLike | null;
  doc: FullscreenDocumentLike | null | undefined;
  allowIosVideo?: boolean;
}): Promise<FullscreenAttemptOutcome> {
  const { container, video, doc, allowIosVideo = false } = options;

  if (isFullscreenActive(doc, video)) {
    return 'already-active';
  }

  const capability = detectFullscreenCapability(container, video, doc);

  if (capability === 'container' && container?.requestFullscreen) {
    try {
      await container.requestFullscreen();
      return 'entered';
    } catch {
      return 'blocked';
    }
  }

  if (capability === 'webkit-container' && container?.webkitRequestFullscreen) {
    try {
      await container.webkitRequestFullscreen();
      return 'entered';
    } catch {
      return 'blocked';
    }
  }

  if (capability === 'ios-video' && allowIosVideo && video?.webkitEnterFullscreen) {
    try {
      video.webkitEnterFullscreen();
      return 'entered';
    } catch {
      return 'blocked';
    }
  }

  return 'unsupported';
}

export async function exitNativeFullscreen(options: {
  doc: FullscreenDocumentLike | null | undefined;
  video?: FullscreenVideoLike | null;
}): Promise<boolean> {
  const { doc, video } = options;

  try {
    if (doc?.fullscreenElement && doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    }
    if (doc?.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    }
    if (video?.webkitDisplayingFullscreen && video.webkitExitFullscreen) {
      video.webkitExitFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function getFullscreenPromptCopy(status: AutoFullscreenStatus): {
  message: string;
  buttonLabel: string;
  isBlockedFallback: boolean;
} {
  if (status === 'blocked' || status === 'unsupported') {
    return {
      message: 'اضغطي لفتح فيديو المفاجأة بملء الشاشة ❤️',
      buttonLabel: 'مشاهدة بملء الشاشة ✨',
      isBlockedFallback: true,
    };
  }

  return {
    message: 'ننصحك بتكبير الشاشة لمشاهدة المفاجأة بأجمل جودة ❤️',
    buttonLabel: 'مشاهدة بملء الشاشة ✨',
    isBlockedFallback: false,
  };
}
