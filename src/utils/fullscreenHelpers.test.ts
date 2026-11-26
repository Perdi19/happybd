import assert from 'node:assert/strict';
import test from 'node:test';
import {
  detectFullscreenCapability,
  enterNativeFullscreen,
  exitNativeFullscreen,
  getFullscreenElement,
  getFullscreenPromptCopy,
  isFullscreenActive,
  shouldAttemptAutoFullscreen,
} from './fullscreenHelpers.ts';

test('shouldAttemptAutoFullscreen triggers at most once when video is available', () => {
  assert.equal(shouldAttemptAutoFullscreen({ isVideoAvailable: true, hasAttempted: false }), true);
  assert.equal(shouldAttemptAutoFullscreen({ isVideoAvailable: true, hasAttempted: true }), false);
  assert.equal(shouldAttemptAutoFullscreen({ isVideoAvailable: false, hasAttempted: false }), false);
});

test('enterNativeFullscreen succeeds via standard Fullscreen API', async () => {
  let called = false;
  const container = {
    requestFullscreen: async () => {
      called = true;
    },
  };
  const doc = { fullscreenEnabled: true, fullscreenElement: null };

  const outcome = await enterNativeFullscreen({ container, doc });
  assert.equal(outcome, 'entered');
  assert.equal(called, true);
});

test('enterNativeFullscreen falls back to webkit container API when standard API is absent', async () => {
  let webkitCalled = false;
  const container = {
    webkitRequestFullscreen: () => {
      webkitCalled = true;
    },
  };
  const doc = { webkitFullscreenEnabled: true };

  const outcome = await enterNativeFullscreen({ container, doc });
  assert.equal(outcome, 'entered');
  assert.equal(webkitCalled, true);
});

test('enterNativeFullscreen returns blocked gracefully when browser rejects due to missing user gesture', async () => {
  const container = {
    requestFullscreen: () => Promise.reject(new TypeError('API can only be initiated by a user gesture.')),
  };
  const doc = { fullscreenEnabled: true, fullscreenElement: null };

  const outcome = await enterNativeFullscreen({ container, doc });
  assert.equal(outcome, 'blocked');
});

test('enterNativeFullscreen returns unsupported when Fullscreen API is disabled or missing', async () => {
  assert.equal(
    await enterNativeFullscreen({
      container: { requestFullscreen: async () => {} },
      doc: { fullscreenEnabled: false },
    }),
    'unsupported'
  );

  // Automatic mode does not force ungestured iOS native video player popup
  assert.equal(
    await enterNativeFullscreen({
      container: {},
      video: { webkitEnterFullscreen: () => {} },
      doc: {},
      allowIosVideo: false,
    }),
    'unsupported'
  );

  // Explicit user tap allows iOS native video fullscreen
  let iosEntered = false;
  assert.equal(
    await enterNativeFullscreen({
      container: {},
      video: {
        webkitEnterFullscreen: () => {
          iosEntered = true;
        },
      },
      doc: {},
      allowIosVideo: true,
    }),
    'entered'
  );
  assert.equal(iosEntered, true);
});

test('enterNativeFullscreen reports already-active when document or video is already fullscreen', async () => {
  const activeEl = {};
  assert.equal(getFullscreenElement({ fullscreenElement: activeEl }), activeEl);
  assert.equal(isFullscreenActive({ fullscreenElement: activeEl }), true);
  assert.equal(isFullscreenActive({}, { webkitDisplayingFullscreen: true }), true);

  const outcome = await enterNativeFullscreen({
    container: { requestFullscreen: async () => {} },
    doc: { fullscreenEnabled: true, fullscreenElement: activeEl },
  });
  assert.equal(outcome, 'already-active');
});

test('exitNativeFullscreen cleans up standard, webkit, and iOS fullscreen safely on leave', async () => {
  let standardExited = false;
  assert.equal(
    await exitNativeFullscreen({
      doc: {
        fullscreenElement: {},
        exitFullscreen: async () => {
          standardExited = true;
        },
      },
    }),
    true
  );
  assert.equal(standardExited, true);

  let webkitExited = false;
  assert.equal(
    await exitNativeFullscreen({
      doc: {
        webkitFullscreenElement: {},
        webkitExitFullscreen: () => {
          webkitExited = true;
        },
      },
    }),
    true
  );
  assert.equal(webkitExited, true);

  let iosExited = false;
  assert.equal(
    await exitNativeFullscreen({
      doc: {},
      video: {
        webkitDisplayingFullscreen: true,
        webkitExitFullscreen: () => {
          iosExited = true;
        },
      },
    }),
    true
  );
  assert.equal(iosExited, true);

  // Rejection while cleaning up must never throw during component unmount
  assert.equal(
    await exitNativeFullscreen({
      doc: {
        fullscreenElement: {},
        exitFullscreen: () => Promise.reject(new Error('Document not active')),
      },
    }),
    false
  );
});

test('detectFullscreenCapability and fallback prompt copy cover blocked and exited states', () => {
  assert.equal(detectFullscreenCapability({}, {}, {}), 'none');
  const blockedPrompt = getFullscreenPromptCopy('blocked');
  assert.equal(blockedPrompt.isBlockedFallback, true);
  assert.equal(blockedPrompt.buttonLabel, 'مشاهدة بملء الشاشة ✨');

  const exitedPrompt = getFullscreenPromptCopy('exited');
  assert.equal(exitedPrompt.isBlockedFallback, false);
  assert.equal(exitedPrompt.buttonLabel, 'مشاهدة بملء الشاشة ✨');
});
