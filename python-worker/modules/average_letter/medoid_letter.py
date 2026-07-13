
import os
import shutil
import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt


def center_letter(img_bin, size=(128, 128)):
    """ממרכז את האות בפריים אחיד — לצורך חישוב SDF"""
    ink_pixels = cv2.findNonZero(img_bin)
    if ink_pixels is None:
        return np.zeros(size, dtype=np.uint8)

    x, y, w, h = cv2.boundingRect(ink_pixels)
    letter_crop = img_bin[y:y + h, x:x + w]

    centered = np.zeros(size, dtype=np.uint8)
    scale = min((size[0] * 0.8) / w, (size[1] * 0.8) / h)
    nw, nh = int(w * scale), int(h * scale)
    letter_res = cv2.resize(letter_crop, (nw, nh), interpolation=cv2.INTER_AREA)

    y_offset = (size[1] - nh) // 2
    x_offset = (size[0] - nw) // 2
    centered[y_offset:y_offset + nh, x_offset:x_offset + nw] = letter_res
    return centered


def load_letter_images(folder_path, sdf_size=(128, 128)):
    """
    טוען את כל התמונות בתיקייה.
    מחזיר: רשימה של (שם_קובץ, מטריצה_בינארית_ממורכזת)
    המטריצה היא רק לחישוב SDF — הקובץ המקורי לא נגעים בו.
    """
    items = []
    for filename in sorted(os.listdir(folder_path)):
        if not filename.lower().endswith((".png", ".jpg", ".jpeg")):
            continue

        filepath = os.path.join(folder_path, filename)
        img = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
        if img is None:
            print(f"  [אזהרה] לא ניתן לטעון: {filename}")
            continue

        _, img_bin = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        centered = center_letter(img_bin, size=sdf_size)
        binary = (centered > 0).astype(np.float32)
        items.append((filename, binary))

    return items


def compute_sdf(mat):

    dist_outside = distance_transform_edt(mat == 0)
    dist_inside  = distance_transform_edt(mat == 1)
    return dist_outside - dist_inside


def find_medoid(letter_folder):
    """
        מוצא את האות הכי מייצגת (Medoid) מבין כל הוריאציות בתיקייה.

        לוגיקה - O(N × H×W):
        1. ממיר כל אות ל-SDF (מרחק חתום)
        2. מחשב את ממוצע כל ה-SDFים = מרכז הכובד
        3. בוחר את האות הכי קרובה למרכז הכובד
        """

    items = load_letter_images(letter_folder, sdf_size=(128, 128))

    if not items:
        return None

    if len(items) == 1:
        return items[0][0]

    sdf_vectors = np.array([compute_sdf(mat).ravel() for _, mat in items])  # (N, H*W)

    mean_sdf = sdf_vectors.mean(axis=0)

    distances = np.linalg.norm(sdf_vectors - mean_sdf, axis=1)
    medoid_idx = int(np.argmin(distances))
    medoid_filename = items[medoid_idx][0]

    print(f"  ✓ Medoid: {medoid_filename} | N={len(items)} | מרחק מממוצע={distances[medoid_idx]:.1f}")

    return medoid_filename


def process_all_letters(input_sorted_folder, output_folder):
    """
        עובר על כל תת-תיקייה (= אות), מוצא את ה-Medoid,
        ומעתיק את הקובץ המקורי ישירות לתיקיית הפלט — ללא שום עיבוד.
        """
    os.makedirs(output_folder, exist_ok=True)
    if not os.path.exists(input_sorted_folder):
        print(f"[Medoid] שגיאה: תיקייה לא נמצאה: {input_sorted_folder}")
        return

    letter_dirs = sorted([
        d for d in os.listdir(input_sorted_folder)
        if os.path.isdir(os.path.join(input_sorted_folder, d))
    ])

    if not letter_dirs:
        print("[Medoid] לא נמצאו תתי-תיקיות של אותיות.")
        return

    print(f"[Medoid] נמצאו {len(letter_dirs)} אותיות לעיבוד\n")

    for letter_name in letter_dirs:
        letter_path = os.path.join(input_sorted_folder, letter_name)
        print(f"[Medoid] מעבד: {letter_name}")

        medoid_filename = find_medoid(letter_path)

        if medoid_filename is None:
            print(f"  [דילוג] תיקייה ריקה: {letter_name}")
            continue

        # העתקה ישירה של הקובץ המקורי — אפס עיבוד, אפס שינוי
        src_path = os.path.join(letter_path, medoid_filename)
        dst_path = os.path.join(output_folder, f"{letter_name}.png")
        shutil.copy2(src_path, dst_path)

    print(f"\n[Medoid] הסתיים! תוצאות נשמרו ב: {output_folder}")



















if __name__ == '__main__':
    INPUT_FOLDER = "../letter_recognition/Efrat_Malachi_combined2"
    OUTPUT_FOLDER = "medoid_letters__Efrat_Malachi_combined2_3"

    print(f"מתחיל חיפוש Medoid: {INPUT_FOLDER}\n")
    process_all_letters(INPUT_FOLDER, OUTPUT_FOLDER)