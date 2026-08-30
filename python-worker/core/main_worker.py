
import os
import pika
import json
import traceback
import sys
import time
from concurrent.futures import ThreadPoolExecutor

# הוספת נתיב הפרויקט ל-PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import *
from modules.letter_extraction.Segmentation import process_and_debug_image
from modules.letter_recognition.predict_EfficientNet_b1 import load_model, recognize
from modules.letter_recognition.recognition_pipeline import run_pipeline
from modules.average_letter.medoid_letter import process_all_letters
from modules.svg_builder.svg_builder import process_averaged_letters_to_svg
from modules.ttf_generator import generate_ttf

# ייבוא מודולי ה-AI
from modules.style_analyzer.llava_next import get_llm_instance, classify_handwriting
from modules.style_analyzer.BART import get_text_style
from transformers import pipeline

# ---------------------------------------------------------------------------
# טעינת מודלים גלובלית — פעם אחת בהפעלה
# ---------------------------------------------------------------------------
print("\n[System] Initializing Heavy AI Models (CPU Optimization Mode)...")

llm        = None
classifier = None

try:
    print(f" [LLaVA] Loading from: {LLAVA_MODEL_PATH}")
    llm = get_llm_instance(LLAVA_MODEL_PATH, LLAVA_CLIP_PATH)
    print(" [LLaVA] Visual model loaded successfully.")
except Exception as e:
    print(f" [!] Error loading LLaVA: {e}")

try:
    print(f" [BART] Loading from: {BART_MODEL_PATH}")
    classifier = pipeline(
        "zero-shot-classification",
        model=BART_MODEL_PATH,
        tokenizer=BART_MODEL_PATH,
        device=-1,
    )
    print(" [BART] Text model loaded successfully.")
except Exception as e:
    print(f" [!] Error loading BART: {e}")


_tagging_pool = ThreadPoolExecutor(max_workers=1)

def send_status_to_java(font_id, status, final_path="",
                        geo="", content="", expression=""):
    try:
        conn = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=600))
        ch   = conn.channel()
        ch.queue_declare(queue='font_status_updates', durable=True)
        clean_path = str(final_path).replace("\\", "/")
        message = f"{font_id}|{status}|{clean_path}|{geo}|{content}|{expression}"
        ch.basic_publish(exchange='', routing_key='font_status_updates', body=message)
        conn.close()
        print(f"[RabbitMQ] {message}")
    except Exception as e:
        print(f"[!] RabbitMQ Error: {e}")


def run_tagging(font_id, image_path, recognized_text, geometric_labels, content_labels, expression_labels):
    default_geo = geometric_labels[0] if geometric_labels else 'round'
    default_content = content_labels[0] if content_labels else 'formal and official'
    default_expr = expression_labels[0] if expression_labels else 'mature'
    ai = {'geo': default_geo, 'content': default_content, 'expr': default_expr}
    t0 = time.perf_counter()
    try:
        if llm and geometric_labels and expression_labels:
            res = classify_handwriting(llm, image_path, geometric_labels, expression_labels)
            ai['geo'] = res.get("shape_analysis", {}).get("category", default_geo)
            ai['expr'] = res.get("vibe_analysis", {}).get("category", default_expr)
        if classifier and content_labels:
            ai['content'] = get_text_style(classifier, recognized_text, content_labels)
        send_status_to_java(font_id, "TAGGED",
                            geo=ai['geo'], content=ai['content'], expression=ai['expr'])

    except Exception as e:
        print(f"[!] Tagging failed for job {font_id}: {e}")


def callback(ch, method, properties, body):
    font_id = "Unknown"
    try:
        data        = json.loads(body.decode())
        font_id     = data.get('font_id')
        font_uuid   = data.get('font_uuid')
        font_name   = data.get('font_name', 'MyCustomFont')
        image_path = data.get('image_path')
        target_path = data.get('target_path')
        geometric_labels = data.get('geometric_labels', [])
        content_labels = data.get('content_labels', [])
        expression_labels = data.get('expression_labels', [])

        print(f"\n[*] Starting Job ID: {font_id}")
        send_status_to_java(font_id, "PROCESSING")
        t_create = time.perf_counter()

        temp_workdir = os.path.join(os.getcwd(), "ai_logs", f"work_{font_uuid}")
        paths = {name: os.path.join(temp_workdir, name)
                 for name in ["crops", "sorted", "medoid", "svgs"]}
        for p in paths.values():
            os.makedirs(p, exist_ok=True)

        print("[Main] Step 2: Recognition Pipeline...")
        model, device = load_model()
        recognized_text = run_pipeline(
            image_path=image_path, api_key=GOOGLE_VISION_API_KEY,
            output_dir=paths["sorted"], model=model, device=device,
        )

        print("[Main] Step 3: Medoid selection...")
        process_all_letters(paths["sorted"], paths["medoid"])

        print("[Main] Step 4: SVG generation...")
        process_averaged_letters_to_svg(paths["medoid"], paths["svgs"])

        print("[Main] Step 5: TTF generation...")
        generate_ttf(FONTFORGE_EXE, paths["svgs"], target_path, font_name)

        if not os.path.exists(target_path):
            raise FileNotFoundError(f"TTF לא נוצר: {target_path}")

        creation_time = time.perf_counter() - t_create      # סיום מדידת זמן היצירה
        send_status_to_java(font_id, "COMPLETED", final_path=target_path)
        print(f"[V] Font ready in {creation_time:.1f}s — tagging dispatched to background.")

        _tagging_pool.submit(
            run_tagging, font_id, image_path, recognized_text,
            geometric_labels, content_labels, expression_labels
        )

    except Exception as e:
        print(f"[X] Error in job {font_id}: {e}")
        traceback.print_exc()
        send_status_to_java(font_id, "FAILED")


def start_worker():
    conn    = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=600))
    channel = conn.channel()
    channel.queue_declare(queue='font_tasks', durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='font_tasks', on_message_callback=callback, auto_ack=True)
    print("\n [*] Waiting for messages. Press CTRL+C to exit.")
    channel.start_consuming()


if __name__ == "__main__":
    start_worker()