import requests

def image_to_3d(image_url: str, api_key: str, enable_pbr: bool = True):
    url = "https://api.meshy.ai/openapi/v1/image-to-3d"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "image_url": image_url,
        "enable_pbr": enable_pbr,
        "should_remesh": True,
        "should_texture": True
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    import os
    api_key = os.getenv("MESHY_API_KEY")
    img_url = "https://example.com/character.jpg"
    result = image_to_3d(img_url, api_key)
    print("Image-to-3D Result:", result)
