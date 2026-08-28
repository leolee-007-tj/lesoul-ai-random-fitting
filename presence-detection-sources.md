# Presence Detection Implementation Source

The browser-only person-detection experience uses MediaPipe Object Detector with video running mode, a `person` category allowlist, and a local camera stream. The official guide documents `detectForVideo()` for camera frames and states that the task identifies multiple object classes from image or video data.

* Official guide: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/web_js
* Official model path used for the static deployment asset: https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite

The application sends no camera frame to its server. The deployment stores only the vision model asset, the owner-uploaded MP3 URL, and the enabled state.
