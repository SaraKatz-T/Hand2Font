
import os
import cv2
import numpy as np

# -------------------------------------------------------------
#
# סיכום רצף הפעולות:
# זיהוי סגנון הכתב כדי לבחור את השיטה לחלוקת מילים
# חלוקה לשורות ולמילים
# חיבור נקודות קטנות לאותות המתאימות
# חלוקה לאותיות בתוך המילה
# חיתוך האות ונרמול
# חיתוך הדוק סביב הדיו,כך התמונה נקיה משאריות של האותיות מסביבה
#
# ------------------------------------------------------------


def normalize_character_image(image, size=32, margin=5, pad_color=255):
    binary_mask  = cv2.threshold(image, 220, 255, cv2.THRESH_BINARY_INV)[1] # פיסל שקטן מ- 220 נחשב דיו-חלק מהאות , INV- היפוך הצבעים כי כך OpenCV מזהה
    ink_pixels = cv2.findNonZero(binary_mask ) #  מחזיר רשימה של נקודות - הפיקסלים ≠ 0 - האות
    char_image = image
    if ink_pixels is not None:
        x, y, w, h = cv2.boundingRect(ink_pixels)
        char_image = image[y:y + h, x:x + w] # חיתוך הדוק סביב האות

    h, w = char_image.shape[:2]
    if h == 0 or w == 0: # במקרה קצה יוצר תמונה רקע כדי מנוע קריסה בעת ה - resize
        return np.full((size, size), pad_color, dtype=np.uint8)

    max_content_size = size - (margin * 2) # הגודל שהאות יכולה לקבל לאחר הפחתת ה- margin

    scale = max_content_size / max(h, w) # max_content_size - כדי שלא יאבד פורפורציות בשינוי הגודל, מתאימים את הגודל על פי יחס המימד הגדול(גובה / רוחב) ל
    scaled_w, scaled_h = int(w * scale), int(h * scale)  # חישוב הגודל החדש
    scaled_w, scaled_h = max(1, scaled_w), max(1, scaled_h) # מניעת גודל 0 במקרה של אות קטנה מאוד

    resized_char = cv2.resize(char_image, (scaled_w, scaled_h), interpolation=cv2.INTER_AREA) # מקטין את האות בפועל בצורה של ממוצע איזורים

    normalized_image = np.full((size, size), pad_color, dtype=np.uint8) # יוצר תמונה לבנה 32*32
    x_offset = (size - scaled_w) // 2 # מחשב איפה לשים את האות כך שתיהיה באמצע
    y_offset = (size - scaled_h) // 2
    normalized_image[y_offset:y_offset + scaled_h, x_offset:x_offset + scaled_w] = resized_char # הדבקת האות לתמונה

    return normalized_image


def crop_mask_to_ink(binary_mask): # חיתוך המסכה בדיוק לגבולות הדיו
    col_indices = np.nonzero(np.sum(binary_mask, axis=0))[0] # מחזיר את העמודות שיש בהם דיו - Projection
    line_indices = np.nonzero(np.sum(binary_mask, axis=1))[0] # מחזיר את השורות שיש בהם דיו
    if len(col_indices) == 0 or len(line_indices) == 0:
        return binary_mask, {'x': 0, 'y': 0, 'w': 0, 'h': 0}
    y_start, y_end = line_indices[0], line_indices[-1]
    x_start, x_end = col_indices[0], col_indices[-1]
    return binary_mask[y_start:y_end + 1, x_start:x_end + 1], \
        {'x': int(x_start), 'y': int(y_start), 'w': int(x_end - x_start + 1), 'h': int(y_end - y_start + 1)} # +1 כיון שהסוף לא כלול


def sort_words_by_reading_order(boxes):
    """
    מיון הבלוקים- השורות והמילים לפי הסדר

    הגנה מפני רשימה ריקה
    מיון לפי גובה

    lines- המאגר הסופי שיכיל רשימה של שורות (וכל שורה תכיל מילים ממוינות)
    current_line- השורה הסטטית שאנו בונים כרגע (מתחילה עם המילה הגבוהה ביותר)
    reference_box- הקופסה שעל פיה נמדד גובה השורה הנוכחית (העוגן האנכי)

    אם נקודת האמצע של המילה החדשה נמצאת מעל הרצפה של המילה הראשונה בשורה

    אם התנאי לא מתקיים, זאת אומרת ירדנו שורה בדף ואז:
        סוגרים שורה וממינים את השורה על פי ציר הX
       התחלת שורה חדשה
    """

    if not boxes: return []
    sorted_by_y = sorted(boxes, key=lambda b: b['y'])

    lines, current_line, reference_box = [], [sorted_by_y[0]], sorted_by_y[0]
    for current_box in sorted_by_y[1:]:

        if (current_box['y'] + current_box['h'] / 2) < (reference_box['y'] + reference_box['h']):
            current_line.append(current_box)
        else:
            lines.append(sorted(current_line, key=lambda b: b['x']))
            current_line, reference_box = [current_box], current_box
    # מיון השורה האחרונה
    lines.append(sorted(current_line, key=lambda b: b['x']))
    return lines


def calculate_median_horizontal_gap(binary_image, start_y, end_y, median_height):
    row_crop = binary_image[start_y:end_y, :]
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(row_crop) # מציאת רכיבים מחוברים
    if num_labels < 3: return [] # הראשון רקע
    valid = stats[1:][stats[1:, cv2.CC_STAT_HEIGHT] > median_height * 0.2] # מסנן רכיבים קטנים
    if len(valid) < 2: return [] # צריך לפחות 2 רכיבים לחשב רווח
    lefts = valid[:, cv2.CC_STAT_LEFT]
    rights = lefts + valid[:, cv2.CC_STAT_WIDTH]
    idx = np.argsort(lefts)
    return (lefts[idx][1:] - rights[idx][:-1]).tolist()


def is_text_cursive(binary_image, lines, median_height):
    """מחזיר האם הכתב צפוף או מרווח על פי הרווחים בין המילים ביחס לגובה החצינוי של האות"""
    all_gaps = []
    for (s, e) in lines[:5]:
        all_gaps.extend(calculate_median_horizontal_gap(binary_image, s, e, median_height))
    if not all_gaps: return False
    return (np.median(all_gaps) / (median_height if median_height > 0 else 1)) < 0.2 # מחלק את המרווח החציוני בגובה החציוני של האות


def extract_horizontal_lines(binary_image, min_gap):
    """מחלקת לשורות"""
    proj = np.sum(binary_image, axis=1) # סכום הפיקסלים בכל שורה
    thresh = max(1, np.max(proj) * 0.02) # סף לאיפוס רעשי רקע
    pixels = proj > thresh
    lines, is_in, start = [], False, 0
    for y, has in enumerate(pixels):
        if has and not is_in:
            start, is_in = y, True
        elif not has and is_in:
            if (y - start) > min_gap: lines.append((start, y))
            is_in = False
    return lines


def merge_close_lines(raw, dist):
    """מאחדת שורות שפוצלו בטעות- אם השורות עולות אחת על השניה"""
    merged = []
    for s, e in raw:
        if merged and (s - merged[-1][1]) < dist:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged



def expand_box_to_include_dot(b, d):
    min_x, min_y = min(b['x'], d['x']), min(b['y'], d['y'])
    max_x, max_y = max(b['x'] + b['w'], d['x'] + d['w']), max(b['y'] + b['h'], d['y'] + d['h'])
    return {'x': min_x, 'y': min_y, 'w': max_x - min_x, 'h': max_y - min_y}


def find_parent_word_for_dot(dot, words, median_h):
    for i, w in enumerate(words):
        overlap = not (dot['x'] + dot['w'] < w['x'] or dot['x'] > w['x'] + w['w'])
        dist = w['y'] - dot['y']
        if overlap and 0 <= dist < (median_h * 1.5): return i
    return -1


def merge_dots_to_words(raw, median_h):
    thresh = median_h * 0.4
    dots = [b for b in raw if b['h'] < thresh] # רשימת רכיבי נקודות
    normal = [b for b in raw if b['h'] >= thresh] # רשימת מילים או אותיות
    unmerged = []
    for d in dots:
        idx = find_parent_word_for_dot(d, normal, median_h)
        if idx != -1:
            normal[idx] = expand_box_to_include_dot(normal[idx], d)
        else:
            unmerged.append(d) # נקודות שלא מצאו מילה מתאימה
    return normal + unmerged


def _words_dense(binary, lines):
    """מגדירה בלוק לשורה שזוהתה"""
    word_boxes = []
    for (s, e) in lines:
        nz = np.where(np.sum(binary[s:e, :], axis=0) > 0)[0] # חותך את השורה מהתמונה ובודק בכל עמודה אם יש דיו
        # nz[0] - הדיו הראשון מצד שמאל
        # nz[-1]- הדיו הראשון מצד ימין
        if len(nz) > 0: word_boxes.append({'x': int(nz[0]), 'y': s, 'w': int(nz[-1] - nz[0]), 'h': e - s})
    return word_boxes


def _words_spaced(binary, med_h):
    # סוגרת רווחים בין אותיות במילה
    word_mask = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, np.ones((1, max(2, int(med_h * 0.35))), np.uint8))
    # הפונקציה connectedComponents מוצאת את הגושים- המילים
    num, labels = cv2.connectedComponents(word_mask)
    raw_w = []
    for i in range(1, num):
        # מגדירה בלוק לכל מילה
        box = crop_mask_to_ink(np.uint8(labels == i))[1]
        if box['h'] > 5: raw_w.append(box)
        # merge_dots_to_words- מחברת את הנקודות
    return merge_dots_to_words(raw_w, med_h)


def segment_words(image):
    '''
     שינוי גודל באופן פורפורציונלי
    image.shape[0] = גובה מקורי, image.shape[1] = רוחב מקורי

     סינון רעשים קטנים + הפיכת התמונה לרקע שחור ואותיות לבנות
     GaussianBlur - בהתאם להתפלגות גאוסיאנית Kernel מחליקה על יד העברת

      מציאת איים של פיקסלים שנוגעים זה בזה
     הפונקציה מחזירה כמה דברים אך צריך רק את [2] - מטריצת הסטטיסטיקות-
     טבלה שכל רכיב מכיל [X_start, Y_start, Width, Height, Total_Area]

     חישוב הגובה החציוני
     CC_STAT_HEIGHT - עמודה 3 של מטריצת הסטטיסטיקות - הגובה
     1:- החל משורה 1 - לחתוך את הרקע של התמונה

     מפצל את הטיפול לפי אופי הכתב
     זיהוי מילים לפי סוג הכתב אם צפוף חותך מילים על פי רצף פיקסלים אך אם מרווח מזהה אותיות שקרובות אחת לשניה כמילה

    '''

    width = 1240
    resized = cv2.resize(image, (width, int(image.shape[0] * (width / image.shape[1]))))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) # הפיכת התמונה לגווני אפור

    _, binary = cv2.threshold(cv2.GaussianBlur(gray, (3, 3), 0), 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    stats = cv2.connectedComponentsWithStats(binary)[2]

    med_h = np.median(stats[1:, cv2.CC_STAT_HEIGHT]) if len(stats) > 1 else 20 # אם הדף ריק שלא יקרוס בחילוק

    lines = merge_close_lines(extract_horizontal_lines(binary, med_h * 0.3), med_h * 0.5)     # חילוק לשורות

    if is_text_cursive(binary, lines, med_h):
        word_boxes = _words_dense(binary, lines)
    else:
        word_boxes = _words_spaced(binary, med_h)
    return word_boxes, resized, med_h




def is_dot_belonging_to_char(dot_b, char_b, char_mask, med_h):
    gap_y = char_b['y'] - (dot_b['y'] + dot_b['h'])
    dot_cx = dot_b['x'] + (dot_b['w'] // 2)
    tol_x = char_b['w'] * 0.5
    aligned = (char_b['x'] - tol_x) < dot_cx < (char_b['x'] + char_b['w'] + tol_x)

    top_h = max(1, char_b['h'] // 3)
    top_mask = char_mask[char_b['y']: char_b['y'] + top_h, char_b['x']: char_b['x'] + char_b['w']]
    nz_cols = np.where(np.sum(top_mask, axis=0) > 0)[0]
    ink_w = (nz_cols[-1] - nz_cols[0] + 1) if len(nz_cols) > 0 else 0
    return (0 <= gap_y < med_h) and aligned and (ink_w <= dot_b['w'] * 2)


def _is_contained_in_any(box, others):
    for o in others:
        if (o['x'] - 2 <= box['x']) and (o['y'] - 2 <= box['y']) and \
                (o['x'] + o['w'] + 2 >= box['x'] + box['w']) and \
                (o['y'] + o['h'] + 2 >= box['y'] + box['h']):
            return True
    return False


def merge_overlapping_boxes(char_list):
    final = []
    for i, c in enumerate(char_list):
        others = [o['box'] for j, o in enumerate(char_list) if j != i]
        if not _is_contained_in_any(c['box'], others):
            final.append(c)
    return final


def _attach_dots(raw, med_h):
    CELL = max(1, int(med_h))
    buckets = {}
    for i, c in enumerate(raw):
        cx = c['box']['x'] + c['box']['w'] // 2
        buckets.setdefault(cx // CELL, []).append(i)

    merged, used = [], set()
    for index in range(len(raw)):
        if index in used: continue
        m_box, m_masks = raw[index]['box'], [raw[index]['mask']]
        cx = m_box['x'] + m_box['w'] // 2
        k = cx // CELL
        candidates = buckets.get(k - 1, []) + buckets.get(k, []) + buckets.get(k + 1, [])
        for j in sorted(candidates):
            if j <= index or j in used: continue
            if is_dot_belonging_to_char(m_box, raw[j]['box'], raw[j]['mask'], med_h):
                if (max(m_box['y'] + m_box['h'], raw[j]['box']['y'] + raw[j]['box']['h']) - min(
                        m_box['y'], raw[j]['box']['y'])) < med_h * 1.7:
                    m_box = expand_box_to_include_dot(raw[j]['box'], m_box)
                    m_masks.append(raw[j]['mask'])
                    used.add(j)
                    break
        merged.append({'box': m_box, 'masks': m_masks})
        used.add(index)
    return merged


def segment_characters(word_img, med_h):

    if len(word_img.shape) == 3: word_img = cv2.cvtColor(word_img, cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(word_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    raw = []
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] > 2:
            raw.append({'box': {'x': stats[i, cv2.CC_STAT_LEFT], 'y': stats[i, cv2.CC_STAT_TOP],
                                'w': stats[i, cv2.CC_STAT_WIDTH], 'h': stats[i, cv2.CC_STAT_HEIGHT]},
                        'mask': np.uint8(labels == i) * 255}) # זו ה"שבלונה"
    raw.sort(key=lambda c: c['box']['y'])

    merged = _attach_dots(raw, med_h)
    clean = merge_overlapping_boxes(merged)
    clean.sort(key=lambda c: c['box']['x'])
    final = []
    for c in clean:
        mask = np.bitwise_or.reduce(c['masks']) if len(c['masks']) > 1 else c['masks'][0]
        # חיתוך המסכה לגודל המלבן
        char_mask = mask[c['box']['y']:c['box']['y'] + c['box']['h'],
        c['box']['x']:c['box']['x'] + c['box']['w']]
        final.append({'mask': char_mask, 'box': c['box']})
    return final




def save_hierarchical_data(base_path, lines_of_words, resized_image, median_height):
    os.makedirs(base_path, exist_ok=True)

    full_gray = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY) if len(resized_image.shape) == 3 else resized_image

    for l_idx, line in enumerate(lines_of_words):
        line_path = os.path.join(base_path, f"line_{l_idx:02d}")
        os.makedirs(line_path)
        for w_idx, word_box in enumerate(line):
            word_path = os.path.join(line_path, f"word_{w_idx:02d}")
            os.makedirs(word_path)

            word_crop_gray = full_gray[word_box['y']:word_box['y'] + word_box['h'],
            word_box['x']:word_box['x'] + word_box['w']]
            if word_crop_gray.size == 0: continue

            chars = segment_characters(word_crop_gray, median_height)

            for c_idx, char_data in enumerate(chars):
                box = char_data['box']
                char_mask = char_data['mask']
                char_img = word_crop_gray[box['y']:box['y'] + box['h'], box['x']:box['x'] + box['w']]

                if char_img.size == 0: continue

                result_img = np.full_like(char_img, 255)

                # מעתיקים לתוך הרקע רק את הפיקסלים של האות (לפי המסכה)
                result_img[char_mask > 0] = char_img[char_mask > 0]

                char_img_norm = cv2.normalize(result_img.astype(np.float32), None, 0, 255, cv2.NORM_MINMAX).astype(
                    np.uint8)
                final_img = normalize_character_image(char_img_norm, size=32, margin=6, pad_color=255)

                cv2.imwrite(os.path.join(word_path, f"char_{c_idx:02d}.png"), final_img)

























# ----------------------------------------------------------
# לבדיקה
# ------------------------------------------------------------

def draw_word_boxes_for_line(canvas, line_boxes, base, med_h):
    for wb in line_boxes:
        cv2.rectangle(canvas, (wb['x'], wb['y']), (wb['x'] + wb['w'], wb['y'] + wb['h']), (255, 0, 0), 2)
        crop = base[wb['y']:wb['y'] + wb['h'], wb['x']:wb['x'] + wb['w']]
        if crop.size > 0:
            for c in segment_characters(crop, med_h):
                cb = c['box']
                cv2.rectangle(canvas, (wb['x'] + cb['x'], wb['y'] + cb['y']),
                              (wb['x'] + cb['x'] + cb['w'], wb['y'] + cb['y'] + cb['h']), (0, 0, 255), 1)


def process_and_debug_image(input_p, output_p):
    # טעינת התמונה
    img = cv2.imread(input_p)
    if img is None:
        print(f" שגיאה: לא הצלחתי לטעון את התמונה בנתיב: {input_p}")
        return

    # הרצת הסגמנטציה
    word_boxes, resized, med_h = segment_words(img)
    lines = sort_words_by_reading_order(word_boxes)

    # וודוא שהתיקייה קיימת לפני השמירה
    os.makedirs(output_p, exist_ok=True)

    # --- יצירת תמונת הדיבאג ---
    debug_canvas = resized.copy()
    for line in lines:
        draw_word_boxes_for_line(debug_canvas, line, resized, med_h)

    # הגדרת נתיב הקובץ ושמירה
    debug_file_path = os.path.join(output_p, "segmentation_debug.png")
    success = cv2.imwrite(debug_file_path, debug_canvas)

    if success:
        print(f" תמונת הדיבאג נשמרה בהצלחה בנתיב: {os.path.abspath(debug_file_path)}")
    else:
        print(f" שגיאה: נכשלה שמירת תמונת הדיבאג בנתיב: {debug_file_path}")

    # שמירת האותיות בתיקיות (היררכיה)
    save_hierarchical_data(output_p, lines, resized, med_h)
    print(f" האותיות החתוכות נשמרו בתיקייה: {os.path.abspath(output_p)}")


# הערה: פונקציה זו אינה בשימוש בפועל בקוד
def tight_crop_grayscale(img, threshold_val=150):  # הורדתי ל-150 כדי להתעלם מהילה אפורה
    """חיתוך הדוק שמתמקד רק בחלקים הכהים באמת של האות."""
    # הופכים לבינארי הפוך - רק מה שכהה מ-150 הופך ל"דיו"
    binary = cv2.threshold(img, threshold_val, 255, cv2.THRESH_BINARY_INV)[1]
    coords = cv2.findNonZero(binary)
    if coords is None:
        return img
    x, y, w, h = cv2.boundingRect(coords)
    # מוסיפים "באפר" קטן של פיקסל אחד לכל צד כדי לא לחתוך את קצוות האות האפורה
    return img[max(0, y):min(img.shape[0], y + h), max(0, x):min(img.shape[1], x + w)]


if __name__ == "__main__":

    INPUT_IMAGE_PATH="../../images/Belli_Florsheim.bmp"
    OUTPUT_DIRECTORY="Belli_Florsheim"

    if not os.path.exists(INPUT_IMAGE_PATH):
        print(f" שים לב: הקובץ '{INPUT_IMAGE_PATH}' לא נמצא בתיקייה הנוכחית.")
    else:
        process_and_debug_image(INPUT_IMAGE_PATH, OUTPUT_DIRECTORY)
        print("--- הסתיים! בדוק את התיקייה שנוצרה ---")