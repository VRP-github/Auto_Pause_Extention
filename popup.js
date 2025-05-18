document.addEventListener("DOMContentLoaded", () => {
  const inputTotalSeconds = document.getElementById("timeoutSecondsTotal");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusMessage = document.getElementById("statusMessage");
  const currentTimeout = document.getElementById("currentTimeout");
  const faceToggle = document.getElementById("faceDetectionToggle");

  const DEFAULT_SECONDS = 120;
  const DEFAULT_FACE_DETECTION = true;

  function showStatus(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = '';
    statusMessage.classList.add(type);
  }

  function formatTime(totalSeconds) {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min} min${min !== 1 ? 's' : ''} ${sec} sec${sec !== 1 ? 's' : ''}`;
  }

  function updateDisplay(seconds) {
    inputTotalSeconds.value = seconds;
    currentTimeout.textContent = `⏱ Current timeout: ${formatTime(seconds)}`;
  }

  chrome.storage.sync.get(["timeoutSeconds", "faceDetectionEnabled"], (result) => {
    const total = result.timeoutSeconds ?? DEFAULT_SECONDS;
    updateDisplay(total);

    const faceEnabled = result.faceDetectionEnabled ?? DEFAULT_FACE_DETECTION;
    faceToggle.checked = faceEnabled;
  });

  saveBtn.addEventListener("click", () => {
    const total = parseInt(inputTotalSeconds.value);
    const faceEnabled = faceToggle.checked;

    if (isNaN(total) || total <= 0) {
      showStatus("❌ Enter a valid number > 0", "error");
      return;
    }

    chrome.storage.sync.set({
      timeoutSeconds: total,
      faceDetectionEnabled: faceEnabled
    }, () => {
      updateDisplay(total);
      showStatus("✅ Settings saved!", "success");
    });
  });

  resetBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      timeoutSeconds: DEFAULT_SECONDS,
      faceDetectionEnabled: DEFAULT_FACE_DETECTION
    }, () => {
      updateDisplay(DEFAULT_SECONDS);
      faceToggle.checked = DEFAULT_FACE_DETECTION;
      showStatus("↩️ Reset to default settings", "success");
    });
  });
});
