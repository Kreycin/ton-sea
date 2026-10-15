"""English dialogue for Ton and Mai with Gemini 3.8 Flash TTS on Vertex (same route as kreycin-production/scripts/tts.py).

usage: python3 -I scripts/tts_dialog.py <lines.json> <outdir>
lines.json: {"key": {"voice": "Umbriel", "text": "...", "style": "..."}, ...}   (voice: a Gemini prebuilt voice name)
Writes <outdir>/<key>.wav (raw, never overwrites). Auth: `gcloud auth login`; the GCP project comes from $GCP_PROJECT,
or else from `gcloud config get-value project` (Vertex AI API enabled).
"""
import json, os, sys, base64, subprocess, urllib.request

P = os.environ.get("GCP_PROJECT") or subprocess.check_output(["gcloud", "config", "get-value", "project"]).decode().strip()
STYLE = "soft, warm and natural, a quiet conversation in a small seaside cafe on a rainy day; unhurried, never theatrical"
URL = f"https://aiplatform.googleapis.com/v1/projects/{P}/locations/global/publishers/google/models/gemini-3.8-flash-tts:generateContent"
lines = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
tok = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
os.makedirs(outdir, exist_ok=True)
tin = tout = 0
for key, ln in lines.items():
    out = f"{outdir}/{key}.wav"
    if os.path.exists(out):
        print("skip (exists)", out)
        continue
    vc = {"prebuiltVoiceConfig": {"voiceName": ln["voice"]}}
    body = {"contents": [{"role": "user", "parts": [{"text": ln["text"], "speechMetadata": {"style": ln.get("style", STYLE)}}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": vc}}}
    req = urllib.request.Request(URL, json.dumps(body).encode(),
                                 {"Authorization": "Bearer " + tok, "x-goog-user-project": P, "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print("FAIL", key, e.code, e.read().decode()[:300])
        continue
    u = r.get("usageMetadata", {}); tin += u.get("promptTokenCount", 0); tout += u.get("candidatesTokenCount", 0)
    d = r["candidates"][0]["content"]["parts"][0]["inlineData"]
    data = base64.b64decode(d["data"])
    if "wav" not in d["mimeType"]:                       # raw PCM (audio/L16;rate=24000): wrap it as a wav
        p = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-", out], input=data)
        assert p.returncode == 0, d["mimeType"]
    else:
        open(out, "xb").write(data)
    print("wrote", out)
# Flash TTS promo price until 2026-12-31: $0.50 / $9.00 per 1M tokens (in/out); doubles from 2027-01-01.
print("tokens in", tin, "out", tout, "cost $%.4f" % (tin * 0.5e-6 + tout * 9e-6))
