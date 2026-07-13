import os
import cv2
import numpy as np
# import schneider
from . import schneider



def smooth_points(points, window_size=5):
    if len(points) < window_size:
        return points
    smoothed = np.copy(points)
    for i in range(len(points)):
        # מחשב את החלון- אינדקסיהסביבה עבור הנקודה הנוכחית i
        idx = np.arange(i - window_size // 2, i + window_size // 2 + 1) % len(points)
        smoothed[i] = np.mean(points[idx], axis=0)
    return smoothed


def douglas_peucker(points, epsilon=1.5):
    if len(points) < 3:
        return points
    simplified = cv2.approxPolyDP(points.astype(np.float32), epsilon, closed=True) # closed=True - לחייב להשאיר את הראשונה והאחרונה
    return simplified.reshape(-1, 2).astype(float)   # החזרה כדו מימדי ולא תלת- (-1, 2)


def get_all_contours(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None: raise FileNotFoundError(f"לא נמצאה תמונה: {image_path}")

    scale = 20
    img = cv2.resize(img, (img.shape[1] * scale, img.shape[0] * scale), interpolation=cv2.INTER_LANCZOS4)

    img = cv2.GaussianBlur(img, (45, 45), 0)

    _, binary = cv2.threshold(img, 180, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((7, 7), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

    # חילוץ קונטורים
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    if not contours: return [], None
    formatted_contours = [c.reshape(-1, 2).astype(float) for c in contours]
    return formatted_contours, hierarchy[0]


def normalize_all_contours(contours_list, target_size=1000, margin=50):
    if not contours_list: return []
    all_pts = np.vstack(contours_list)
    min_x, min_y = np.min(all_pts, axis=0)
    max_x, max_y = np.max(all_pts, axis=0)
    width, height = max_x - min_x, max_y - min_y
    scale = (target_size - 2 * margin) / max(width, height, 1)

    normalized = []
    for c in contours_list:
        norm_c = (c - [min_x, min_y]) * scale + [margin, margin]
        normalized.append(norm_c)
    return normalized


def image_to_svg_pipeline(image_path, output_name):
    print(f"--- מעבד את האות: {image_path} ---")

    contours, hierarchy = get_all_contours(image_path)
    if not contours or hierarchy is None:
        print("לא נמצאה צורה.")
        return

    main_contour_area = max([cv2.contourArea(c.astype(np.float32)) for c in contours])

    # סינון וסידור היררכיה
    filtered_contours = []
    new_hierarchy = []
    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt.astype(np.float32))
        if area > main_contour_area * 0.01:  # שמירה על חלקים משמעותיים בלבד
            filtered_contours.append(cnt)
            new_hierarchy.append(hierarchy[i])

    if not filtered_contours: return

    normalized_contours = normalize_all_contours(filtered_contours, target_size=1000)

    svg_paths = []
    total_curves = 0

    for i, stroke in enumerate(normalized_contours):
        # דילול והחלקה למניעת זיגזג
        simplified = douglas_peucker(stroke, epsilon=1.5)
        smart_points = smooth_points(simplified, window_size=7)

        if not np.array_equal(smart_points[0], smart_points[-1]):
            smart_points = np.vstack([smart_points, smart_points[0]])

        # יצירת עקומות בזייה
        beziers = schneider.fitCurve(smart_points, 15.0)

        # הדפסת מידע על החלק הנוכחי (כפי שביקשת)
        num_in_stroke = len(beziers)
        total_curves += num_in_stroke
        part_type = "חור פנימי" if new_hierarchy[i][3] != -1 else "קו חיצוני"
        print(f"  חלק {i + 1} ({part_type}): נוצרו {num_in_stroke} עקומות.")

        path_data = ""
        for b in beziers:
            p0, p1, p2, p3 = b
            if path_data == "": path_data += f"M {p0[0]},{p0[1]} "
            path_data += f"C {p1[0]},{p1[1]} {p2[0]},{p2[1]} {p3[0]},{p3[1]} "
        path_data += "Z "
        svg_paths.append(path_data)

    print(f"סה\"כ עקומות לאות: {total_curves}")
    save_complex_svg(svg_paths, output_name, 1000, 1000)


def save_complex_svg(paths_data, output_full_path, w, h):
    # יוצר את תיקיית היעד אם היא לא קיימת
    os.makedirs(os.path.dirname(output_full_path), exist_ok=True)

    with open(output_full_path, "w") as f:
        f.write(f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">\n')
        combined_path = "".join(paths_data)
        f.write(f'  <path d="{combined_path}" fill="black" fill-rule="evenodd" />\n')
        f.write('</svg>')

    # עכשיו אנחנו מדפיסים את המשתנה החדש שקיבלנו מה-Worker
    print(f"הקובץ נשמר ב: {output_full_path}\n")


def process_averaged_letters_to_svg(input_avg_folder, output_svg_folder):
    os.makedirs(output_svg_folder, exist_ok=True)

    for filename in os.listdir(input_avg_folder):
        if filename.lower().endswith(".png"):
            image_path = os.path.join(input_avg_folder, filename)
            # יוצר נתיב מלא לקובץ ה-SVG החדש
            svg_path = os.path.join(output_svg_folder, os.path.splitext(filename)[0] + ".svg")
            image_to_svg_pipeline(image_path, svg_path)


















# בדיקה
if __name__ == "__main__":
    # --- הגדרות ---
    # כאן תוכלי לשנות בקלות את הנתיבים שלך
    # INPUT_FOLDER = "../average_letter/averaged_letters_output_Yael_Cohen_1_median"  # נתיב לתיקיית התמונות
    # OUTPUT_FOLDER = "svg_output_Yael_Cohen_1_median"  # נתיב לתיקיית היעד ל-SVG
    INPUT_FOLDER = "../average_letter/medoid_letters__Efrat_Malachi_combined2_2"  # נתיב לתיקיית התמונות
    OUTPUT_FOLDER = "SVG__Efrat_Malachi_combined2_2"  # נתיב לתיקיית היעד ל-SVG

    print(f"--- מתחיל עיבוד לכל התיקייה: {INPUT_FOLDER} ---")
    process_averaged_letters_to_svg(INPUT_FOLDER, OUTPUT_FOLDER)
    print("סיום עיבוד כל הקבצים.")