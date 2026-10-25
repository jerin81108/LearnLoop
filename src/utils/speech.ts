/**
 * Web Speech API & SpeechSynthesis Utilities
 * Handles voice recognition with interim/final transcripts and robust browser capability checks.
 */

export interface SpeechRecognitionCallbacks {
  onTranscript: (interim: string, finalized: string) => void;
  onError: (errorType: string, message: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private finalTranscript: string = '';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public start(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.recognition) {
      callbacks.onError(
        'not-supported',
        'Web Speech API is not supported in this browser. Please use the text input option.'
      );
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.finalTranscript = '';
    this.isListening = true;

    this.recognition.onstart = () => {
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript += (this.finalTranscript ? ' ' : '') + transcript;
        } else {
          interim += transcript;
        }
      }
      callbacks.onTranscript(interim, this.finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      let userFriendlyMessage = 'Speech recognition error occurred.';
      switch (event.error) {
        case 'not-allowed':
          userFriendlyMessage =
            'Microphone access was denied. Please allow microphone permissions in your browser address bar.';
          break;
        case 'no-speech':
          userFriendlyMessage = 'No speech was detected. Please verify your microphone is plugged in.';
          break;
        case 'network':
          userFriendlyMessage =
            'Network issue contacting speech service. You can type your response instead.';
          break;
        case 'audio-capture':
          userFriendlyMessage = 'Audio capture hardware unavailable. Check your microphone device.';
          break;
        default:
          userFriendlyMessage = `Recognition issue: ${event.error}. You can enter text below.`;
      }
      this.isListening = false;
      callbacks.onError(event.error, userFriendlyMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      callbacks.onError('start-failed', e.message || 'Failed to start speech listener');
      this.isListening = false;
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
      this.isListening = false;
    }
  }

  public getFinalTranscript(): string {
    return this.finalTranscript;
  }
}

/**
 * Text-to-Speech Synthesizer
 */
export class TextToSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }
}

export const speechRecognizer = new SpeechRecognitionManager();
export const speechSynthesizer = new TextToSpeechManager();
