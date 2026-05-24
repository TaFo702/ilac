export const getCurrentTime = () => {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const parseTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return d;
};

export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    // Turkish lowercase to prevent spelling out uppercase as acronyms
    // Also remove dashes and extra spaces which can confuse some TTS engines
    const processedText = text
      .toLocaleLowerCase('tr-TR')
      .replace(/-/g, ' ')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9; // Slightly slower for elderly
    window.speechSynthesis.speak(utterance);
  }
};
