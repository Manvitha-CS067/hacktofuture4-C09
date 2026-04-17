HACKTOFUTURE 4.O THE BRAINIACS C-09


Problem Statement / Idea

The Problem: Traditional authentication (passwords/MFA) is vulnerable to session hijacking, MITM attacks, and credential stuffing because it only verifies what a user knows, not who they are or how they behave.

Importance: Financial and enterprise data require a "Zero Trust" layer that continuously verifies identity without ruining user experience.

Target Users: Fintech platforms, Cybersecurity firms, and Enterprise SaaS providers.


Proposed Solution

Approach: We built Nexis Sentinel, a behavioral biometrics and environmental anchoring engine.

Uniqueness: Unlike static MFA, Nexis uses Agentic AI to analyze "Digital DNA" (typing cadence, mouse velocity) and "Environmental Anchoring" (Hardware DNA, Network Latency) to detect threats like MITM and DDoS in real-time.


Tech Stack

Frontend: React.js, Tailwind CSS, Framer Motion, Lucide React.

Backend: FastAPI (Python), WebSockets, Uvicorn.

Database: Supabase (PostgreSQL).

Auth: Clerk.

AI/ML: Custom Anomaly Detection Agent (Isolation Forest/ML).


Project Setup Instructions
Follow these steps to deploy the Nexis Sentinel environment locally.

1. Clone the Repository
Bash
git clone https://github.com/Manvitha-CS067/hacktofuture4-C09.git
cd hacktofuture4-C09
2. Configure Environment Variables
To protect infrastructure integrity, environment secrets are not included in the repository. Create a .env file in the root directory and add the following:

Code snippet
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Clerk Authentication (Frontend)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
3. Backend Setup (FastAPI)
The backend handles real-time anomaly detection and biometric processing.

Bash
# Install required Python dependencies
pip install fastapi uvicorn supabase python-dotenv

# Launch the Sentinel Server
python main.py
The server will initialize at http://127.0.0.1:8000

4. Frontend Setup (React + Vite)
The dashboard provides a real-time forensic view of the network security state.

Bash
# Navigate to the interface directory
cd client

# Install Node dependencies
npm install

# Start the development interface
npm run dev
The dashboard will be accessible at http://localhost:5173
