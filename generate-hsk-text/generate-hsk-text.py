from openai import OpenAI
import csv

# TODO: move to different file later; !! PLEASE USE YOUR OWN API KEY FOR TESTING !!
client = OpenAI(api_key="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")

def get_hsk_words_from_csv(csv_file, hsk_level):
    hsk_words = []
    try:
        with open(csv_file, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if int(row["hsk"]) == hsk_level:
                    hsk_words.append(row["simplified"])
    except Exception as e:
        print(f"Error loading CSV: {e}")
    return hsk_words

def generate_conversation_starters(hsk_level, topic, csv_file='filtered-zerotohero-zh-vocabulary.csv'):
    # Generates sentence completions using GPT with HSK-restricted vocabulary.
    hsk_words = get_hsk_words_from_csv(csv_file, hsk_level)
    if not hsk_words:
        return ["No words available for this HSK level."]
    
    # Use the first 50 words to guide GPT
    words_hint = ", ".join(hsk_words[:50])

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"""Use only words appropriate for HSK {hsk_level} learners: {words_hint}. 
            Adjust sentence complexity based on HSK level:
            - HSK 1-2: Use very simple, short sentences (e.g., Subject + Verb + Object). Avoid complex grammar.  
            - HSK 3-4: Use moderate complexity, including conjunctions and short compound sentences.  
            - HSK 5-6: Use more advanced grammar, such as relative clauses, idiomatic expressions, and formal structures.  
            Ensure the sentences fit the topic "{topic}" and are suitable for an HSK {hsk_level} learner.  
            Generate exactly three sentences that serve as different, natural conversation starters."""},  
            {"role": "user", "content": f"""Generate three conversation starters related to "{topic}" 
            for an HSK {hsk_level} learner."""}  
        ]
    )

    return response.choices[0].message.content


def complete_sentence(user_input, hsk_level, topic, csv_file='filtered-zerotohero-zh-vocabulary.csv'):
    # Generates sentence completions using GPT with HSK-restricted vocabulary.
    hsk_words = get_hsk_words_from_csv(csv_file, hsk_level)
    if not hsk_words:
        return "No words available for this HSK level."
    
    # Format HSK words as a guideline for GPT
    words_hint = ", ".join(hsk_words[:50])  # Use first 50 words to keep prompt short

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"""Use only words appropriate for HSK {hsk_level} learners: {words_hint}. 
            Adjust sentence complexity based on HSK level:  
            - For HSK 1-2: Use very simple, short sentences (Subject + Verb + Object). No extra details, explanations, or second clauses. 
            - For HSK 3-4: Use moderate complexity, including conjunctions and short compound sentences.  
            - For HSK 5-6: Use more advanced grammar, such as relative clauses, idiomatic expressions, and formal structures.  
            Ensure the sentences fit the topic {topic}, which is suitable for HSK {hsk_level} learners.
            Generate exactly three complete sentences, ensuring each one starts with the given input. Commas are allowed, but do not generate extra sentences or explanations."""},  
            {"role": "user", "content": f"""Complete this sentence naturally by generating exactly three different, contextually appropriate continuations. 
            Ensure the output maintains the given input at the start: {user_input}"""}  
        ]
    )

    return response.choices[0].message.content

# Example Usage
user_input = "我要吃..."
hsk_level = 3
topic = 'food & drinks'

completed_sentences = complete_sentence(user_input, hsk_level, topic)
print(completed_sentences)

conversation_starters = generate_conversation_starters(hsk_level, topic)
print(conversation_starters)