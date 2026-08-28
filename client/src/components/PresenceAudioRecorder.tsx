import { CircleAlert, LoaderCircle, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = { disabled?: boolean; onRecorded: (dataUrl: string) => void };

export default function PresenceAudioRecorder({ disabled = false, onRecorded }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { record: "마이크로 녹음", stop: "녹음 종료", preparing: "마이크 준비 중…", recording: "녹음 중", processing: "녹음 저장 준비 중…", help: "브라우저에서 마이크를 허용하면 녹음 파일이 알림음으로 업로드됩니다.", unsupported: "이 브라우저는 녹음을 지원하지 않습니다.", error: "마이크 녹음을 시작할 수 없습니다. 권한을 확인해 주세요." }
    : locale === "zh"
      ? { record: "麦克风录音", stop: "结束录音", preparing: "正在准备麦克风…", recording: "正在录音", processing: "正在准备保存录音…", help: "允许浏览器使用麦克风后，录音文件将上传为提示音。", unsupported: "此浏览器不支持录音。", error: "无法开始麦克风录音。请检查权限。" }
      : { record: "Record with microphone", stop: "Stop recording", preparing: "Preparing microphone…", recording: "Recording", processing: "Preparing recording…", help: "After you allow microphone access, the recording is uploaded as the alert sound.", unsupported: "This browser does not support recording.", error: "Microphone recording could not start. Check permission." };
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [state, setState] = useState<"idle" | "preparing" | "recording" | "processing" | "error">("idle");
  const [message, setMessage] = useState("");

  const stopTracks = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  useEffect(() => () => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); stopTracks(); }, []);

  const start = async () => {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) { setMessage(copy.unsupported); setState("error"); return; }
    setMessage(""); setState("preparing"); chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        setState("processing");
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stopTracks();
        if (!blob.size) { setMessage(copy.error); setState("error"); return; }
        const reader = new FileReader();
        reader.onload = () => { onRecorded(String(reader.result)); setState("idle"); };
        reader.onerror = () => { setMessage(copy.error); setState("error"); };
        reader.readAsDataURL(blob);
      };
      recorder.start(); setState("recording");
    } catch {
      stopTracks(); setMessage(copy.error); setState("error");
    }
  };
  const stop = () => recorderRef.current?.state === "recording" && recorderRef.current.stop();
  const busy = state === "preparing" || state === "processing";
  return <div className="flex min-w-0 flex-1 flex-col gap-2"><button type="button" onClick={state === "recording" ? stop : start} disabled={disabled || busy} className={`inline-flex h-10 w-fit items-center gap-2 rounded-full border px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${state === "recording" ? "border-[#9d3d31] bg-[#9d3d31] text-white" : "border-[#d2c7ba] bg-white text-[#4f4338]"}`}>{busy ? <LoaderCircle className="animate-spin" size={14} /> : state === "recording" ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}{state === "preparing" ? copy.preparing : state === "processing" ? copy.processing : state === "recording" ? copy.stop : copy.record}</button>{state === "recording" && <p className="text-[11px] font-semibold text-[#9d3d31]">{copy.recording}</p>}{message && <p className="flex items-center gap-1 text-[11px] text-[#9d3d31]"><CircleAlert size={12} />{message}</p>}{state === "idle" && <p className="text-[10px] leading-4 text-[#8b7c6e]">{copy.help}</p>}</div>;
}
