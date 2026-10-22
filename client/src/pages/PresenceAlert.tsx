import MobileScreen from "@/components/MobileScreen";
import { trpc } from "@/lib/trpc";
import { shouldContinuePresencePlayback, shouldStartPresencePlayback } from "@shared/presenceAlert";
import { Camera, CircleAlert, LoaderCircle, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const detectorAssets = {
  wasmLoaderPath: "/manus-storage/vision_wasm_internal_bbcfafd9.js",
  wasmBinaryPath: "/manus-storage/vision_wasm_internal_892942ff.wasm",
};
const personModelUrl = "/manus-storage/efficientdet_lite0_uint8_9d794701.tflite";

type DetectionResult = { detections: Array<{ categories?: Array<{ categoryName?: string; score?: number }> }> };
type PersonDetector = { detectForVideo: (video: HTMLVideoElement, timestamp: number) => DetectionResult; close?: () => void };

export default function PresenceAlert() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "LESOUL WELCOME", title: "CAMERA GREETING", body: "Choose to enable your camera and sound. When a person is detected, camera detection stops and the greeting plays the configured number of times.", start: "ENABLE CAMERA & SOUND", retry: "RETRY CAMERA", stop: "STOP CAMERA", preparing: "Preparing private on-device detection…", ready: "Camera is ready. Waiting for a person.", present: "A person is detected. Camera is stopping.", playing: "Greeting is playing. Camera detection is off.", played: "Greeting finished. Start the camera again to detect another visit.", disabled: "This greeting is currently unavailable.", privacy: "Your camera feed stays on this device. No image, video, or camera frame is uploaded or stored.", gesture: "Sound starts only after you press the enable button.", error: "Camera or local detection could not start. Check camera permission and try again.", permissionBlocked: "Safari blocked camera access. Open Settings → Safari → Camera and allow this site, then return and retry.", cameraBusy: "The iPad camera is already in use by another app or tab. Close it and retry.", cameraMissing: "No usable camera was found on this iPad. Check the camera and retry.", modelFailed: "The on-device detection model could not load. Check the network, refresh this page, and retry.", audioBlocked: "The camera opened, but Safari blocked sound. Tap the enable button again and check Silent Mode.", technical: "Technical details", copyError: "Copy error details", unsupported: "This browser does not support camera access.", back: "Return to the collection" },
    ko: { eyebrow: "LESOUL 웰컴", title: "카메라 방문 알림", body: "카메라와 소리를 직접 허용하면 사람이 감지되는 즉시 카메라 감지가 멈추고, 설정한 횟수만큼 안내음만 재생됩니다.", start: "카메라와 소리 허용", retry: "카메라 다시 시도", stop: "카메라 끄기", preparing: "기기 안에서 감지를 준비하는 중…", ready: "카메라가 준비되었습니다. 사람을 기다리는 중입니다.", present: "사람이 감지되어 카메라를 끄는 중입니다.", playing: "안내음 재생 중입니다. 카메라 감지는 꺼져 있습니다.", played: "안내음 재생이 끝났습니다. 다시 감지하려면 카메라를 시작하세요.", disabled: "현재 이 안내 기능은 사용할 수 없습니다.", privacy: "카메라 영상은 이 기기 안에서만 처리됩니다. 이미지·영상·프레임은 업로드하거나 저장하지 않습니다.", gesture: "소리는 직접 허용 버튼을 누른 뒤에만 재생됩니다.", error: "카메라 또는 기기 내 감지를 시작할 수 없습니다. 카메라 권한을 확인한 뒤 다시 시도해 주세요.", permissionBlocked: "Safari가 카메라 접근을 차단했습니다. 설정 → Safari → 카메라에서 이 사이트를 허용한 뒤 다시 시도해 주세요.", cameraBusy: "iPad 카메라가 다른 앱이나 탭에서 사용 중입니다. 해당 화면을 닫고 다시 시도해 주세요.", cameraMissing: "iPad에서 사용할 수 있는 카메라를 찾지 못했습니다. 카메라 상태를 확인해 주세요.", modelFailed: "기기 내 감지 모델을 불러오지 못했습니다. 네트워크를 확인하고 페이지를 새로고침한 뒤 다시 시도해 주세요.", audioBlocked: "카메라는 켜졌지만 Safari가 소리를 차단했습니다. 허용 버튼을 다시 누르고 무음 모드를 확인해 주세요.", technical: "기술 세부 정보", copyError: "오류 내용 복사", unsupported: "이 브라우저는 카메라 접근을 지원하지 않습니다.", back: "상품 둘러보기로 돌아가기" },
    zh: { eyebrow: "LESOUL 欢迎", title: "摄像头到店提醒", body: "您自行允许摄像头和声音后，一旦检测到有人，摄像头识别会停止，只按设定次数播放提示音。", start: "允许摄像头和声音", retry: "重试摄像头", stop: "关闭摄像头", preparing: "正在设备本地准备识别…", ready: "摄像头已准备好，正在等待有人进入画面。", present: "已检测到有人，正在关闭摄像头。", playing: "正在播放提示音，摄像头识别已关闭。", played: "提示音播放完毕。如需再次检测，请重新开启摄像头。", disabled: "此提醒功能当前不可用。", privacy: "摄像头画面仅在本设备内处理，不会上传或保存任何图片、视频或画面帧。", gesture: "仅在您主动点击允许按钮后才会播放声音。", error: "无法启动摄像头或本地识别。请检查摄像头权限后重试。", permissionBlocked: "Safari 阻止了摄像头访问。请在设置 → Safari → 摄像头中允许此网站，然后返回重试。", cameraBusy: "iPad 摄像头正在被其他应用或标签页使用，请关闭后重试。", cameraMissing: "没有找到可用的 iPad 摄像头，请检查摄像头后重试。", modelFailed: "设备端识别模型加载失败，请检查网络、刷新页面后重试。", audioBlocked: "摄像头已打开，但 Safari 阻止了声音。请再次点击允许按钮并检查静音模式。", technical: "技术详情", copyError: "复制错误详情", unsupported: "此浏览器不支持摄像头访问。", back: "返回浏览商品" },
  }[locale];
  const [, navigate] = useLocation();
  const describeError = (cause: unknown, stage: string) => {
    const name = cause instanceof DOMException ? cause.name : cause instanceof Error ? cause.name : "UnknownError";
    if ((stage === "camera_permission" || stage === "camera_permission_fallback") && ["NotAllowedError", "SecurityError"].includes(name)) return copy.permissionBlocked;
    if ((stage === "camera_permission" || stage === "camera_permission_fallback") && name === "NotReadableError") return copy.cameraBusy;
    if ((stage === "camera_permission" || stage === "camera_permission_fallback") && name === "NotFoundError") return copy.cameraMissing;
    if (stage === "audio_playback") return copy.audioBlocked;
    if (stage === "model_load" || stage === "model_init") return copy.modelFailed;
    return copy.error;
  };
  const config = trpc.catalog.presenceAlertConfig.useQuery();
  const heartbeat = trpc.catalog.presenceAlertHeartbeat.useMutation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<PersonDetector | null>(null);
  const timerRef = useRef<number | null>(null);
  const playbackRef = useRef(false);
  const [state, setState] = useState<"idle" | "preparing" | "ready" | "present" | "playing" | "played" | "error">("idle");
  const [error, setError] = useState("");
  const [technicalError, setTechnicalError] = useState("");

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    detectorRef.current?.close?.();
    detectorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.onended = null;
    playbackRef.current = false;
    heartbeat.mutate({ active: false });
    setState("idle");
  }, [heartbeat]);

  useEffect(() => () => stop(), [stop]);

  const start = async () => {
    if (!config.data?.enabled || !config.data.soundUrl) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setError(copy.unsupported); setTechnicalError("SECURE_CONTEXT_OR_GET_USER_MEDIA_UNAVAILABLE"); setState("error"); return; }
    setError("");
    setTechnicalError("");
    setState("preparing");
    let stage = "audio_setup";
    try {
      const audio = audioRef.current;
      if (!audio) throw new Error("AUDIO_UNAVAILABLE");
      // Unlock audio while the click gesture is still active. iPad Safari can
      // reject playback if this is delayed until after camera/model awaits.
      audio.muted = true;
      audio.currentTime = 0;
      // Do not wait for the sound file to buffer before requesting the camera.
      // On iPad Safari a slow/uncached MP3 can otherwise leave the screen in
      // "preparing" and prevent getUserMedia from ever being called.
      void audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => undefined).finally(() => { audio.muted = false; });
      stage = "camera_permission";
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      } catch (cause) {
        // Older iPad Safari builds can reject ideal constraints even though the
        // camera is available. Retry with the smallest portable request.
        if (cause instanceof DOMException && cause.name === "OverconstrainedError") {
          stage = "camera_permission_fallback";
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } else throw cause;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("VIDEO_UNAVAILABLE");
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("muted", "true");
      video.srcObject = stream;
      stage = "video_metadata";
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) await new Promise<void>((resolve, reject) => { const timeout = window.setTimeout(() => reject(new Error("VIDEO_METADATA_TIMEOUT")), 5000); video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); }; video.onerror = () => { window.clearTimeout(timeout); reject(new Error("VIDEO_METADATA_ERROR")); }; });
      stage = "video_start";
      await video.play();
      heartbeat.mutate({ active: true });
      stage = "model_load";
      const vision = await import("@mediapipe/tasks-vision");
      stage = "model_init";
      const detector = await vision.ObjectDetector.createFromOptions(detectorAssets, { baseOptions: { modelAssetPath: personModelUrl }, scoreThreshold: 0.5, runningMode: "VIDEO", categoryAllowlist: ["person"], maxResults: 1 });
      detectorRef.current = detector as PersonDetector;
      setState("ready");
      const inspectFrame = () => {
        const activeDetector = detectorRef.current;
        const activeVideo = videoRef.current;
        if (!activeDetector || !activeVideo || playbackRef.current) return;
        if (activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || activeVideo.videoWidth === 0 || activeVideo.videoHeight === 0) {
          timerRef.current = window.setTimeout(inspectFrame, 250);
          return;
        }
        try {
          stage = "frame_detection";
          const result = activeDetector.detectForVideo(activeVideo, performance.now());
          const personDetected = result.detections.some((detection) => detection.categories?.some((category) => category.categoryName === "person" && (category.score ?? 0) >= 0.5));
          if (personDetected) {
            setState("present");
            if (shouldStartPresencePlayback({ personDetected, isPlaying: playbackRef.current, hasSound: Boolean(audioRef.current?.src) })) {
              playbackRef.current = true;
              const alertAudio = audioRef.current;
              if (alertAudio) {
                if (timerRef.current !== null) window.clearTimeout(timerRef.current);
                timerRef.current = null;
                detectorRef.current?.close?.(); detectorRef.current = null;
                streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
                if (videoRef.current) videoRef.current.srcObject = null;
                heartbeat.mutate({ active: false });
                const repeatCount = config.data.repeatCount ?? 1;
                let completedPlays = 0;
                const playNext = () => { alertAudio.currentTime = 0; void alertAudio.play().then(() => setState("playing")).catch((cause) => { playbackRef.current = false; setTechnicalError(`audio_playback: ${cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause)}`); setError(describeError(cause, "audio_playback")); setState("error"); }); };
                alertAudio.onended = () => { completedPlays += 1; if (shouldContinuePresencePlayback({ completedPlays, repeatCount })) playNext(); else { alertAudio.onended = null; setState("played"); } };
                playNext();
              }
            }
          }
        } catch (cause) {
          detectorRef.current?.close?.(); detectorRef.current = null;
          streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
          heartbeat.mutate({ active: false, errorStage: "frame_detection" });
          const detail = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
          setTechnicalError(`frame_detection: ${detail}`);
          setError(describeError(cause, "frame_detection"));
          setState("error");
          return;
        }
        if (!playbackRef.current) timerRef.current = window.setTimeout(inspectFrame, 450);
      };
      inspectFrame();
    } catch (cause) {
      stop();
      heartbeat.mutate({ active: false, errorStage: stage });
      const detail = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
      setTechnicalError(`${stage}: ${detail}`);
      setError(describeError(cause, stage));
      setState("error");
    }
  };

  const status = state === "preparing" ? copy.preparing : state === "present" ? copy.present : state === "playing" ? copy.playing : state === "played" ? copy.played : state === "ready" ? copy.ready : error;
  if (config.isLoading) return <MobileScreen showHeader={false} showNavigation={false}><main className="grid min-h-[70dvh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.preparing} /></main></MobileScreen>;
  if (!config.data?.enabled || !config.data.soundUrl) return <MobileScreen showHeader={false} showNavigation={false}><main className="lesoul-mobile-frame grid min-h-[70dvh] place-items-center px-6 text-center"><div><VolumeX className="mx-auto text-[#887a6c]" size={30} /><h1 className="mt-4 font-serif text-2xl text-[#29231e]">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#756b61]">{copy.disabled}</p><button type="button" onClick={() => navigate("/store-display")} className="mt-5 rounded-xl border border-[#d8d0c7] bg-white px-4 py-2 text-xs font-bold">{copy.back}</button></div></main></MobileScreen>;
  return <MobileScreen showHeader={false} showNavigation={false}><main className="lesoul-mobile-frame px-5 pb-8 pt-6"><header className="text-center"><p className="text-[10px] font-bold tracking-[.18em] text-[#8a7968]">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-3xl text-[#28211c]">{copy.title}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746a60]">{copy.body}</p></header><section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#ded7ce] bg-[#1e1b18] shadow-[0_18px_36px_rgba(35,29,24,.14)]"><div className="relative aspect-[4/3] bg-[#24201d]"><video ref={videoRef} muted playsInline className={`size-full object-cover transition-opacity duration-300 ${state === "idle" || state === "error" || state === "playing" || state === "played" ? "opacity-0" : "opacity-100"}`} />{(state === "idle" || state === "preparing" || state === "error" || state === "playing" || state === "played") && <div className="absolute inset-0 grid place-items-center text-white"><div className="rounded-full bg-black/35 p-3 backdrop-blur-sm">{state === "preparing" ? <LoaderCircle className="animate-spin" size={22} /> : state === "playing" ? <Volume2 size={22} /> : <Camera size={22} />}</div></div>}</div><div className="p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#c2a27d]" size={18} /><p className="text-xs leading-5 text-[#eee8e0]">{copy.privacy}</p></div><p className="mt-3 text-[11px] text-[#bfb4a9]">{copy.gesture}</p>{status && <p className={`mt-3 flex items-center gap-2 text-xs ${state === "error" ? "text-[#ffb6a7]" : "text-[#f8f1e8]"}`}>{state === "error" ? <CircleAlert size={14} /> : <Volume2 size={14} />}{status}</p>}{state === "error" && technicalError && <details className="mt-3 rounded-lg bg-black/20 p-2 text-[10px] text-[#e3d8cc]"><summary className="cursor-pointer font-semibold">{copy.technical}</summary><code className="mt-2 block break-words leading-4">{technicalError}</code><button type="button" onClick={() => void navigator.clipboard?.writeText(technicalError)} className="mt-2 rounded-md border border-white/30 px-2 py-1 font-semibold">{copy.copyError}</button></details>}<button type="button" onClick={state === "idle" || state === "error" || state === "played" ? start : stop} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold tracking-[.08em] text-[#27211c] active:scale-[.98]">{state === "idle" || state === "error" || state === "played" ? <><Camera size={15} />{state === "error" ? copy.retry : copy.start}</> : <><VolumeX size={15} />{copy.stop}</>}</button><button type="button" onClick={() => navigate("/store-display")} className="mt-3 w-full text-xs font-semibold text-[#d9cab9]">{copy.back}</button></div></section><audio ref={audioRef} preload="auto" src={config.data.soundUrl} /></main></MobileScreen>;
}
