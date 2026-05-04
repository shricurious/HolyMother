# HolyMother

Language subtitle review and translated audio playback app.

## Run

```powershell
npm start
```

Then open:

```text
http://localhost:3000/
```

## Included Languages

- English subtitles
- Hindi subtitles and generated audio
- Russian subtitles and generated audio

## Generate Audio

The audio generation helper is in `speech/textToSpeech.py`.

```powershell
cd speech
python textToSpeech.py ..\captionFile_ru-RU.srt ru-RU --api-key "<GOOGLE_API_KEY>"
```
