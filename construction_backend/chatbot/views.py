from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import requests
import json

class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        history = request.data.get('history', [])
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            return Response(
                {"reply": "⚠️ The Chatbot is currently offline. Please configure the GEMINI_API_KEY in the backend `.env` file to enable the AI assistant!"},
                status=status.HTTP_200_OK
            )

        try:
            company_name = request.user.company.name if getattr(request.user, 'company', None) else "your company"
            system_instruction = f"You are a helpful, professional AI Assistant for a construction management ERP software. You are helping an employee of {company_name}. You can answer questions about construction management, help draft emails, or explain how to use software features like Projects, Expenses, Tenders, and HR. Be concise and format your answers with markdown if needed."
            
            # Format history for Gemini REST API
            formatted_contents = []
            for msg in history:
                role = "user" if msg.get("role") == "user" else "model"
                formatted_contents.append({
                    "role": role,
                    "parts": [{"text": msg.get("content", "")}]
                })
            
            # Add the current user message
            formatted_contents.append({
                "role": "user",
                "parts": [{"text": user_message}]
            })

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            payload = {
                "system_instruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": formatted_contents
            }

            headers = {
                "Content-Type": "application/json"
            }

            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            if response.status_code == 200:
                data = response.json()
                reply_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "I'm not sure how to respond to that.")
                return Response({"reply": reply_text}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"reply": f"Sorry, the AI service returned an error. {response.text}"},
                    status=status.HTTP_200_OK
                )
            
        except Exception as e:
            print("Chatbot Error:", str(e))
            return Response(
                {"reply": f"Sorry, I encountered an error: {str(e)}"},
                status=status.HTTP_200_OK
            )
