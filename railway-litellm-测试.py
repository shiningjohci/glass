import openai # openai v1.0.0+
client = openai.OpenAI(api_key="anything",base_url="https://litellm-production-ec35.up.railway.app") # set proxy to base_url
# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="deepseek-chat", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)