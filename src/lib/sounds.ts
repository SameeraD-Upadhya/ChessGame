export const SOUNDS = {
  move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
  gameEnd: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
  notify: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/notify.mp3',
};

class SoundManager {
  private audios: Record<string, HTMLAudioElement> = {};

  constructor() {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      this.audios[key] = new Audio(url);
    });
  }

  play(sound: keyof typeof SOUNDS) {
    const audio = this.audios[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Sound play failed", e));
    }
  }
}

export const soundManager = new SoundManager();
