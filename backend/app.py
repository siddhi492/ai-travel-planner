import os
import json
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ---------- LOAD ENV ----------
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ---------- APP ----------
app = Flask(__name__)
CORS(app)

# ---------- SYSTEM PROMPT ----------
SYSTEM_PROMPT = """
You are a professional AI Travel Planner for Indian trips.

STRICT RULES:
1. Respond ONLY with valid JSON
2. No explanation or markdown
3. Follow schema strictly
4. Never skip keys
5. Each array must have at least 3 items
6. Provide realistic Indian locations & costs

JSON SCHEMA:
{
  "plans": [
    {
      "planId": number,
      "transportCost": number,
      "stayCost": number,
      "foodCost": number,
      "localTravelCost": number,
      "totalCost": number,
      "budgetWarning": boolean,
      "days": [
        {
          "day": number,
          "spots": [string, string, string],
          "restaurants": [string, string, string],
          "stay": [string, string, string],
          "dayCost": number
        }
      ]
    }
  ]
}
"""

# ---------- ROUTE ----------
@app.route("/plan", methods=["POST"])
def generate_plan():
    try:
        data = request.json

        from_city = data.get("from_city")
        to_city = data.get("to_city")
        days = int(data.get("days"))
        budget = int(data.get("budget"))
        transport_mode = data.get("transport_mode")

        # ---------- USER PROMPT ----------
        user_prompt = f"""
Create 5 different travel plans.

Trip Details:
From City: {from_city}
To City: {to_city}
Days: {days}
Budget: ₹{budget}
Transport Mode: {transport_mode}

Include:
- Tourist attractions
- Temples
- Shopping areas
- Food experiences
- Nature places

Cost Planning:
Include transport, stay, food, and local travel cost.

Transport Logic:

If Private Vehicle:
• Estimate distance between cities
• Assume mileage 15 km/litre
• Petrol price ₹105/litre
• Include toll charges realistically

If Train / Bus / Flight:
• Estimate ticket price realistically

Budget Rule:
If total cost > budget → budgetWarning true
Else → false

Return ONLY JSON.
"""

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.4
            },
            timeout=60
        )

        raw = response.json()["choices"][0]["message"]["content"]

        match = re.search(r'\{.*\}', raw, re.DOTALL)

        if not match:
            return jsonify({"plans": []})

        ai_data = json.loads(match.group())

        return jsonify({"plans": ai_data["plans"]})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "AI failed"}), 500


if __name__ == "__main__":
    app.run(debug=True)
