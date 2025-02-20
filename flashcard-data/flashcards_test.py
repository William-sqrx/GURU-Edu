from openai import OpenAI
from whisperx_test import transcribe_audio
import json
import re

def create_flashcards(transcript):
    client = OpenAI(api_key="")

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": "Extract and explain Chinese words from this text with only explanations \
                    based on the context of this transcript: " + transcript + 
                    "Additionally, try to discard the words with their explanation that is incomplete \
                    or does not make sense from the text provided. \
                    Furthermore, try to map it so that I will be extract it using Python and put into chinese text, english text \
                    and its extracted explanation. Put your answer in a JSON Format with 'chinese', 'english', and 'explanation' as its content. \
                    In 'chinese', can you put both Chinese characters and Romanization system for Standard Mandarin Chinese. \
                    Additionally, can you make the format for chinese is similar to '捐赠, juān zèng' \
                    Also, make the explanation in both english and chinese. Additionally, can you refine the explanations and not just copy paste the explanations in the audio."
            }
        ]
    )

    print(completion.choices[0].message.content)
    api_response = completion.choices[0].message.content

    # Use regex to extract the JSON-like content
    match = re.search(r'\[.*\]', api_response, re.DOTALL)
    if match:
        json_data = match.group(0)  # Extract JSON part
        extracted_data = json.loads(json_data)  # Convert to Python dictionary
        print(extracted_data)
        return extracted_data
    else:
        print("No valid JSON data found!")

if __name__ == "__main__":
    transcript = transcribe_audio("30min_advanced.mp3")
    extracted_data = create_flashcards(transcript)

    for entry in extracted_data:
        print(f"Chinese: {entry['chinese']}\nEnglish: {entry['english']}\nExplanation: {entry['explanation']}\n")