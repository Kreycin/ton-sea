// render_music.swift: renders a score JSON (from scripts/score.mjs) with the macOS built-in General MIDI bank
// (gs_instruments.dls) through one AVAudioUnitSampler per part, offline (manual rendering), into a 48 kHz stereo wav.
// Usage: SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk swift scripts/render_music.swift out/music/score.json out/music/music.wav
// (SDKROOT: the Command Line Tools' Swift 6.3 cannot build against the newer default SDK)
// Score: { duration, reverb (wet %), parts: [{ program, gain (dB) }], events: [{ t, ch, n, v, d } | { t, ch, cc, val }] }
import AVFoundation

struct Ev: Codable { let t: Double; let ch: Int; let n: Int?; let v: Int?; let d: Double?; let cc: Int?; let val: Int? }
struct Part: Codable { let program: Int; let gain: Float }
struct Score: Codable { let duration: Double; let reverb: Float; let parts: [Part]; let events: [Ev] }

let args = CommandLine.arguments
let score = try JSONDecoder().decode(Score.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let dls = URL(fileURLWithPath: "/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls")
let sr = 48000.0, block: AVAudioFrameCount = 256
let fmt = AVAudioFormat(standardFormatWithSampleRate: sr, channels: 2)!

let engine = AVAudioEngine()
let bus = AVAudioMixerNode(), reverb = AVAudioUnitReverb()
engine.attach(bus); engine.attach(reverb)
reverb.loadFactoryPreset(.largeHall)
reverb.wetDryMix = score.reverb
var samplers: [AVAudioUnitSampler] = []
for _ in score.parts {
  let s = AVAudioUnitSampler()
  engine.attach(s)
  engine.connect(s, to: bus, fromBus: 0, toBus: bus.nextAvailableInputBus, format: fmt)
  samplers.append(s)
}
engine.connect(bus, to: reverb, format: fmt)
engine.connect(reverb, to: engine.mainMixerNode, format: fmt)
try engine.enableManualRenderingMode(.offline, format: fmt, maximumFrameCount: block)
for (i, p) in score.parts.enumerated() {
  try samplers[i].loadSoundBankInstrument(at: dls, program: UInt8(p.program), bankMSB: UInt8(kAUSampler_DefaultMelodicBankMSB), bankLSB: 0)
  samplers[i].overallGain = p.gain
}
try engine.start()

// flatten to (frame, kind 0 off / 1 on / 2 cc, part, a, b); offs sort before ons on the same frame
var evs: [(Int, Int, Int, Int, Int)] = []
for e in score.events {
  let f = Int(e.t * sr)
  if let n = e.n { evs.append((f, 1, e.ch, n, e.v ?? 64)); evs.append((Int((e.t + (e.d ?? 0.5)) * sr), 0, e.ch, n, 0)) }
  else if let cc = e.cc { evs.append((f, 2, e.ch, cc, e.val ?? 0)) }
}
evs.sort { $0.0 != $1.0 ? $0.0 < $1.0 : $0.1 < $1.1 }
var held = [Int: Int]()                                  // overlapping notes of one pitch: restart, release on the last off

let out = try AVAudioFile(forWriting: URL(fileURLWithPath: args[2]),
  settings: [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: sr, AVNumberOfChannelsKey: 2, AVLinearPCMBitDepthKey: 24, AVLinearPCMIsFloatKey: false])
let buf = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat, frameCapacity: block)!
let total = AVAudioFramePosition(score.duration * sr)
var i = 0
while engine.manualRenderingSampleTime < total {
  let now = Int(engine.manualRenderingSampleTime), n = AVAudioFrameCount(min(Int64(block), total - engine.manualRenderingSampleTime))
  while i < evs.count && evs[i].0 < now + Int(n) {
    let (_, k, ch, a, b) = evs[i], s = samplers[ch], key = ch * 128 + a
    if k == 1 { if (held[key] ?? 0) > 0 { s.stopNote(UInt8(a), onChannel: 0) }; held[key, default: 0] += 1; s.startNote(UInt8(a), withVelocity: UInt8(max(1, min(127, b))), onChannel: 0) }
    else if k == 0 { held[key, default: 1] -= 1; if held[key]! <= 0 { s.stopNote(UInt8(a), onChannel: 0) } }
    else { s.sendController(UInt8(a), withValue: UInt8(max(0, min(127, b))), onChannel: 0) }
    i += 1
  }
  guard try engine.renderOffline(n, to: buf) == .success else { fatalError("render failed at \(now)") }
  try out.write(from: buf)
}
print("wrote \(args[2])  \(score.events.count) events, \(score.duration) s")
