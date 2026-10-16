import { useState, useRef, useCallback } from "react";

export type RecorderState = "idle" | "recording" | "processing";

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setAudioLevels(Array(20).fill(0));
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const levels = Array.from({ length: 20 }, (_, i) =>
          (data[Math.floor((i * data.length) / 20)] ?? 0) / 255,
        );
        setAudioLevels(levels);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start(100);
      setState("recording");
    } catch (err) {
      setError("Microphone access denied. Please allow mic access and try again.");
      setState("idle");
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ blob: Blob; durationSecs: number }> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return reject(new Error("no recorder"));

      stopAnimation();
      setState("processing");

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        resolve({ blob, durationSecs });
      };

      recorder.stop();
    });
  }, [stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setState("idle");
    setError(null);
  }, [stopAnimation]);

  return { state, error, audioLevels, startRecording, stopRecording, reset };
}
