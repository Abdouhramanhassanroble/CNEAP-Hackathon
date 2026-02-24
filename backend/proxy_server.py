from fastapi import FastAPI, HTTPException, Request
import requests
import json
import os
import time
import uuid
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent
env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT.parent / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / "env.template"
load_dotenv(env_path)

# Configuration depuis les variables d'environnement
AZURE_KEY = os.getenv("GPT_API_KEY") or os.getenv("API_KEY")  # compatibilité rétro
AZURE_ENDPOINT = "https://apigatewayinnovation.azure-api.net/openai-api"
DEPLOYMENT_CHAT = "gpt-4o"  # Nom du déploiement chat
DEPLOYMENT_EMBEDDING = "text-embedding-ada-002"  # Nom du déploiement embedding
API_VERSION = "2024-02-01"

if not AZURE_KEY:
    raise ValueError("❌ Variable d'environnement GPT_API_KEY ou API_KEY manquante !")

app = FastAPI()
_assistants_store = {}



@app.get("/v1/models")
async def list_models():
    """Expose available model IDs so OpenAI-compatible clients can introspect."""
    return {
        "object": "list",
        "data": [
            {
                "id": DEPLOYMENT_CHAT,
                "object": "model",
                "created": 0,
                "owned_by": "azure-openai",
            },
            {
                "id": DEPLOYMENT_EMBEDDING,
                "object": "model",
                "created": 0,
                "owned_by": "azure-openai",
            },
            {
                "id": "gpt-4",
                "object": "model",
                "created": 0,
                "owned_by": "azure-openai",
            },
            {
                "id": "gpt-3.5-turbo",
                "object": "model",
                "created": 0,
                "owned_by": "azure-openai",
            },
        ],
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok", "service": "openai-proxy"}


@app.post("/v1/assistants")
async def create_assistant(request: Request):
    """Return a minimal Assistant object so OpenAI clients that probe the endpoint keep working."""
    payload = await request.json()
    assistant_id = f"asst-{uuid.uuid4().hex}"
    assistant = {
        "id": assistant_id,
        "object": "assistant",
        "created": int(time.time()),
        "name": payload.get("name"),
        "description": payload.get("description"),
        "model": payload.get("model", DEPLOYMENT_CHAT),
        "instructions": payload.get("instructions"),
        "metadata": payload.get("metadata") or {},
        "tools": payload.get("tools") or [],
    }
    _assistants_store[assistant_id] = assistant
    return assistant


@app.get("/v1/assistants")
async def list_assistants():
    """Expose assistants created during this runtime."""
    return {
        "object": "list",
        "data": list(_assistants_store.values()),
    }


@app.get("/v1/assistants/{assistant_id}")
async def retrieve_assistant(assistant_id: str):
    assistant = _assistants_store.get(assistant_id)
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found.")
    return assistant


@app.delete("/v1/assistants/{assistant_id}")
async def delete_assistant(assistant_id: str):
    assistant = _assistants_store.pop(assistant_id, None)
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found.")
    return {"id": assistant_id, "object": "assistant.deleted", "deleted": True}


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    """Réplique du endpoint OpenAI /v1/chat/completions"""
    payload = await request.json()
    deployment_name = payload.pop("model", DEPLOYMENT_CHAT)

    azure_url = (
        f"{AZURE_ENDPOINT}/deployments/{deployment_name}/chat/completions"
        f"?api-version={API_VERSION}"
    )
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
    }

    response = requests.post(azure_url, headers=headers, json=payload)
    try:
        response_data = response.json()
    except ValueError:
        response_data = None

    if not response.ok:
        error_body = response_data if isinstance(response_data, dict) else {
            "error": response.text or "Unknown error from Azure OpenAI."
        }
        raise HTTPException(status_code=response.status_code, detail=error_body)

    if isinstance(response_data, dict):
        # Certains proxy ou Azure ne renvoient pas 'system_fingerprint' qui est parfois attendu
        if "system_fingerprint" not in response_data:
             response_data["system_fingerprint"] = "fp_dummy"

        # Log pour debug
        print(f"DEBUG: Response from Azure: {json.dumps(response_data, indent=2)}")

        return response_data

    return response.text


@app.post("/v1/embeddings")
async def embeddings(request: Request):
    """Réplique du endpoint OpenAI /v1/embeddings"""
    payload = await request.json()
    deployment_name = payload.pop("model", DEPLOYMENT_EMBEDDING)

    azure_url = (
        f"{AZURE_ENDPOINT}/deployments/{deployment_name}/embeddings"
        f"?api-version={API_VERSION}"
    )
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
    }

    response = requests.post(azure_url, headers=headers, json=payload)
    try:
        response_data = response.json()
    except ValueError:
        response_data = None

    if not response.ok:
        error_body = response_data if isinstance(response_data, dict) else {
            "error": response.text or "Unknown error from Azure OpenAI."
        }
        raise HTTPException(status_code=response.status_code, detail=error_body)

    if isinstance(response_data, dict):
        # Log pour debug
        print(f"DEBUG: Embeddings response from Azure - {len(response_data.get('data', []))} embeddings")

        return response_data

    return response.text


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PROXY_PORT", "8002"))
    print(f"🚀 Démarrage du proxy OpenAI sur http://127.0.0.1:{port}")
    print(f"📋 Modèles disponibles: {DEPLOYMENT_CHAT}, {DEPLOYMENT_EMBEDDING}")
    print(f"🔗 Endpoint Azure: {AZURE_ENDPOINT}")
    uvicorn.run(app, host="127.0.0.1", port=port)
