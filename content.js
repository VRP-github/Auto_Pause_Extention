let lastActivity = Date.now();
let timeoutSeconds = 120;
let pausedByExtension = false;
let resumeTimer = null;

let faceDetected = true;
let faceDetectionEnabled = true;

// Load settings from Chrome storage
chrome.storage.sync.get(["timeoutSeconds", "faceDetectionEnabled"], (result) => {
  timeoutSeconds = result.timeoutSeconds ?? 120;
  faceDetectionEnabled = result.faceDetectionEnabled ?? true;
});

// Listen for face detection updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "faceStatus") {
    faceDetected = message.detected;
    console.log("📡 Face status:", faceDetected);
    checkAndResumeIfPossible();
  }
});

// Track user activity
function updateActivity() {
  lastActivity = Date.now();
  checkAndResumeIfPossible();
}

["mousemove", "keydown", "scroll", "click"].forEach(event =>
  window.addEventListener(event, updateActivity)
);

// Pause checker
function checkInactivity() {
  const now = Date.now();
  const video = document.querySelector("video");

  const isInactive = now - lastActivity > timeoutSeconds * 1000;
  const shouldPause = isInactive || (faceDetectionEnabled && !faceDetected);

  if (video && shouldPause && !video.paused) {
    console.log("⏸️ Pausing video...");
    video.pause();

    // Ensure it's actually paused before marking it
    setTimeout(() => {
      if (video.paused) {
        pausedByExtension = true;
        console.log("✅ Marked as paused by extension.");
      }
    }, 300);
  }
}

// Resume checker
function checkAndResumeIfPossible() {
  const video = document.querySelector("video");

  const isActive = Date.now() - lastActivity <= timeoutSeconds * 1000;
  const faceOK = faceDetectionEnabled ? faceDetected : true;

  if (
    pausedByExtension &&
    video &&
    video.paused &&
    faceOK &&
    isActive &&
    resumeTimer === null
  ) {
    console.log("⏳ Resume conditions met. Resuming in 3s...");

    resumeTimer = setTimeout(() => {
      const stillActive = Date.now() - lastActivity <= timeoutSeconds * 1000;
      const faceStillOK = faceDetectionEnabled ? faceDetected : true;

      if (video.paused && faceStillOK && stillActive) {
        video.play().then(() => {
          pausedByExtension = false;
          console.log("▶️ Video resumed.");
        }).catch(err => {
          console.warn("⚠️ Resume failed:", err);
        });
      }

      resumeTimer = null;
    }, 3000);
  }
}

setInterval(checkInactivity, 1000);
