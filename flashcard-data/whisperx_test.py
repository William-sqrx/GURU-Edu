import whisperx

def transcribe_audio(audio_file):
    device = "cpu" 
    # audio_file = "test.mp3"
    batch_size = 16 # reduce if low on GPU mem
    compute_type = "int8" # change to "int8" if low on GPU mem (may reduce accuracy)

    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model("large-v2", device, compute_type=compute_type)

    # save model to local path (optional)
    # model_dir = "/path/"
    # model = whisperx.load_model("large-v2", device, compute_type=compute_type, download_root=model_dir)

    audio = whisperx.load_audio(audio_file)
    result1 = model.transcribe(audio, language="en" ,batch_size=batch_size)
    # print(result1["segments"]) # before alignment

    # delete model if low on GPU resources
    # import gc; gc.collect(); torch.cuda.empty_cache(); del model

    # 2. Align whisper output
    model_a, metadata = whisperx.load_align_model(language_code=result1["language"], device=device)
    result1 = whisperx.align(result1["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    # print(result1["segments"]) # after alignment

    # delete model if low on GPU resources
    # import gc; gc.collect(); torch.cuda.empty_cache(); del model_a

    # 3. Assign speaker labels
    diarize_model = whisperx.DiarizationPipeline(use_auth_token="", device=device)

    # add min/max number of speakers if known
    diarize_segments = diarize_model(audio)
    # diarize_model(audio, min_speakers=min_speakers, max_speakers=max_speakers)

    result1 = whisperx.assign_word_speakers(diarize_segments, result1)
    # print(diarize_segments)
    # print(result1["segments"]) # segments are now assigned speaker IDs

    combined_text = " ".join(item['text'].strip() for item in result1["segments"])
    print(combined_text)
    # translated_text = translator.translate(combined_text, src="en", dest="id").text
    # print(translated_text)
    return(combined_text)

