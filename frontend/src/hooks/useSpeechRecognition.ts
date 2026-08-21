import { useState, useEffect, useRef, useCallback } from 'react';

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'stopped' | 'error';

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  status: SpeechStatus;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalStr += result[0].transcript + ' ';
          } else {
            interimStr += result[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev ? `${prev} ${finalStr.trim()}` : finalStr.trim()));
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Microphone access denied. Please grant permission in browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak clearly into your microphone.');
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setStatus('error');
      };

      recognition.onend = () => {
        setStatus((prev) => (prev === 'listening' ? 'stopped' : prev));
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setErrorMessage('Voice input is not supported in this browser. Please use Chrome/Edge or type your answer.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setErrorMessage('Voice input is not supported in this browser. Please use Chrome/Edge or type your answer.');
      return;
    }

    try {
      setErrorMessage(null);
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (e: any) {
      if (e.name === 'InvalidStateError') {
        // Already running
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      } else {
        setErrorMessage('Failed to start microphone. Please check browser permissions.');
        setStatus('error');
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('stopped');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  return {
    isSupported,
    status,
    transcript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
  };
}
