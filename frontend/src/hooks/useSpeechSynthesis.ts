import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        if (synthRef.current) {
          const available = synthRef.current.getVoices();
          setVoices(available);
        }
      };

      updateVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text) return;

    synthRef.current.cancel(); // Stop current

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Professional cadence
    utterance.pitch = 1.0;

    // Pick professional english voice if available
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const preferredVoice = englishVoices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) || englishVoices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  }, [voices]);

  const pause = useCallback(() => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  return {
    isSupported,
    isPlaying,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    voices,
  };
}
