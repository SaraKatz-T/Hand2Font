import base64
import os
import json
from llama_cpp import Llama
from llama_cpp.llama_chat_format import Llava15ChatHandler

# --- הגדרות נתיבים ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "LLaVA-NeXT_model")
MODEL_PATH = os.path.join(MODEL_DIR, "llava-v1.6-vicuna-7b-Q4_K_M.gguf")
CLIP_PATH = os.path.join(MODEL_DIR, "llava-v1.6-vicuna-7b-mmproj-model-f16.gguf")


def get_llm_instance(model_path, clip_path):
    print(" [LLaVA] טוען מודל ויזואלי... זה עשוי לקחת זמן...")
    chat_handler = Llava15ChatHandler(clip_model_path=clip_path)
    return Llama(
        model_path=model_path,
        chat_handler=chat_handler,
        n_ctx=4096,
        verbose=False
    )


def classify_handwriting(llm, image_path, shapes, vibes):
    """מבצעת את הניתוח על תמונה ספציפית"""
    # בדיקה שהקובץ באמת קיים בנתיב שנתנו
    if not os.path.exists(image_path):
        return {"error": f"הקובץ לא נמצא בנתיב: {image_path}"}

    if not shapes or not vibes:
        return {"error": "לא התקבלו לייבלים תקינים"}

    with open(image_path, "rb") as f:
        base64_data = base64.b64encode(f.read()).decode('utf-8')
        data_uri = f"data:image/jpeg;base64,{base64_data}"

    prompt = f"""Analyze the handwriting. Choose one from {shapes} and one from {vibes}.
    Return ONLY JSON: {{"shape_analysis": {{"category": "", "confidence": ""}}, "vibe_analysis": {{"category": "", "confidence": ""}}}}"""

    response = llm.create_chat_completion(
        messages=[{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": data_uri}}
        ]}],
        response_format={"type": "json_object"}
    )

    return json.loads(response["choices"][0]["message"]["content"])

