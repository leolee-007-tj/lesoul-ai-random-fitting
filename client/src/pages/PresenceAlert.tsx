import MobileScreen from "@/components/MobileScreen";
import { trpc } from "@/lib/trpc";
import { shouldContinuePresencePlayback, shouldStartPresencePlayback } from "@shared/presenceAlert";
import { Camera, CircleAlert, LoaderCircle, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
    en: { eyebrow: "LESOUL WELCOME", title: "CAMERA GREETING", body: "Choose to enable your camera and sound. When a person is detected, camera detection stops and the greeting plays the configured number of times.", start: "ENABLE CAMERA & SOUND", stop: "STOP CAMERA", preparing: "Preparing private on-device detection…", ready: "Camera is ready. Waiting for a person.", present: "A person is detected. Camera is stopping.", playing: "Greeting is playing. Camera detection is off.", played: "Greeting finished. Start the camera again to detect another visit.", disabled: "This greeting is currently unavailable.", privacy: "Your camera feed stays on this device. No image, video, or camera frame is uploaded or stored.", gesture: "Sound starts only after you press the enable button.", error: "Camera or local detection could not start. Check camera permission and try again.", unsupported: "This browser does not support camera access.", back: "Return to the collection" },
    ko: { eyebrow: "LESOUL 웰컴", title: "카메라 방문 알림", body: "카메라와 소리를 직접 허용하면 사람이 감지되는 즉시 카메라 감지가 멈추고, 설정한 횟수만큼 안내음만 재생됩니다.", start: "카메라와 소리 허용", stop: "카메라 끄기", preparing: "기기 안에서 감지를 준비하는 중…", ready: "카메라가 준비되었습니다. 사람을 기다리는 중입니다.", present: "사람이 감지되어 카메라를 끄는 중입니다.", playing: "안내음 재생 중입니다. 카메라 감지는 꺼져 있습니다.", played: "안내음 재생이 끝났습니다. 다시 감지하려면 카메라를 시작하세요.", disabled: "현재 이 안내 기능은 사용할 수 없습니다.", privacy: "카메라 영상은 이 기기 안에서만 처리됩니다. 이미지·영상·프레임은 업로드하거나 저장하지 않습니다.", gesture: "소리는 직접 허용 버튼을 누른 뒤에만 재생됩니다.", error: "카메라 또는 기기 내 감지를 시작할 수 없습니다. 카메라 권한을 확인한 뒤 다시 시도해 주세요.", unsupported: "이 브라우저는 카메라 접근을 지원하지 않습니다.", back: "상품 둘러보기로 돌아가기" },
    zh: { eyebrow: "LESOUL 欢迎", title: "摄像头到店提醒", body: "您自行允许摄像头和声音后，一旦检测到有人，摄像头识别会停止，只按设定次数播放提示音。", start: "允许摄像头和声音", stop: "关闭摄像头", preparing: "正在设备本地准备识别…", ready: "摄像头已准备好，正在等待有人进入画面。", present: "已检测到有人，正在关闭摄像头。", playing: "正在播放提示音，摄像头识别已关闭。", played: "提示音播放完毕。如需再次检测，请重新开启摄像头。", disabled: "此提醒功能当前不可用。", privacy: "摄像头画面仅在本设备内处理，不会上传或保存任何图片、视频或画面帧。", gesture: "仅在您主动点击允许按钮后才会播放声音。", error: "无法启动摄像头或本地识别。请检查摄像头权限后重试。", unsupported: "此浏览器不支持摄像头访问。", back: "返回浏览商品" },
  }[locale];
  const config = trpc.catalog.presenceAlertConfig.useQuery();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<PersonDetector | null>(null);
  const timerRef = useRef<number | null>(null);
  const playbackRef = useRef(false);
  const [state, setState] = useState<"idle" | "preparing" | "ready" | "present" | "playing" | "played" | "error">("idle");
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    detectorRef.current?.close?.();
    detectorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    playbackRef.current = false;
    setState("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = async () => {
    if (!config.data?.enabled || !config.data.soundUrl) return;
    if (!navigator.mediaDevices?.getUserMedia) { setError(copy.unsupported); setState("error"); return; }
    setError("");
    setState("preparing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("VIDEO_UNAVAILABLE");
      video.srcObject = stream;
      await video.play();
      const audio = audioRef.current;
      if (!audio) throw new Error("AUDIO_UNAVAILABLE");
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      const vision = await import("@mediapipe/tasks-vision");
      const detector = await vision.ObjectDetector.createFromOptions(detectorAssets, { baseOptions: { modelAssetPath: personModelUrl }, scoreThreshold: 0.5, runningMode: "VIDEO", categoryAllowlist: ["person"], maxResults: 1 });
      detectorRef.current = detector as PersonDetector;
      setState("ready");
      const inspectFrame = () => {
        const activeDetector = detectorRef.current;
        const activeVideo = videoRef.current;
        if (!activeDetector || !activeVideo || activeVideo.readyState < 2) return;
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
              const repeatCount = config.data.repeatCount ?? 1;
              let completedPlays = 0;
              const playNext = () => { alertAudio.currentTime = 0; void alertAudio.play().then(() => setState("playing")).catch(() => { playbackRef.current = false; setState("error"); }); };
              alertAudio.onended = () => { completedPlays += 1; if (shouldContinuePresencePlayback({ completedPlays, repeatCount })) playNext(); else { alertAudio.onended = null; setState("played"); } };
              playNext();
            }
          }
        }
        if (!playbackRef.current) timerRef.current = window.setTimeout(inspectFrame, 450);
      };
      inspectFrame();
    } catch (cause) {
      stop();
      setError(cause instanceof Error && cause.name === "NotAllowedError" ? copy.error : copy.error);
      setState("error");
    }
  };

  const status = state === "preparing" ? copy.preparing : state === "present" ? copy.present : state === "playing" ? copy.playing : state === "played" ? copy.played : state === "ready" ? copy.ready : error;
  if (config.isLoading) return <MobileScreen><main className="grid min-h-[70dvh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.preparing} /></main></MobileScreen>;
  if (!config.data?.enabled || !config.data.soundUrl) return <MobileScreen><main className="lesoul-mobile-frame grid min-h-[70dvh] place-items-center px-6 text-center"><div><VolumeX className="mx-auto text-[#887a6c]" size={30} /><h1 className="mt-4 font-serif text-2xl text-[#29231e]">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#756b61]">{copy.disabled}</p></div></main></MobileScreen>;
  return <MobileScreen><main className="lesoul-mobile-frame px-5 pb-8 pt-6"><header className="text-center"><p className="text-[10px] font-bold tracking-[.18em] text-[#8a7968]">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-3xl text-[#28211c]">{copy.title}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746a60]">{copy.body}</p></header><section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#ded7ce] bg-[#1e1b18] shadow-[0_18px_36px_rgba(35,29,24,.14)]"><div className="relative aspect-[4/3] bg-[#24201d]"><video ref={videoRef} muted playsInline className={`size-full object-cover transition-opacity duration-300 ${state === "idle" || state === "error" || state === "playing" || state === "played" ? "opacity-0" : "opacity-100"}`} />{(state === "idle" || state === "preparing" || state === "error" || state === "playing" || state === "played") && <div className="absolute inset-0 grid place-items-center text-white"><div className="rounded-full bg-black/35 p-3 backdrop-blur-sm">{state === "preparing" ? <LoaderCircle className="animate-spin" size={22} /> : state === "playing" ? <Volume2 size={22} /> : <Camera size={22} />}</div></div>}</div><div className="p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#c2a27d]" size={18} /><p className="text-xs leading-5 text-[#eee8e0]">{copy.privacy}</p></div><p className="mt-3 text-[11px] text-[#bfb4a9]">{copy.gesture}</p>{status && <p className={`mt-3 flex items-center gap-2 text-xs ${state === "error" ? "text-[#ffb6a7]" : "text-[#f8f1e8]"}`}>{state === "error" ? <CircleAlert size={14} /> : <Volume2 size={14} />}{status}</p>}<button type="button" onClick={state === "idle" || state === "error" || state === "played" ? start : stop} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold tracking-[.08em] text-[#27211c] active:scale-[.98]">{state === "idle" || state === "error" || state === "played" ? <><Camera size={15} />{copy.start}</> : <><VolumeX size={15} />{copy.stop}</>}</button></div></section><audio ref={audioRef} preload="auto" src={config.data.soundUrl} /></main></MobileScreen>;
}
