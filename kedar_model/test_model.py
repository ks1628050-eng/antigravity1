"""
⚡ Test Suite for Kedar AI Model & Server
"""

import sys
import os
import json
import time

# Ensure kedar_model directory is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model_core import kedar_ai_model

def run_tests():
    print("========================================")
    print("[*] Running Kedar AI Model Verification")
    print("========================================")

    # 1. Model Info
    info = kedar_ai_model.get_model_info()
    print(f"[+] Model ID: {info['id']}")
    print(f"[+] Capabilities: {list(info['capabilities'].keys())}")

    # 2. General Prompt
    print("\n--- Test 1: General Query ---")
    resp1 = kedar_ai_model.generate_chat_response("Explain how WebSocket streaming works in modern web apps")
    assert len(resp1) > 100
    print("[+] General Query Output Length:", len(resp1))

    # 3. 10-Mark Exam Solver
    print("\n--- Test 2: 10-Mark Exam Solver ---")
    resp2 = kedar_ai_model.generate_chat_response("Solve 10-mark question: Explain Page Fault handling and Virtual Memory in OS")
    assert "10-MARK UNIVERSITY EXAMINATION SOLUTION" in resp2
    assert "ARCHITECTURAL SYSTEM BLOCK DIAGRAM" in resp2
    print("[+] 10-Mark Exam Output Verified!")

    # 4. Code Generation
    print("\n--- Test 3: Code Generation ---")
    resp3 = kedar_ai_model.generate_chat_response("Write Python code to solve LRU cache with Doubly Linked List")
    assert "```python" in resp3
    assert "class" in resp3
    print("[+] Code Generation Verified!")

    # 5. Multi-Agent Swarm Step
    print("\n--- Test 4: Autonomous Agent Swarm ---")
    resp4 = kedar_ai_model.generate_chat_response("Act as System Architect Agent for Goal: Build Real-time Chat App with WebSockets and Redis")
    assert "System Architecture Specification" in resp4
    assert "CREATE TABLE" in resp4
    print("[+] Agent Swarm Verified!")

    # 6. Viva Voce Examiner
    print("\n--- Test 5: Viva Voce Examiner ---")
    resp5 = kedar_ai_model.generate_chat_response("Viva Examiner: Question Asked: 'What is QuickSort time complexity?' Student's Spoken Answer: 'It is O(N log N) on average using divide and conquer partition.'")
    assert "University Viva Voce Evaluation" in resp5
    assert "Score:" in resp5
    print("[+] Viva Voce Examiner Verified!")

    print("\n========================================")
    print("[+] ALL KEDAR AI MODEL TESTS PASSED (100%)!")
    print("========================================")

if __name__ == "__main__":
    run_tests()
