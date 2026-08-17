import requests

def remesh_model(task_id: str, api_key: str, target_polycount: int = 50000):
    url = "https://api.meshy.ai/openapi/v1/remesh"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "input_task_id": task_id,
        "target_formats": ["glb", "fbx"],
        "topology": "quad",
        "target_polycount": target_polycount,
        "resize_height": 1.0,
        "origin_at": "bottom"
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    import os
    api_key = os.getenv("MESHY_API_KEY")
    task_id = "your_task_id_here"
    result = remesh_model(task_id, api_key)
    print("Remesh Result:", result)
