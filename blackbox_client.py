
import requests
import json
import os

class BlackboxAIClient:
    def __init__(self):
        self.api_key = os.getenv('BLACKBOX_API_KEY')
        self.base_url = "https://api.blackbox.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        if not self.api_key:
            print("⚠️ تحذير: مفتاح Blackbox API غير موجود في متغيرات البيئة")
    
    def generate_code(self, prompt, language="python"):
        """توليد كود برمجي بناءً على الوصف المطلوب"""
        try:
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user", 
                        "content": f"Generate {language} code for: {prompt}"
                    }
                ],
                "model": "blackbox-code",
                "stream": False,
                "max_tokens": 2000,
                "temperature": 0.7
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "code": response.json()['choices'][0]['message']['content'],
                "language": language
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
        except KeyError as e:
            return {
                "success": False,
                "error": f"خطأ في تحليل الاستجابة: {str(e)}"
            }
    
    def explain_code(self, code):
        """شرح الكود المُرسل"""
        try:
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": f"Explain this code in detail:\n\n```\n{code}\n```"
                    }
                ],
                "model": "blackbox-code",
                "stream": False,
                "max_tokens": 1500,
                "temperature": 0.3
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "explanation": response.json()['choices'][0]['message']['content']
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
        except KeyError as e:
            return {
                "success": False,
                "error": f"خطأ في تحليل الاستجابة: {str(e)}"
            }
    
    def debug_code(self, code, error_message=""):
        """تصحيح الأخطاء في الكود"""
        try:
            prompt = f"Debug this code and fix any issues:\n\nCode:\n```\n{code}\n```"
            if error_message:
                prompt += f"\n\nError message: {error_message}"
            
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "blackbox-code",
                "stream": False,
                "max_tokens": 2000,
                "temperature": 0.1
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "fixed_code": response.json()['choices'][0]['message']['content']
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
    
    def optimize_code(self, code, optimization_goal="performance"):
        """تحسين الكود للأداء أو القراءة"""
        try:
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": f"Optimize this code for {optimization_goal}:\n\n```\n{code}\n```"
                    }
                ],
                "model": "blackbox-code",
                "stream": False,
                "max_tokens": 2000,
                "temperature": 0.2
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "optimized_code": response.json()['choices'][0]['message']['content'],
                "optimization_type": optimization_goal
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
    
    def convert_code(self, code, from_language, to_language):
        """تحويل الكود من لغة برمجة إلى أخرى"""
        try:
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": f"Convert this {from_language} code to {to_language}:\n\n```{from_language}\n{code}\n```"
                    }
                ],
                "model": "blackbox-code",
                "stream": False,
                "max_tokens": 2000,
                "temperature": 0.1
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "converted_code": response.json()['choices'][0]['message']['content'],
                "from_language": from_language,
                "to_language": to_language
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
    
    def chat(self, message, context=""):
        """محادثة عامة مع Blackbox AI"""
        try:
            prompt = message
            if context:
                prompt = f"Context: {context}\n\nQuestion: {message}"
            
            endpoint = f"{self.base_url}/chat/completions"
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "blackbox",
                "stream": False,
                "max_tokens": 1500,
                "temperature": 0.7
            }
            
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            
            return {
                "success": True,
                "response": response.json()['choices'][0]['message']['content']
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"خطأ في الطلب: {str(e)}"
            }
    
    def test_connection(self):
        """اختبار الاتصال مع API"""
        try:
            result = self.chat("Hello, can you help me with coding?")
            if result["success"]:
                return {
                    "success": True,
                    "message": "الاتصال مع Blackbox AI يعمل بنجاح"
                }
            else:
                return result
        except Exception as e:
            return {
                "success": False,
                "error": f"فشل في اختبار الاتصال: {str(e)}"
            }

# مثال على الاستخدام
if __name__ == "__main__":
    client = BlackboxAIClient()
    
    # اختبار الاتصال
    connection_test = client.test_connection()
    print("اختبار الاتصال:", connection_test)
    
    # مثال على توليد كود
    code_generation = client.generate_code("Create a function to calculate fibonacci numbers", "python")
    if code_generation["success"]:
        print("الكود المُولد:", code_generation["code"])
    else:
        print("خطأ:", code_generation["error"])
