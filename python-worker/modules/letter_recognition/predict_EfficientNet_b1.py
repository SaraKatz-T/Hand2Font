# -------------------------------
#   זיהוי אות - EfficientNet-B1
# -------------------------------
import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from itertools import chain
from config.settings import Efficientnet_MODEL_PATH



def _collapse_label(label):
    """מאחד אותיות גדולות/קטנות זהות צורנית (כמו באימון)."""
    mapping = {38: 12, 45: 19, 46: 20, 47: 21, 48: 22, 50: 24,
               51: 25, 54: 28, 56: 30, 57: 31, 58: 32, 59: 33, 61: 35}
    return mapping.get(label, label)


def _emnist_to_char(label):
    """ממיר מספר תווית EMNIST לתו: 10-35 -> A-Z, 36-61 -> a-z."""
    if label < 36:
        return chr(ord('A') + label - 10)
    return chr(ord('a') + label - 36)


# סדר המחלקות חייב להיות זהה לאימון: קבוצת התוויות המאוחדות, ממוינת
_CLASS_LABELS = sorted({_collapse_label(i) for i in range(10, 62)})
IDX_TO_CHAR = [_emnist_to_char(label) for label in _CLASS_LABELS]
NUM_CLASSES = len(IDX_TO_CHAR)  # 39

_NORMALIZE = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def load_model(model_path=Efficientnet_MODEL_PATH):
    """טוען את מודל EfficientNet-B1 המאומן ומחזיר אותו במצב הערכה."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.efficientnet_b1(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, NUM_CLASSES)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device).eval()
    return model, device


def _prepare_letter(gray_img, target_size=240):
    """מכין תמונת אות אפורה לקלט המודל, בעיבוד זהה לאימון:
    האות הופכת לבהירה על רקע כהה, מנורמלת, וממורכזת ב-75% מהפריים."""
    if np.mean(gray_img) > 127:               # אות כהה על רקע בהיר -> היפוך
        gray_img = cv2.bitwise_not(gray_img)

    img = gray_img.astype(np.float32)
    img = np.clip((img - 30) * (255.0 / 170.0), 0, 255).astype(np.uint8)

    h, w = img.shape[:2]
    scale = (target_size * 0.75) / max(h, w)
    new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

    canvas = np.zeros((target_size, target_size), dtype=np.uint8)
    x_off, y_off = (target_size - new_w) // 2, (target_size - new_h) // 2
    canvas[y_off:y_off + new_h, x_off:x_off + new_w] = resized
    return canvas


def recognize(gray_img, model, device):
    """מסווג תמונת אות בודדת בגווני אפור ומחזיר (תו, ביטחון)."""
    prepared = _prepare_letter(gray_img)
    tensor = _NORMALIZE(Image.fromarray(prepared).convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        probabilities = torch.softmax(model(tensor)[0], dim=0)
        confidence, idx = torch.max(probabilities, 0)
    return IDX_TO_CHAR[idx.item()], confidence.item()


def _char_to_canonical(char):
    """ממיר תו לתו המחלקה הקנוני (אותו איחוד כמו באימון). None אם אינו אות."""
    if 'A' <= char <= 'Z':
        num = ord(char) - ord('A') + 10
    elif 'a' <= char <= 'z':
        num = ord(char) - ord('a') + 36
    else:
        return None
    return _emnist_to_char(_collapse_label(num))






















# ------------------------------------------------------
# בדיקה
# ---------------------------------------------------------

import os
from collections import defaultdict

SKIP_FOLDERS = {"To_Review", "_unmatched", "_rejected_merged"}

def _folder_to_true_char(folder_name):
    """האות האמיתית לפי שם התיקייה (תומך 'A_upper', 'a_lower', 'a')."""
    name = folder_name.replace("_upper", "").replace("_lower", "")
    return _char_to_canonical(name) if len(name) == 1 else None


def plot_confusion_matrix(confusion, labels, output_path="confusion_matrix.png"):
    """יוצר תמונת מטריצת בלבול (heatmap). שורה=אמת, עמודה=ניבא, האלכסון=נכון.
    הכיתובים באנגלית כי matplotlib לא מציג עברית כראוי."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    n = len(labels)
    pos = {l: i for i, l in enumerate(labels)}
    mat = np.zeros((n, n), dtype=int)
    for true_char, row in confusion.items():
        for pred_char, count in row.items():
            if true_char in pos and pred_char in pos:
                mat[pos[true_char]][pos[pred_char]] = count

    fig, ax = plt.subplots(figsize=(0.42 * n + 2, 0.42 * n + 2))
    ax.imshow(mat, cmap="Blues")
    ax.set_xticks(range(n)); ax.set_xticklabels(labels, fontsize=7)
    ax.set_yticks(range(n)); ax.set_yticklabels(labels, fontsize=7)
    ax.set_xlabel("Predicted"); ax.set_ylabel("True")
    ax.set_title("Confusion Matrix")

    thresh = mat.max() / 2 if mat.max() else 0
    for i in range(n):
        for j in range(n):
            if mat[i][j] > 0:
                ax.text(j, i, mat[i][j], ha="center", va="center", fontsize=6,
                        color="white" if mat[i][j] > thresh else "black")

    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    print(f"נשמרה תמונת מטריצת הבלבול: {output_path}")

# =====================================================================
# מעבר על התמונות המתויגות (זרם שטוח, בלי קינון בצרכן)
# =====================================================================
def _iter_label_folders(test_root):
    """מחזיר (אות-אמת, נתיב) לכל תיקיית-תיוג תקפה."""
    for folder in sorted(os.listdir(test_root)):
        path = os.path.join(test_root, folder)
        if not os.path.isdir(path) or folder in SKIP_FOLDERS:
            continue
        true_char = _folder_to_true_char(folder)
        if true_char is not None:
            yield true_char, path


def _folder_images(true_char, path):
    """מחזיר (אות-אמת, שם-קובץ, תמונת-אפור) לכל תמונה תקפה בתיקייה אחת."""
    for filename in sorted(os.listdir(path)):
        if not filename.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
        gray = cv2.imread(os.path.join(path, filename), cv2.IMREAD_GRAYSCALE)
        if gray is not None:
            yield true_char, filename, gray


def _iter_labeled_images(test_root):
    """מאחד את הכול לזרם שטוח של (אות-אמת, שם-קובץ, תמונה)."""
    return chain.from_iterable(
        _folder_images(tc, path) for tc, path in _iter_label_folders(test_root))


def _eval_flag(ok, ok_ci):
    """מחזיר את הסימון שמופיע ליד ניבוי שגוי (או ריק אם נכון)."""
    if ok:
        return ""
    if ok_ci:
        return "   <-- אותה אות, גודל שונה"
    return "   <-- שגיאה אמיתית"


def _run_evaluation(test_root, model, device):
    """מריץ זיהוי על כל התמונות המתויגות ומחזיר את הצבירה."""
    total, correct, correct_ci = 0, 0, 0
    per_class = defaultdict(lambda: [0, 0])            # [נכון, סהכ]
    confusion = defaultdict(lambda: defaultdict(int))  # confusion[אמת][ניבא]

    for true_char, filename, gray in _iter_labeled_images(test_root):
        pred, conf = recognize(gray, model, device)
        total += 1
        per_class[true_char][1] += 1
        confusion[true_char][pred] += 1

        ok = (pred == true_char)
        ok_ci = (pred.lower() == true_char.lower())    # זהות האות, בלי גודל
        if ok:
            correct += 1
            per_class[true_char][0] += 1
        if ok_ci:
            correct_ci += 1
        print(f"אמת={true_char}  ניבא={pred}  ({conf:.0%})  {filename}{_eval_flag(ok, ok_ci)}")

    return total, correct, correct_ci, per_class, confusion


def _report_evaluation(total, correct, correct_ci, per_class, confusion):
    """מדפיס סיכום דיוק, דיוק לכל אות, ומצייר מטריצת בלבול."""
    print(f"\n=== דיוק עם רגישות לגודל: {correct}/{total} = {100 * correct / total:.1f}% ===")
    print(f"=== דיוק לפי זהות האות בלבד: {correct_ci}/{total} = {100 * correct_ci / total:.1f}% ===\n")

    print("דיוק לכל אות:")
    for char in sorted(per_class):
        c, t = per_class[char]
        print(f"  {char}: {c}/{t} = {100 * c / t:.0f}%")

    predicted = set(chain.from_iterable(confusion.values()))   # כל האותיות שנובאו
    labels = sorted(set(per_class) | predicted)
    plot_confusion_matrix(confusion, labels)


def evaluate(test_root):
    """מודד את דיוק המודל על תיקיות מתויגות (שם תיקייה = האות האמיתית)."""
    model, device = load_model()
    total, correct, correct_ci, per_class, confusion = _run_evaluation(test_root, model, device)
    if total == 0:
        print("לא נמצאו תמונות מתויגות.")
        return
    _report_evaluation(total, correct, correct_ci, per_class, confusion)


if __name__ == "__main__":
    evaluate("Efrat_Malach3")   # התאימי לנתיב התיקיות המתויגות שלך