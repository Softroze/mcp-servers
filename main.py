
# main.py - التطبيق الرئيسي في Replit
import streamlit as st
import os
import requests
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import tempfile
import subprocess

# تحميل متغيرات البيئة
load_dotenv()

# إعداد الصفحة
st.set_page_config(
    page_title="🔥 BlackboxAI + Replit Integration",
    page_icon="🔥",
    layout="wide"
)

class BlackboxAIClient:
    def __init__(self):
        self.base_url = "http://0.0.0.0:5000"
        
    def generate_code(self, prompt, language="python"):
        """توليد كود برمجي بناءً على الوصف المطلوب"""
        try:
            response = requests.post(
                f"{self.base_url}/api/blackbox/code",
                json={
                    "action": "generate",
                    "prompt": prompt,
                    "language": language
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"success": False, "error": f"خطأ HTTP: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"خطأ في الاتصال: {str(e)}"}
    
    def explain_code(self, code):
        """شرح الكود المُرسل"""
        try:
            response = requests.post(
                f"{self.base_url}/api/blackbox/code",
                json={
                    "action": "explain",
                    "code": code
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"success": False, "error": f"خطأ HTTP: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"خطأ في الاتصال: {str(e)}"}
    
    def debug_code(self, code, error_message=""):
        """تصحيح الأخطاء في الكود"""
        try:
            response = requests.post(
                f"{self.base_url}/api/blackbox/code",
                json={
                    "action": "debug",
                    "code": code,
                    "error_message": error_message
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"success": False, "error": f"خطأ HTTP: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"خطأ في الاتصال: {str(e)}"}

# تهيئة العميل
@st.cache_resource
def init_blackbox_client():
    return BlackboxAIClient()

client = init_blackbox_client()

# العنوان الرئيسي
st.title("🔥 BlackboxAI مع Replit - مولد الكود الذكي")

# الشريط الجانبي
with st.sidebar:
    st.header("⚙️ الإعدادات")
    
    language = st.selectbox(
        "لغة البرمجة:",
        ["python", "javascript", "java", "cpp", "html", "css", "sql", "go", "rust"]
    )
    
    complexity = st.slider("مستوى التعقيد:", 1, 5, 3)
    
    include_comments = st.checkbox("تضمين التعليقات", True)
    
    include_error_handling = st.checkbox("تضمين معالجة الأخطاء", True)

# التبويبات الرئيسية
tab1, tab2, tab3, tab4 = st.tabs(["🚀 توليد الكود", "📖 شرح الكود", "🐛 تصحيح الأخطاء", "🌐 تصفح الويب"])

with tab1:
    st.header("📝 توليد الكود")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        user_prompt = st.text_area(
            "اكتب وصف للكود المطلوب:",
            height=200,
            placeholder="مثال: اكتب برنامج لحساب الأرقام الأولية حتى رقم معين"
        )
        
        if st.button("🚀 توليد الكود", type="primary"):
            if user_prompt:
                with st.spinner("جاري توليد الكود..."):
                    # تحسين الطلب
                    enhanced_prompt = f"""
                    Create a {language} program that {user_prompt}.
                    Requirements:
                    - Complexity level: {complexity}/5
                    - Include comments: {include_comments}
                    - Include error handling: {include_error_handling}
                    - Make it production-ready
                    """
                    
                    result = client.generate_code(enhanced_prompt, language)
                    
                    if result.get("success"):
                        st.session_state.generated_code = result["result"]["response"]
                    else:
                        st.error(f"فشل في توليد الكود: {result.get('error', 'خطأ غير معروف')}")
    
    with col2:
        if 'generated_code' in st.session_state:
            st.header("📋 الكود المُولد")
            st.code(st.session_state.generated_code, language=language)
            
            # خيارات إضافية
            col_save, col_run = st.columns(2)
            
            with col_save:
                if st.button("💾 حفظ الكود"):
                    filename = f"generated_code.{language}"
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(st.session_state.generated_code)
                    st.success(f"تم حفظ الكود في {filename}")
            
            with col_run:
                if language == "python" and st.button("▶️ تشغيل الكود"):
                    with st.spinner("جاري تشغيل الكود..."):
                        try:
                            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
                                f.write(st.session_state.generated_code)
                                temp_file = f.name
                            
                            result = subprocess.run(['python', temp_file], 
                                                  capture_output=True, text=True, timeout=10)
                            
                            if result.returncode == 0:
                                st.success("تم تشغيل الكود بنجاح!")
                                if result.stdout:
                                    st.code(result.stdout, language="text")
                            else:
                                st.error("خطأ في تشغيل الكود:")
                                st.code(result.stderr, language="text")
                                
                        except subprocess.TimeoutExpired:
                            st.error("انتهت مهلة تشغيل الكود")
                        except Exception as e:
                            st.error(f"خطأ في التشغيل: {str(e)}")
                        finally:
                            if 'temp_file' in locals():
                                try:
                                    os.unlink(temp_file)
                                except:
                                    pass

with tab2:
    st.header("📖 شرح الكود")
    
    code_to_explain = st.text_area(
        "الصق الكود هنا للحصول على شرح:",
        height=300,
        placeholder="def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
    )
    
    if st.button("📖 شرح الكود"):
        if code_to_explain:
            with st.spinner("جاري تحليل وشرح الكود..."):
                result = client.explain_code(code_to_explain)
                
                if result.get("success"):
                    st.success("تم تحليل الكود بنجاح!")
                    st.markdown(result["result"]["response"])
                else:
                    st.error(f"فشل في شرح الكود: {result.get('error', 'خطأ غير معروف')}")

with tab3:
    st.header("🐛 تصحيح الأخطاء")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        buggy_code = st.text_area(
            "الكود الذي يحتوي على أخطاء:",
            height=200,
            placeholder="def divide(a, b):\n    return a / b"
        )
        
        error_msg = st.text_area(
            "رسالة الخطأ (اختياري):",
            height=100,
            placeholder="ZeroDivisionError: division by zero"
        )
        
        if st.button("🔧 إصلاح الأخطاء"):
            if buggy_code:
                with st.spinner("جاري تحليل وإصلاح الأخطاء..."):
                    result = client.debug_code(buggy_code, error_msg)
                    
                    if result.get("success"):
                        st.session_state.fixed_code = result["result"]["response"]
                    else:
                        st.error(f"فشل في إصلاح الكود: {result.get('error', 'خطأ غير معروف')}")
    
    with col2:
        if 'fixed_code' in st.session_state:
            st.header("✅ الكود المُصحح")
            st.code(st.session_state.fixed_code, language=language)

with tab4:
    st.header("🌐 تصفح الويب")
    
    url = st.text_input(
        "أدخل رابط الموقع:",
        placeholder="https://example.com"
    )
    
    if st.button("🌐 تصفح الموقع"):
        if url:
            with st.spinner("جاري تحميل الصفحة..."):
                try:
                    # إعداد Chrome للتشغيل في وضع headless
                    chrome_options = Options()
                    chrome_options.add_argument("--headless")
                    chrome_options.add_argument("--no-sandbox")
                    chrome_options.add_argument("--disable-dev-shm-usage")
                    chrome_options.add_argument("--disable-gpu")
                    
                    # تهيئة WebDriver
                    service = Service(ChromeDriverManager().install())
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                    
                    # تحميل الصفحة
                    driver.get(url)
                    page_source = driver.page_source
                    driver.quit()
                    
                    # تحليل المحتوى باستخدام BeautifulSoup
                    soup = BeautifulSoup(page_source, 'html.parser')
                    
                    # عرض المعلومات الأساسية
                    st.success("تم تحميل الصفحة بنجاح!")
                    
                    title = soup.find('title')
                    if title:
                        st.subheader(f"📝 العنوان: {title.get_text()}")
                    
                    # استخراج النصوص الرئيسية
                    paragraphs = soup.find_all('p')[:5]  # أول 5 فقرات
                    if paragraphs:
                        st.subheader("📄 المحتوى:")
                        for i, p in enumerate(paragraphs, 1):
                            text = p.get_text().strip()
                            if text:
                                st.write(f"{i}. {text[:200]}...")
                    
                    # استخراج الروابط
                    links = soup.find_all('a', href=True)[:10]  # أول 10 روابط
                    if links:
                        st.subheader("🔗 الروابط:")
                        for link in links:
                            link_text = link.get_text().strip()
                            link_url = link['href']
                            if link_text and link_url:
                                st.write(f"- [{link_text}]({link_url})")
                    
                except Exception as e:
                    st.error(f"خطأ في تحميل الصفحة: {str(e)}")

# إحصائيات النظام
st.sidebar.markdown("---")
st.sidebar.header("📊 إحصائيات النظام")

try:
    response = requests.get(f"http://0.0.0.0:5000/api/stats", timeout=5)
    if response.status_code == 200:
        stats = response.json()
        st.sidebar.metric("🤖 الوكلاء النشطة", stats.get("totalAgents", 0))
        st.sidebar.metric("🔧 حالة النظام", "صحي" if stats.get("systemHealth") == "healthy" else "غير صحي")
    else:
        st.sidebar.warning("لا يمكن جلب الإحصائيات")
except:
    st.sidebar.warning("النظام غير متصل")

# معلومات إضافية
st.sidebar.markdown("---")
st.sidebar.info(
    """
    **💡 نصائح للاستخدام:**
    
    - استخدم أوصاف واضحة ومفصلة
    - اختر لغة البرمجة المناسبة
    - جرب مستويات تعقيد مختلفة
    - استخدم ميزة تصحيح الأخطاء لتحسين الكود
    """
)
