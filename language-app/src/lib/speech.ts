// Nghe (đọc văn bản) và nói (nhận giọng nói) bằng API có sẵn của trình duyệt, không tốn phí.
// Nhận giọng nói chạy tốt nhất trên Chrome/Edge/Safari; Firefox chưa hỗ trợ.

export function speak(text: string, locale: string, rate = 0.9): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(locale.slice(0, 2)));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function canRecognizeSpeech(): boolean {
  return typeof window !== 'undefined' && recognitionCtor() !== undefined;
}

export interface Listener {
  stop(): void;
}

/** Bắt đầu ghi âm; onTranscript nhận toàn bộ bản ghi (kể cả phần chưa chốt) mỗi lần cập nhật. */
export function listen(
  locale: string,
  onTranscript: (text: string) => void,
  onEnd: (error?: string) => void,
): Listener | undefined {
  const Ctor = recognitionCtor();
  if (!Ctor) return undefined;
  const rec = new Ctor();
  rec.lang = locale;
  rec.continuous = true;
  rec.interimResults = true;
  let error: string | undefined;
  rec.onresult = (e) => {
    const text = Array.from(e.results)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ');
    onTranscript(text.trim());
  };
  rec.onerror = (e) => {
    error = e.error === 'not-allowed' ? 'Chưa cấp quyền micro' : e.error;
  };
  rec.onend = () => onEnd(error);
  rec.start();
  return { stop: () => rec.stop() };
}
