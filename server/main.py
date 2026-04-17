from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import re
from brain import AnomalyAgent
from supabase import create_client

import os
from dotenv import load_dotenv

# --- LOAD SECRETS FROM .ENV ---
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ ERROR: Missing Supabase credentials in .env file")

supabase = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DANGEROUS_PATTERNS = ["IGNORE", "OVERRIDE", "SUDO", "ADMIN", "DATABASE", "<SCRIPT>", "SELECT *", "DROP TABLE"]
brain = AnomalyAgent()
signal_buffer = []
device_vault = {} 
session_registry = {} 

# --- RATE LIMIT TRACKING ---
message_count = 0
last_reset_time = time.time()

def sanitize_input(text: str) -> str:
    clean = re.sub(r'[<>{}\[\]/\\;]', '', text)
    return clean.strip()

def save_log_to_db(event, score, msg, meta):
    try:
        supabase.table("security_logs").insert({
            "event_type": event, "risk_score": score, "message": msg, "metadata": meta
        }).execute()
    except Exception as e: print(f"❌ DB ERROR: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    ip = websocket.client.host
    global signal_buffer, message_count, last_reset_time
    
    print(f"📡 CONNECTION_ESTABLISHED: {ip}")

    try:
        while True:
            try:
                raw_data = await asyncio.wait_for(websocket.receive_json(), timeout=5.0)
            except asyncio.TimeoutError:
                continue

            # Handle Heartbeat/System Metadata Sync
            if raw_data.get("ping") and not raw_data.get("content"):
                response = {"pong": True}
                if ip in device_vault:
                    response["home_location"] = device_vault[ip]["tz"]
                await websocket.send_json(response)
                continue

            # --- 1. DATA EXTRACTION ---
            raw_content = str(raw_data.get("content", ""))
            typing_delay = raw_data.get("typing_delay", 0.2)
            hw_id = raw_data.get("hardware_id", "UNKNOWN")
            user_tz = raw_data.get("timezone", "UTC")
            mouse_v = raw_data.get("mouse_velocity", 0)
            client_latency = raw_data.get("latency", 0)

            # --- 2. PRIORITY GATE 1: VELOCITY & RATE LIMIT (DDOS) ---
            current_time = time.time()
            if current_time - last_reset_time > 1.0:
                message_count = 0
                last_reset_time = current_time
            message_count += 1
            
            # TRIGGER: > 2 msgs/sec OR delay < 0.05s
            ddos_breached = (message_count > 2 or typing_delay < 0.05)
            
            if ddos_breached:
                current_risk = 0.98
                event_type = "DDOS_BLOCK"
                message = f"DDoS_RATE_LIMIT: {message_count} events/sec detected."
                print(f"🚩 DDOS TRIGGERED: {message_count} msgs/sec") 
            else:
                current_risk = 0.05
                event_type = "VERIFIED"
                message = "Identity Confirmed."
                
                if ip not in device_vault and user_tz != "UTC":
                    device_vault[ip] = {"hw": hw_id, "tz": user_tz}
                
                home_context = device_vault.get(ip, {"hw": hw_id, "tz": user_tz})
                
                # MITM / HIJACK / SEMANTIC checks
                mitm_suspected = (client_latency > 150 and current_risk < 0.2)
                collision_detected = (ip in session_registry and session_registry[ip] != hw_id)
                if not collision_detected:
                    session_registry[ip] = hw_id

                semantic_breached = any(p in raw_content.upper() for p in DANGEROUS_PATTERNS)
                env_breached = (user_tz != home_context["tz"] or hw_id != home_context["hw"])

                if mitm_suspected:
                    current_risk = 0.95
                    event_type = "MITM_ATTACK"
                    message = "INTERCEPTION_DETECTED: Abnormal latency detected."
                elif collision_detected:
                    current_risk = 1.0
                    event_type = "CONCURRENT_COLLISION"
                    message = "SESSION_HIJACK: Hardware signature mismatch."
                elif semantic_breached:
                    current_risk = 1.0
                    event_type = "SEMANTIC_SHIELD"
                    message = "SEMANTIC_INJECTION: Forbidden command string."
                elif env_breached:
                    current_risk = 1.0
                    event_type = "IDENTITY_CHALLENGE"
                    message = "GEO_ANOMALY: Environment mismatch."
                else:
                    # ML Inference
                    current_features = [typing_delay, mouse_v, len(hw_id)]
                    signal_buffer.append(current_features)
                    if len(signal_buffer) >= 40:
                        ml_risk = brain.calculate_risk(current_features)
                        current_risk = ml_risk
                        event_type, message = brain.get_cognitive_status(ml_risk, 0.02)

            if event_type != "VERIFIED":
                save_log_to_db(event_type, current_risk, message, {"ip": ip, "hw": hw_id, "latency": client_latency})

            await websocket.send_json({
                "risk_score": current_risk, 
                "event": event_type, 
                "message": message,
                "progress": min(len(signal_buffer) / 40 * 100, 100),
                "perturbation": current_risk > 0.6,
                "challenge_required": (event_type in ["IDENTITY_CHALLENGE", "CONCURRENT_COLLISION", "MITM_ATTACK"]),
                "home_location": device_vault.get(ip, {}).get("tz", "SECURE")
            })

    except WebSocketDisconnect:
        if ip in session_registry: del session_registry[ip]
    except Exception as e: print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)