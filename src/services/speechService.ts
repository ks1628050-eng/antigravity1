// Speech synthesis and recognition service for Kedar AI

export const speechService = {
  speak: (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // stop previous speech
    
    // Clean text of markdown characters for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+/g, '')
      .replace(/[*_~[\]]/g, '')
      .replace(/\(http[^)]+\)/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeaking: (): boolean => {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  },

  createSpeechRecognizer: (
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Speech recognition is not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }
};
