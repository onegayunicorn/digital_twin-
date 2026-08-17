import requests

def text_to_3d(prompt: str, api_key: str, art_style: str = "realistic"):
    url = "https://api.meshy.ai/openapi/v2/text-to-3d"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "mode": "preview",
        "prompt": prompt,
        "art_style": art_style,
        "should_remesh": True
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    import os
    api_key = os.getenv("MESHY_API_KEY")
    result = text_to_3d("a fantasy warrior with sword and shield", api_key)
    print("Text-to-3D Result:", result)
