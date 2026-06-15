from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def search_foundry_iq(query):
    query = query.lower()

    if "exam" in query or "study" in query:
        return """
Bhagavad Gita 2.47:
Focus on your effort, not the result.
"""

    if "betray" in query or "friend" in query:
        return """
Mahabharata:
Forgiveness and wisdom are greater than revenge.
"""

    if "fear" in query or "anxiety" in query:
        return """
Bhagavad Gita 4.10:
Many have attained peace by overcoming fear.
"""

    return """
Bhagavad Gita 2.47:
Perform your duty without attachment to outcomes.
"""

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        body = request.get_json()
        user_message = body.get('message', '').strip()

        if not user_message:
            return jsonify({
                "response": "",
                "error": "Message cannot be empty."
            }), 400

        scripture_context = search_foundry_iq(user_message)

        ai_response = f"""
🙏 RAADHEY RAADHEY

I understand your concern:

"{user_message}"

Relevant Wisdom:

{scripture_context}

Take a moment to breathe calmly.

Reflect on what action is within your control right now and focus your energy there.

Would you like me to guide you deeper into this situation?
"""

        return jsonify({
            "response": ai_response,
            "source": "GitaJi Wisdom Engine"
        })

    except Exception as e:
        print(f"PYTHON CRASH: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)