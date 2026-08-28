"""
⚡ Kedar AI Model High-Performance REST & Streaming API Server
============================================================
Exposes OpenAI-compatible endpoints and specialized Kedar AI endpoints.
Runs with standard Python libraries (zero external dependencies required).
"""

import sys
import os
import json
import time
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any

# Add directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model_core import kedar_ai_model

PORT = int(os.environ.get("KEDAR_AI_PORT", 8000))
HOST = "0.0.0.0"

class KedarAIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/health", "/v1/health"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            resp = {
                "status": "healthy",
                "model": kedar_ai_model.model_name,
                "version": kedar_ai_model.version,
                "uptime": round(time.time() - kedar_ai_model.created_at, 2),
                "timestamp": time.time()
            }
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))
            return

        if path in ["/v1/models", "/models"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            models_data = {
                "object": "list",
                "data": [
                    kedar_ai_model.get_model_info(),
                    {"id": "kedar-ai-coder-2026", "object": "model", "owned_by": "kedar-ai"},
                    {"id": "kedar-ai-academic-10m", "object": "model", "owned_by": "kedar-ai"},
                    {"id": "kedar-ai-agent-swarm", "object": "model", "owned_by": "kedar-ai"}
                ]
            }
            self.wfile.write(json.dumps(models_data, indent=2).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": f"Endpoint {path} not found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Robust content-length extraction
        length_header = self.headers.get("content-length") or self.headers.get("Content-Length") or "0"
        try:
            content_length = int(length_header)
        except ValueError:
            content_length = 0

        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        # 1. Standard OpenAI Chat Completions (REST & SSE Streaming)
        if path in ["/v1/chat/completions", "/chat/completions"]:
            messages = data.get("messages", [])
            stream = data.get("stream", False)
            user_profile = data.get("user_profile") or data.get("profile")

            # Extract system prompt and last user prompt
            system_role = ""
            user_prompt = data.get("prompt", "")
            history = []

            for m in messages:
                role = m.get("role", "")
                content = m.get("content", "")
                if role == "system":
                    system_role = content
                elif role == "user":
                    user_prompt = content
                    history.append({"role": "user", "content": content})
                elif role == "assistant":
                    history.append({"role": "assistant", "content": content})

            if not user_prompt and messages:
                user_prompt = messages[-1].get("content", "")

            # Generate full response from Kedar AI Model
            full_response = kedar_ai_model.generate_chat_response(
                prompt=user_prompt,
                history=history,
                system_role=system_role,
                user_profile=user_profile
            )

            if stream:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self._send_cors_headers()
                self.end_headers()

                # Stream word-by-word
                words = full_response.split(" ")
                for i, word in enumerate(words):
                    chunk_text = (word if i == 0 else " " + word)
                    chunk_payload = {
                        "id": f"chatcmpl-{int(time.time()*1000)}",
                        "object": "chat.completion.chunk",
                        "created": int(time.time()),
                        "model": kedar_ai_model.model_name,
                        "choices": [{
                            "index": 0,
                            "delta": {"content": chunk_text},
                            "finish_reason": None
                        }]
                    }
                    self.wfile.write(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                    self.wfile.flush()
                    time.sleep(0.015)

                # End marker
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
                return

            else:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()

                response_obj = {
                    "id": f"chatcmpl-{int(time.time()*1000)}",
                    "object": "chat.completion",
                    "created": int(time.time()),
                    "model": kedar_ai_model.model_name,
                    "choices": [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": full_response
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {
                        "prompt_tokens": len(user_prompt.split()),
                        "completion_tokens": len(full_response.split()),
                        "total_tokens": len(user_prompt.split()) + len(full_response.split())
                    }
                }
                self.wfile.write(json.dumps(response_obj, indent=2).encode("utf-8"))
                return

        # 2. Autonomous Agent Execution Endpoint
        if path == "/v1/agent/execute":
            goal = data.get("goal", "")
            profile = data.get("profile", {})
            output = kedar_ai_model.generate_chat_response(f"Goal: {goal}", user_profile=profile)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "goal": goal, "output": output}).encode("utf-8"))
            return

        # 3. Academic 10-Mark Exam Solver Endpoint
        if path == "/v1/academic/solve":
            question = data.get("question", "")
            profile = data.get("profile", {})
            output = kedar_ai_model.generate_chat_response(f"10-mark University Exam Question: {question}", user_profile=profile)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "solution": output}).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": f"POST endpoint {path} not found"}).encode("utf-8"))

def run_server():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, KedarAIHandler)
    print("")
    print("============================================================")
    print(f"[*] Kedar AI Model Inference Server Active & Running!")
    print(f"    Model:    {kedar_ai_model.model_name} (v{kedar_ai_model.version})")
    print(f"    Endpoint: http://localhost:{PORT}/v1/chat/completions")
    print(f"    Health:   http://localhost:{PORT}/v1/health")
    print(f"    Models:   http://localhost:{PORT}/v1/models")
    print("============================================================")
    print("")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Kedar AI Server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
