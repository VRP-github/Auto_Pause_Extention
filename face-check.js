async function setupFaceDetection() {
  const settings = await new Promise(resolve =>
    chrome.storage.sync.get(["faceDetectionEnabled"], resolve)
  );

  const isEnabled = settings.faceDetectionEnabled ?? true;
  if (!isEnabled) {
    console.log("🛑 Face detection is disabled in settings.");
    return;
  }

  await faceapi.nets.ssdMobilenetv1.loadFromUri(chrome.runtime.getURL("models"));

  const webcam = document.createElement("video");
  webcam.setAttribute("autoplay", true);
  webcam.setAttribute("playsinline", true);
  webcam.style.display = "none";
  document.body.appendChild(webcam);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcam.srcObject = stream;

    let lastFaceStatus = null;

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(webcam);
      const faceDetected = detections.length > 0;

      if (faceDetected !== lastFaceStatus) {
        chrome.runtime.sendMessage({ type: "faceStatus", detected: faceDetected });
        console.log(faceDetected ? "😀 Face detected" : "🧠 Face NOT detected");
        lastFaceStatus = faceDetected;
      }
    }, 1000);
  } catch (err) {
    console.error("🚫 Webcam access error:", err);
  }
}

setupFaceDetection();
