"""
⚡ Client Verification for Kedar AI Local Model Server
"""
import urllib.request
import json

url = "http://localhost:8000/v1/chat/completions"
payload = {
    "model": "kedar-ai-pro-v1",
    "messages": [
        {"role": "user", "content": "Write Python code to solve LRU cache with Doubly Linked List"}
    ]
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    content = res["choices"][0]["message"]["content"]
    print("=== SERVER RESPONSE (Length: " + str(len(content)) + ") ===")
    assert "class LRUCache" in content
    print("[+] SERVER CHAT COMPLETIONS TEST PASSED (100%)!")
