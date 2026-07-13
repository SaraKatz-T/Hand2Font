import os
import base64
from itertools import chain

import requests
import cv2
import numpy as np

from modules.letter_extraction.Segmentation import (
    segment_words, sort_words_by_reading_order, segment_characters, normalize_character_image,
)
from modules.letter_recognition.predict_EfficientNet_b1 import (   # שם הקובץ בלי מקף!
    load_model, recognize, _char_to_canonical,
)
from config.settings import GOOGLE_VISION_API_KEY


def correct_orientation(image):
    """
    מסובב את התמונה כך שהשורות אופקיות, אם נסרקה לצד
    החזרת תמונה בערוץ אחד

    הפיכה לבינארית -
    THRESH_OTSU-  מחשב לבד את סף ההפרדה האפטימילי בין הנייר לדיו על ידי היסטוגרמה
    THRESH_BINARY_INV - הופך צבעים - קל יותר לחשב כמה טקסט יש באיזור מסוים

    np.var - שונות - מדד לפיזור הנתונים
    ערך גבוה = שינויים חדים וקיצוניים - שורות
    ערך נמוך = ערכים יציבים וקרובים לממוצע - עמודות
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image

    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    if np.var(binary.sum(axis=0)) > np.var(binary.sum(axis=1)):
        image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE) # סיבוב
    return image


def _flatten(items, key):
    """משטח רמה אחת: מכל פריט מחזיר את רשימת הילדים שלו תחת key."""
    for item in items:
        yield from item.get(key, [])


def _iter_vision_symbols(annotation):
    """מחזיר סמל-אחר-סמל ממבנה Vision, ע""י שרשור משטוחים — בלי קינון."""
    level = annotation.get("pages", [])
    for key in ("blocks", "paragraphs", "words", "symbols"):
        level = _flatten(level, key)
    return level


def _vision_request(image, api_key):
    """שולח את התמונה ל-Vision ומחזיר את אובייקט ה-annotation."""
    ok, buf = cv2.imencode(".png", image)
    if not ok:
        raise RuntimeError("נכשל קידוד התמונה ל-PNG")
    content = base64.b64encode(buf).decode("utf-8")

    url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
    payload = {"requests": [{"image": {"content": content},
                             "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]}]}
    resp = requests.post(url, json=payload, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"Vision API {resp.status_code}:\n{resp.text}")
    first = resp.json().get("responses", [{}])[0]
    if "error" in first:
        raise RuntimeError(f"Vision API error: {first['error']}")
    return first.get("fullTextAnnotation", {})


def _symbol_to_record(symbol):
    """ממיר אוביקט שהגיע מגוגל למילון מאפיינים נקי"""
    # חילוץ נתונים מה-JSON
    char = symbol.get("text", "")
    conf = symbol.get("confidence", 0.0)
    brk = symbol.get("property", {}).get("detectedBreak", {}).get("type")
    verts = symbol.get("boundingBox", {}).get("vertices", [])
    # מחזירה רווח אם לא מצאה אות
    if not (char.isalnum() and len(verts) >= 4):
        return None, brk
    # גוגל מחזירה רשימה של 4 קודקודים ואנו רוצים להפוך למלבן
    xs = [v.get("x", 0) for v in verts]
    ys = [v.get("y", 0) for v in verts]
    return ({"char": char,
            "confidence": conf,
            "break": brk,
            "box": {"x": min(xs),             # הנקודה השמאלית ביותר
                    "y": min(ys),             # הנקודה העליונה ביותר
                    "w": max(xs) - min(xs),   # רוחב המלבן החוסם
                    "h": max(ys) - min(ys)}}, # גובה המלבן החוסם
            brk)


def get_vision_symbols(image, api_key, min_confidence=0.0):
    """מחלצת רשימת אותיות מובנית מ-Google Vision API תוך סינון לפי רמת ביטחון
    ושמירה קפדנית על רווחים בין מילים ושורות"""
    if image is None:
        raise ValueError("התקבלה תמונה ריקה")

    annotation = _vision_request(image, api_key) # הפניה לגוגל ויז'ן

    symbols = []
    for symbol in _iter_vision_symbols(annotation):
        record, brk = _symbol_to_record(symbol) # חילוץ המאפיינים
        # האות לא ריקה ועוברת את סף הביטחון
        if record is not None and record["confidence"] >= min_confidence:
            symbols.append(record)
        # האות נזרקה אך החזיקה רווח?
        elif brk and symbols:
            # נשרשר את הרווח לאות האחרונה ששמרנו
            symbols[-1]["break"] = brk  # לא לאבד את הרווח של סמל שדולג
    return symbols


def _center_in(box, container):
    cx, cy = box["x"] + box["w"] / 2, box["y"] + box["h"] / 2
    return (container["x"] <= cx <= container["x"] + container["w"] and
            container["y"] <= cy <= container["y"] + container["h"])


def _overlap_frac(inner, outer):
    ix1, iy1 = max(inner["x"], outer["x"]), max(inner["y"], outer["y"])
    ix2 = min(inner["x"] + inner["w"], outer["x"] + outer["w"])
    iy2 = min(inner["y"] + inner["h"], outer["y"] + outer["h"])
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    area = inner["w"] * inner["h"]
    return (iw * ih) / area if area > 0 else 0.0


def _scale_box(box, s):
    return {"x": box["x"] * s, "y": box["y"] * s, "w": box["w"] * s, "h": box["h"] * s}


def _match_piece(piece_box, symbols):
    """משייכים את החתיכה לאות שהמרכז שלה הכי קרוב, מבין אלו שהחתיכה נוגעת בהן."""
    cx = piece_box["x"] + piece_box["w"] / 2
    cy = piece_box["y"] + piece_box["h"] / 2
    best, best_d = None, None
    for s in symbols:
        if _overlap_frac(piece_box, s["box"]) > 0:
            sx = s["box"]["x"] + s["box"]["w"] / 2
            sy = s["box"]["y"] + s["box"]["h"] / 2
            d = (cx - sx) ** 2 + (cy - sy) ** 2
            if best is None or d < best_d:
                best, best_d = s, d
    return best


def _is_merged_piece(piece_box, symbols, min_overlap=0.3):
    """חתיכה נחשבת 'מחוברת' אם מרכזי שתי אותיות או יותר נופלים בתוכה."""
    centers = [s for s in symbols
               if _center_in(s["box"], piece_box) and _overlap_frac(s["box"], piece_box) >= min_overlap]
    return len(centers) >= 2


def _render_pieces(full_gray, pieces):
    """מאחד חתיכה אחת או כמה לתמונת אפור אחת על רקע לבן. דיו מקורי בלבד."""
    xs0 = min(p["box"]["x"] for p in pieces)
    ys0 = min(p["box"]["y"] for p in pieces)
    xs1 = max(p["box"]["x"] + p["box"]["w"] for p in pieces)
    ys1 = max(p["box"]["y"] + p["box"]["h"] for p in pieces)
    canvas = np.full((ys1 - ys0, xs1 - xs0), 255, dtype=np.uint8)
    for p in pieces:
        b, m = p["box"], p["mask"]
        src = full_gray[b["y"]:b["y"] + b["h"], b["x"]:b["x"] + b["w"]]
        oy, ox = b["y"] - ys0, b["x"] - xs0
        roi = canvas[oy:oy + b["h"], ox:ox + b["w"]]
        roi[m > 0] = src[m > 0]
    return canvas

def _save_labeled(output_dir, label, box, img):
    """שומר אות מתויגת בתיקייה לפי האות (סיומת _upper לאות גדולה)."""
    folder_name = f"{label}_upper" if label.isupper() else label
    folder_path = os.path.join(output_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    cv2.imwrite(os.path.join(folder_path, f"char_{box['x']}_{box['y']}.png"), img)


#-----------------------------------
# הכרעה והרכבת טקסט
def _resolve_label(ef_char, vision_char):
    """מחזיר תווית רק כשהמודל ו-Vision מסכימים על האות. אחרת לא נשמר"""
    ef_canon = _char_to_canonical(ef_char)
    vis_canon = _char_to_canonical(vision_char)
    if vis_canon is not None and ef_canon == vis_canon:
        return vision_char
    return None


def assemble_text(symbols, label_by_symbol):
    """מרכיב את הטקסט מאותיות שהמודל זיהה, לפי סדר ומבנה הרווחים של Vision."""
    parts = []
    for s in symbols:
        parts.append(label_by_symbol.get(s["idx"], s["char"]))   # אות המודל, ובהיעדרה - של Vision
        brk = s.get("break")
        if brk in ("SPACE", "SURE_SPACE"):
            parts.append(" ")
        elif brk in ("EOL_SURE_SPACE", "LINE_BREAK"):
            parts.append("\n")
    return "".join(parts).strip()




def _word_pieces(wb, full_gray, med_h):
    """חתיכות החילוץ של מילה אחת, בקואורדינטות התמונה המלאה."""
    word_crop = full_gray[wb["y"]:wb["y"] + wb["h"], wb["x"]:wb["x"] + wb["w"]]
    if word_crop.size == 0:
        return
    for ch in segment_characters(word_crop, med_h):
        box, mask = ch["box"], ch["mask"]
        if box["w"] > 0 and box["h"] > 0:
            yield {"box": {"x": wb["x"] + box["x"], "y": wb["y"] + box["y"],
                           "w": box["w"], "h": box["h"]}, "mask": mask}


def _collect_pieces(lines, full_gray, med_h):
    """אוסף את כל חתיכות החילוץ מכל המילים בכל השורות """
    pieces = []
    for wb in chain.from_iterable(lines):
        pieces.extend(_word_pieces(wb, full_gray, med_h))
    return pieces


def _group_pieces_by_symbol(pieces, symbols, output_dir, full_gray, drop_merged, keep_rejected):
    """משייך כל חתיכה לאות של Vision, מסנן חתיכות מפושלות - מחובר או לכלוך"""
    # pieces - החתוכים מהקוד שלי
    # symbols - הזיוהי של גוגל
    groups = {}
    for p in pieces:
        # בדיקה שחתיכה לא מכילה כמה אותיות
        if not (drop_merged and _is_merged_piece(p["box"], symbols)):
            # בדיקה שהחתיכה לא לכלוך
            sym = _match_piece(p["box"], symbols)
            if sym is not None:
                groups.setdefault(sym["idx"], {"sym": sym, "pieces": []})["pieces"].append(p)
    return groups


def _classify_group(g, full_gray, model, device):
    """מזהה קבוצת-חתיכות במודל ומחזיר (אות-המודל, תווית-סופית, תמונה-מנורמלת)."""
    # איחוד
    crop = _render_pieces(full_gray, g["pieces"])
    norm = cv2.normalize(crop.astype(np.float32), None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    ef_char, _ = recognize(norm, model, device)              # זיהוי ראשי - המודל
    label = _resolve_label(ef_char, g["sym"]["char"])
    final = normalize_character_image(norm, size=32, margin=6, pad_color=255)
    return ef_char, label, final


def _classify_and_save(groups, output_dir, full_gray, model, device, keep_rejected):
    """לכל קבוצה: מזהה, שומר בהסכמה, ומחזיר (saved, stats, label_by_symbol)."""
    label_by_symbol = {}
    for g in groups.values():
        ef_char, label, final = _classify_group(g, full_gray, model, device) # ניבוי באמצעות EfficientNet
        label_by_symbol[g["sym"]["idx"]] = ef_char
        # אם המודל המקומי וגוגל אומרים את אותו הדבר
        if label is not None:
            _save_labeled(output_dir, label, g["pieces"][0]["box"], final)
    return label_by_symbol



def run_pipeline(image_path, api_key, output_dir, model, device,
                 target_width=1240, min_confidence=0.0,
                 drop_merged=True, keep_rejected=True):
    #--------------------------------
    # קריאה לתמונה ויישור במידת הצורך
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"לא ניתן לטעון את התמונה: {image_path}")
    img = correct_orientation(img) #אם נסרקה לצד, מסובב את התמונה כך שהשורות אופקיות
    orig_w = img.shape[1] # גודל תמונה
    #---------------------------------
    # הפעלת הסגמנטציה כדי למצוא שורות ומילים
    word_boxes, resized, med_h = segment_words(img)
    lines = sort_words_by_reading_order(word_boxes) # מיון
    # המרה לערוץ אפור יחיד מתבצעת על ידי שקלול מתמטי של שלושת ערוצי הצבע (59% ירוק, 30% אדום, 11% כחול) לפי רמת הרגישות של עין האדם
    full_gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized
    #-----------------------------------
    # שליחת התמונה ל- Google Vision וקבלת רשימת אובייקטים המכילים מיקום ותו מנובא(symbols)
    scale = target_width / orig_w
    symbols = get_vision_symbols(img, api_key, min_confidence)
    # התאמת קנה מידה בין המיקומים של גוגל למיקומים המקומים
    for idx, s in enumerate(symbols):
        s["box"] = _scale_box(s["box"], scale)
        s["idx"] = idx
    print(f"Vision זיהה {len(symbols)} אותיות.")
    # -------------------------------------
    # חותך את האותיות
    # מתאים בין VISION לתוצאות החיתוך מה- segmentation
    # הפעלת ה-EfficientNet
    # ושמירה לתקיות
    pieces = _collect_pieces(lines, full_gray, med_h) # חיתוך
    #התאמה
    groups = _group_pieces_by_symbol(
        pieces, symbols, output_dir, full_gray, drop_merged, keep_rejected)
    # זיהוי ושמירה
    label_by_symbol = _classify_and_save(
        groups, output_dir, full_gray, model, device, keep_rejected)
    #------------------------------------------
    # הרכבת הטקסט לתיוג BART
    # הרכבת הטקסט והפיכה לקטנות- המודל לא מבדיל בין קטן לגדול באותיות דומות
    text = assemble_text(symbols, label_by_symbol).lower()
    # פתיחת קובץ והעתקת הטקסט
    with open(os.path.join(output_dir, "recognized_text.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    # -----------------------------------------------
    # נתונים סטטיסטים לבדיקה
    # חישוב סך התווים שבהם המודל המקומי וגוגל נפגשו (הסכמות + אי הסכמות)
    # total = stats["agree"] + stats["disagree"]
    # # חישוב אחוז ההסכמה
    # rate = (100 * stats["agree"] / total) if total else 0
    # print(f"נשמרו {saved} (הסכמה) | {stats['disagree']} אי-הסכמה ב-_disagreement | "
    #       f"מחוברות {merged_n} | ללא התאמה {unmatched_n}")
    # print(f"אחוז הסכמה EfficientNet<->Vision: {rate:.1f}%")
    # print(f"טקסט שזוהה: {text!r}")

    # return saved, stats, text
    return text


































#------------------------------------------
# לבדיקה
#------------------------------------------
if __name__ == "__main__":
    if not GOOGLE_VISION_API_KEY:
        raise SystemExit("חסר GOOGLE_VISION_API_KEY ב-config/settings.py")
    IMAGE_PATH = "../../images/Efrat_Malachi.BMP"
    OUTPUT_DIR = "Efrat_Malachi_combined2"

    model, device = load_model()
    run_pipeline(IMAGE_PATH, GOOGLE_VISION_API_KEY, OUTPUT_DIR, model, device)