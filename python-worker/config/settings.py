import os
from dotenv import load_dotenv

# BASE_DIR הוא התיקייה שבה נמצא פרויקט ה-python-worker
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# טעינת משתני הסביבה מתוך python-worker/.env
load_dotenv(os.path.join(BASE_DIR, ".env"))

# נתיב הבסיס לכל המידע
BASE_STORAGE_PATH = os.getenv("BASE_STORAGE_PATH")

# תתי-נתיבים
UPLOADS_DIR = os.path.join(BASE_STORAGE_PATH, "uploads")
WORKDIR_BASE = os.path.join(BASE_STORAGE_PATH, "workdir")
EXPORTS_DIR = os.path.join(BASE_STORAGE_PATH, "exports")

# פונקציה ליצירת תיקיית עבודה ייחודית לפונט
def get_font_workdir(font_id):
    path = os.path.join(WORKDIR_BASE, str(font_id))
    os.makedirs(path, exist_ok=True)
    return path

# ttf_generator
# הנתיב לקובץ ההפעלה של FontForge
FONTFORGE_EXE = os.getenv("FONTFORGE_EXE")

# הנתיב לסקריפט עצמו
TTF_SCRIPT_PATH = os.path.join(BASE_DIR, "modules", "ttf_generator.py")

# workdir
BASE_WORK_DIR = os.path.join(BASE_DIR, "workdir")

# הנתיב לתיקיית המודלים
MODELS_DIR = os.path.join(BASE_DIR, "models_storage")
BART_MODEL_PATH = os.path.join(MODELS_DIR, "bart_model")
LLAVA_MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "models_storage", "LLaVA-NeXT_model", "llava-v1.6-vicuna-7b-Q4_K_M.gguf"))
LLAVA_CLIP_PATH = os.path.abspath(os.path.join(BASE_DIR, "models_storage", "LLaVA-NeXT_model", "llava-v1.6-vicuna-7b-mmproj-model-f16.gguf"))
Efficientnet_MODEL_PATH = os.path.join(MODELS_DIR, "efficientNetB1_collapsed_v2.pth")

GOOGLE_VISION_API_KEY = os.getenv("GOOGLE_VISION_API_KEY")