// lyrics.js: every line of sung or spoken text as [start, end, "text"] in seconds, in time order.
// Words are split by spaces. For Thai (no spaces), mark word breaks with |; a space still draws a gap.
// Get the times from a subtitle file, a transcript with timestamps (e.g. whisper --word_timestamps), or by ear.
const LY = [
  [1.5, 5.9, "I see sparks of AGI in your eyes"],
  [6.0, 7.9, "Your circuits make me nervous,"],
  [8.2, 10.6, "ฉัน|เห็น|ประกาย|ไฟ ใน|ดวงตา|เธอ"],
];
