"""Synthesizes speech from the input string of text or ssml.
Make sure to be working in a virtual environment.

Note: ssml must be well-formed according to:
    https://www.w3.org/TR/speech-synthesis/
"""
import argparse
import os
import re
from pathlib import Path

import pysrt
from google.api_core.client_options import ClientOptions
from google.cloud import texttospeech


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create MP3 speech files for each subtitle entry in an SRT file."
    )
    parser.add_argument(
        "srt_file",
        nargs="?",
        default="captionFile_hi.srt",
        help="Path to the SRT file to synthesize. Defaults to captionFile_hi.srt.",
    )
    parser.add_argument(
        "language_code",
        nargs="?",
        default="hi-IN",
        help="Google Text-to-Speech language code. Defaults to hi-IN.",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("GOOGLE_API_KEY"),
        help="Google API key. Can also be provided with the GOOGLE_API_KEY environment variable.",
    )
    return parser.parse_args()


def clean_subtitle_text(text):
    text = re.sub(r"\[cite_start\]", "", text)
    text = re.sub(r"\[cite:\s*\d+(?:\s*,\s*\d+)*\]", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+\n", "\n", text)
    text = re.sub(r"\n\s+", "\n", text)
    return text.strip()


args = parse_args()
srt_file = Path(args.srt_file)
language_code = args.language_code
output_dir = Path(language_code)
output_dir.mkdir(parents=True, exist_ok=True)

# Instantiates a client
if args.api_key:
    client = texttospeech.TextToSpeechClient(
        client_options=ClientOptions(api_key=args.api_key)
    )
else:
    client = texttospeech.TextToSpeechClient()

subs = pysrt.open(str(srt_file))

for sub in subs:
    
# Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=clean_subtitle_text(sub.text))

# Build the voice request, select the language code ("en-US") and the ssml
# voice gender ("neutral")
    voice = texttospeech.VoiceSelectionParams(language_code=language_code, ssml_gender=texttospeech.SsmlVoiceGender.FEMALE)

# Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig( audio_encoding=texttospeech.AudioEncoding.MP3)

# Perform the text-to-speech request on the text input with the selected
# voice parameters and audio file type
    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

# The response's audio_content is binary.
    output_file = output_dir / f"{sub.index}.mp3"
    with open(output_file, "wb") as out:
    # Write the response to the output file.
        out.write(response.audio_content)
        print(f"Audio content written to {output_file}")
