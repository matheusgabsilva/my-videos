#!/usr/bin/env python3
"""
Script utilitário para síntese de voz neural (ElevenLabs / Edge-TTS) e legendas VTT.
Configurado para automação de pipeline de áudio no Remotion.
"""

import argparse
import asyncio
import base64
import os
import re
import sys
import requests
import dotenv

# Carrega variáveis do arquivo .env
dotenv.load_dotenv()

DEFAULT_TEXT = "Peguei um bug cabuloso no sistema e o build quebrou... Mas analisei o código com calma, achei a solução e mandei direto pra produção!"
DEFAULT_OUT_AUDIO = os.path.join("public", "audio", "narracao.mp3")
DEFAULT_OUT_VTT = os.path.join("public", "audio", "narracao.vtt")

# Configurações ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_DEFAULT_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
ELEVENLABS_FALLBACK_PREMADE_VOICE = "TX3LPaxmHKxFdv7VOQHJ"  # Liam (premade, compatível com conta Free)
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"

# Configurações Edge-TTS
EDGE_DEFAULT_VOICE = "pt-BR-AntonioNeural"


def format_vtt_timestamp(seconds: float) -> str:
    """Formata segundos para o padrão WebVTT: HH:MM:SS.mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"


def srt_to_vtt(srt_text: str) -> str:
    """Converte conteúdo SRT para WebVTT."""
    vtt_body = re.sub(
        r"(\d{2}:\d{2}:\d{2}),(\d{3})",
        r"\1.\2",
        srt_text,
    )
    return f"WEBVTT\n\n{vtt_body.strip()}\n"


def alignment_to_vtt(alignment: dict) -> str:
    """Converte o alinhamento de caracteres do ElevenLabs em legendas WebVTT."""
    characters = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])

    cues = []
    current_chars = []
    cue_start = None
    cue_end = None

    for i, ch in enumerate(characters):
        st = starts[i]
        et = ends[i]

        if cue_start is None and ch.strip():
            cue_start = st

        current_chars.append(ch)
        cue_end = et

        is_break = False
        # Quebra por pontuações de final de frase
        if ch in (".", "!", "?") and i + 1 < len(characters) and characters[i + 1] == " ":
            is_break = True
        elif i == len(characters) - 1:
            is_break = True

        if is_break and current_chars:
            text = "".join(current_chars).strip()
            if text and cue_start is not None and cue_end is not None:
                cues.append((cue_start, cue_end, text))
            current_chars = []
            cue_start = None

    vtt_lines = ["WEBVTT", ""]
    for idx, (s, e, txt) in enumerate(cues, 1):
        vtt_lines.append(str(idx))
        vtt_lines.append(f"{format_vtt_timestamp(s)} --> {format_vtt_timestamp(e)}")
        vtt_lines.append(txt)
        vtt_lines.append("")

    return "\n".join(vtt_lines)


async def generate_speech_edge_tts(
    text: str,
    voice: str,
    rate: str,
    pitch: str,
    out_audio: str,
    out_vtt: str | None = None,
) -> None:
    """Gera áudio usando edge-tts."""
    import edge_tts

    os.makedirs(os.path.dirname(os.path.abspath(out_audio)), exist_ok=True)
    if out_vtt:
        os.makedirs(os.path.dirname(os.path.abspath(out_vtt)), exist_ok=True)

    print(f"[Edge-TTS] Sintetizando voz: {voice}")
    print(f"[Edge-TTS] Texto: \"{text}\"")

    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch)
    submaker = edge_tts.SubMaker()

    with open(out_audio, "wb") as audio_file:
        async for chunk in communicate.stream():
            chunk_type = chunk.get("type")
            if chunk_type == "audio":
                audio_file.write(chunk["data"])
            elif chunk_type in ("WordBoundary", "SentenceBoundary"):
                submaker.feed(chunk)

    audio_size = os.path.getsize(out_audio)
    print(f"[Edge-TTS] Áudio gerado: {audio_size:,} bytes em {out_audio}")

    if out_vtt:
        srt_content = submaker.get_srt()
        vtt_content = srt_to_vtt(srt_content)
        with open(out_vtt, "w", encoding="utf-8") as vtt_file:
            vtt_file.write(vtt_content)
        print(f"[Edge-TTS] Legenda VTT gerada: {out_vtt}")


def generate_speech_elevenlabs(
    text: str,
    voice_id: str,
    api_key: str,
    out_audio: str,
    out_vtt: str | None = None,
) -> bool:
    """Gera áudio usando ElevenLabs API (com fallback de voz premade se necessário)."""
    os.makedirs(os.path.dirname(os.path.abspath(out_audio)), exist_ok=True)
    if out_vtt:
        os.makedirs(os.path.dirname(os.path.abspath(out_vtt)), exist_ok=True)

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": ELEVENLABS_MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.06,
            "use_speaker_boost": True,
        },
    }

    def call_api(target_voice: str):
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{target_voice}/with-timestamps"
        resp = requests.post(url, headers=headers, json=payload, timeout=45)
        if resp.status_code == 200:
            return resp, True
        # Tenta endpoint padrão se with-timestamps não estiver disponível
        url_plain = f"https://api.elevenlabs.io/v1/text-to-speech/{target_voice}"
        resp_plain = requests.post(url_plain, headers=headers, json=payload, timeout=45)
        return resp_plain, False

    print(f"[ElevenLabs] Solicitando síntese com modelo '{ELEVENLABS_MODEL_ID}' e voz: {voice_id}")
    resp, has_timestamps = call_api(voice_id)

    # Se a voz configurada for de biblioteca e a conta for Free, tenta a voz premade
    if resp.status_code == 402 and "library voices" in resp.text:
        print(f"[ElevenLabs Aviso] A voz '{voice_id}' requer plano pago no ElevenLabs.")
        print(f"[ElevenLabs Info] Alternando automaticamente para voz premade '{ELEVENLABS_FALLBACK_PREMADE_VOICE}'...")
        resp, has_timestamps = call_api(ELEVENLABS_FALLBACK_PREMADE_VOICE)

    if resp.status_code != 200:
        print(f"[ElevenLabs Erro] Falha na requisição (Status {resp.status_code}): {resp.text}", file=sys.stderr)
        return False

    if has_timestamps:
        data = resp.json()
        audio_bytes = base64.b64decode(data["audio_base64"])
        with open(out_audio, "wb") as f:
            f.write(audio_bytes)

        if out_vtt and "alignment" in data:
            vtt_content = alignment_to_vtt(data["alignment"])
            with open(out_vtt, "w", encoding="utf-8") as f:
                f.write(vtt_content)
            print(f"[ElevenLabs] Legenda VTT precisa gerada: {out_vtt}")
    else:
        with open(out_audio, "wb") as f:
            f.write(resp.content)
        print("[ElevenLabs] Áudio salvo via endpoint direto de streaming.")

    audio_size = os.path.getsize(out_audio)
    print(f"[ElevenLabs] Áudio gerado com sucesso: {audio_size:,} bytes em {out_audio}")
    return True


def parse_args():
    # Define o motor padrão: elevenlabs se a API key estiver presente, senão edge-tts
    default_engine = "elevenlabs" if ELEVENLABS_API_KEY else "edge-tts"

    parser = argparse.ArgumentParser(
        description="Geração de narração neural (ElevenLabs / Edge-TTS) para o Remotion."
    )
    parser.add_argument(
        "--engine",
        "-e",
        choices=["elevenlabs", "edge-tts"],
        default=default_engine,
        help=f"Motor de síntese TTS (padrão: '{default_engine}')",
    )
    parser.add_argument(
        "--text",
        "-t",
        default=DEFAULT_TEXT,
        help=f"Texto da narração (padrão: '{DEFAULT_TEXT}')",
    )
    parser.add_argument(
        "--voice",
        "-v",
        default=None,
        help="ID da voz (Voice ID para ElevenLabs ou Voice Name para Edge-TTS)",
    )
    parser.add_argument(
        "--rate",
        default="+0%",
        help="Taxa de velocidade (Edge-TTS)",
    )
    parser.add_argument(
        "--pitch",
        default="+0Hz",
        help="Ajuste de tom (Edge-TTS)",
    )
    parser.add_argument(
        "--out",
        "-o",
        default=DEFAULT_OUT_AUDIO,
        help=f"Caminho do arquivo MP3 de saída (padrão: '{DEFAULT_OUT_AUDIO}')",
    )
    parser.add_argument(
        "--vtt",
        default=DEFAULT_OUT_VTT,
        help=f"Caminho do arquivo VTT de saída (padrão: '{DEFAULT_OUT_VTT}')",
    )
    parser.add_argument(
        "--no-vtt",
        action="store_true",
        help="Desativa a geração do arquivo de legendas VTT",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    out_vtt = None if args.no_vtt else args.vtt

    if args.engine == "elevenlabs":
        api_key = ELEVENLABS_API_KEY
        if not api_key:
            print("[Aviso] ELEVENLABS_API_KEY não encontrada no .env. Realizando fallback para Edge-TTS...", file=sys.stderr)
            asyncio.run(
                generate_speech_edge_tts(
                    text=args.text,
                    voice=args.voice or EDGE_DEFAULT_VOICE,
                    rate=args.rate,
                    pitch=args.pitch,
                    out_audio=args.out,
                    out_vtt=out_vtt,
                )
            )
            return

        voice_id = args.voice or ELEVENLABS_DEFAULT_VOICE_ID
        success = generate_speech_elevenlabs(
            text=args.text,
            voice_id=voice_id,
            api_key=api_key,
            out_audio=args.out,
            out_vtt=out_vtt,
        )

        if not success:
            print("[Aviso] Chamada ao ElevenLabs falhou. Realizando fallback automático para Edge-TTS...", file=sys.stderr)
            asyncio.run(
                generate_speech_edge_tts(
                    text=args.text,
                    voice=EDGE_DEFAULT_VOICE,
                    rate=args.rate,
                    pitch=args.pitch,
                    out_audio=args.out,
                    out_vtt=out_vtt,
                )
            )
    else:
        voice = args.voice or EDGE_DEFAULT_VOICE
        asyncio.run(
            generate_speech_edge_tts(
                text=args.text,
                voice=voice,
                rate=args.rate,
                pitch=args.pitch,
                out_audio=args.out,
                out_vtt=out_vtt,
            )
        )


if __name__ == "__main__":
    main()
