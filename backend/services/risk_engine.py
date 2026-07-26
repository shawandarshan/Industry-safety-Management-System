class RiskEngine:
    """
    Calculates dynamic risk score for a given state.
    """
    def __init__(self):
        # Risk weights
        self.weights = {
            "helmet_missing": 20,
            "vest_missing": 15,
            "danger_zone": 25,
            "running": 15,
            "machine_overheating": 25,
            "inactivity": 10
        }

    def calculate_score(self, state_dict: dict) -> int:
        """
        state_dict example:
        {
            "helmet_missing": True,
            "vest_missing": False,
            "danger_zone": True,
            "running": False,
            "machine_overheating": False
        }
        """
        score = 0
        for condition, active in state_dict.items():
            if active and condition in self.weights:
                score += self.weights[condition]
        
        # Cap score at 100
        return min(100, score)

    def get_risk_level(self, score: int) -> str:
        if score < 40:
            return "Safe"
        elif score < 70:
            return "Medium Risk"
        else:
            return "High Risk"

risk_engine = RiskEngine()
