import requests

def ai_texture(model_url: str, object_prompt: str, style_prompt: str, api_key: str):
    url = "https://api.meshy.ai/openapi/v1/retexture"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model_url": model_url,
        "object_prompt": object_prompt,
        "style_prompt": style_prompt,
        "enable_original_uv": True,
        "enable_pbr": True,
        "resolution": "1024",
        "negative_prompt": "low quality, blurry",
        "art_style": "realistic"
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    import os
    api_key = os.getenv("MESHY_API_KEY")
    model_url = "https://example.com/model.glb"
    result = ai_texture(model_url, "cyberpunk android", "metal, neon lights, scratches", api_key)
    print("AI Texturing Result:", result)
