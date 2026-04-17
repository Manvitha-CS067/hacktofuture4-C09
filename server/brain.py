import numpy as np
from sklearn.ensemble import IsolationForest
import pandas as pd

class AnomalyAgent:
    def __init__(self):
        # Increased estimators for higher resolution of human 'Micro-Jitter'
        self.model = IsolationForest(
            contamination=0.05, 
            n_estimators=200, 
            random_state=42
        )
        self.is_trained = False
        self.risk_history = [] 

    def train_baseline(self, data):
        """Establish a Temporal Baseline for user activity once 40 signals are hit."""
        if len(data) < 40:
            return
        self.model.fit(pd.DataFrame(data))
        self.is_trained = True

    def calculate_risk(self, current_signal):
        """Calculates smoothed risk score using Isolation Forest logic."""
        if not self.is_trained:
            return 0.05
        
        signal_array = np.array(current_signal).reshape(1, -1)
        prediction = self.model.predict(signal_array)[0]
        
        # ML prediction: -1 is anomaly, 1 is normal
        ml_risk = 0.95 if prediction == -1 else 0.05
        
        # Smoothing logic to prevent false positives from single mistakes
        self.risk_history.append(ml_risk)
        if len(self.risk_history) > 5:
            self.risk_history.pop(0)
            
        return round(float(sum(self.risk_history) / len(self.risk_history)), 3)

    def get_cognitive_status(self, risk_score, env_risk):
        """Translates raw math into human-readable forensics."""
        total_risk = max(risk_score, env_risk)
        if total_risk > 0.92:
            return "CRITICAL", "MULTIMODAL_ANOMALY: Instant Token Revocation."
        if total_risk > 0.60:
            return "WARNING", "Cognitive Stumble: Activating UI Perturbation."
        return "VERIFIED", "Continuous Identity Confirmed."