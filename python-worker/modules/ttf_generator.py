
# -------------------------------
#          יצירת TTF
# -------------------------------
import sys
import os

fontforge_dir = os.path.dirname(os.path.dirname(sys.executable))
fontforge_path = os.path.join(
    fontforge_dir,
    "lib",
    "python3.10",
    "site-packages"
)

if fontforge_path not in sys.path:
    sys.path.append(fontforge_path)


EM           = 1000   # גודל— סטנדרט לגופני TTF
ASCENT       = 800    # גובה מקו הבסיס למעלה  (80% מה-em)
DESCENT      = 200    # עומק מקו הבסיס למטה  (20% מה-em)
SIDE_BEARING = 80     # רווח קבוע (ביחידות em) משני צדי כל אות

CAP_HEIGHT      = 700  # גובה אות גדולה (מקו הבסיס למעלה)
X_HEIGHT        = 500  # גובה גוף אות קטנה רגילה (a, c, e, o ...)
ASCENDER_TOP    = 730  # גובה אות קטנה עם "רגל" עליונה (b, d, h, l ...)
DESCENDER_DEPTH = 200  # עומק הזנב מתחת לקו הבסיס (g, y, p, q, j)

DESCENDERS = set("gjpqy")    # אותיות שהזנב שלהן יורד מתחת לשורה
ASCENDERS  = set("bdfhklt")  # אותיות קטנות שמגיעות גבוה כמו אות גדולה


def _set_font_metrics(font):
    """מגדיר את מטריקת הגופן הבסיסית — פעם אחת על אובייקט ה-font."""
    font.em      = EM
    font.ascent  = ASCENT
    font.descent = DESCENT

    font.os2_winascent      = ASCENT
    font.os2_windescent     = DESCENT
    font.os2_typoascent     = ASCENT
    font.os2_typodescent    = -DESCENT
    font.os2_typolinegap    = 0

    font.hhea_ascent        = ASCENT
    font.hhea_descent       = -DESCENT
    font.hhea_linegap       = 0


def _vertical_band(char):
    """מחזיר את הטווח האנכי (bottom, top) ביחידות em שאליו האות צריכה להתאים."""
    if char.isupper():
        return (0, CAP_HEIGHT)
    if char in DESCENDERS:
        return (-DESCENDER_DEPTH, X_HEIGHT)
    if char in ASCENDERS:
        return (0, ASCENDER_TOP)
    return (0, X_HEIGHT)


def _fit_glyph_vertically(glyph, target_bottom, target_top):
    """
    מותח את ה-glyph בסקייל אחיד (שומר על הפרופורציה) כך שגובהו ימלא
    את הטווח [target_bottom, target_top], וממקם אותו כך שתחתיתו תשב על target_bottom.
    """
    x0, y0, x1, y1 = glyph.boundingBox()   # (xmin, ymin, xmax, ymax)
    cur_h = y1 - y0
    if cur_h <= 0:
        return

    s = (target_top - target_bottom) / cur_h
    glyph.transform((s, 0, 0, s, 0, 0))            # סקייל אחיד סביב הראשית

    _, ny0, _, _ = glyph.boundingBox()             # תחתית חדשה אחרי הסקייל
    glyph.transform((1, 0, 0, 1, 0, target_bottom - ny0))  # הזזה אנכית למקום הנכון


def _import_glyph(font, svg_path, unicode_val, glyph_name, char):
    """
    מייבא SVG אחד ל-glyph:
    1. מייבא קווי מתאר ומנקה עקומות
    2. מתאים את הגובה והמיקום האנכי לפי קטגוריית האות
    3. קובע advance פרופורציונלי באמצעות side bearings קבועים
    """
    glyph = font.createChar(unicode_val, glyph_name)
    glyph.importOutlines(svg_path)

    glyph.correctDirection()   # סידור כיוון עקומות (חיוני לחורים כמו b, e, o)
    glyph.simplify()           # הסרת נקודות מיותרות
    glyph.removeOverlap()      # מניעת חפיפות

    # התאמת גובה ומיקום אנכי — חייב לבוא לפני קביעת ה-side bearings
    bottom, top = _vertical_band(char)
    _fit_glyph_vertically(glyph, bottom, top)

    # advance פרופורציונלי — רווח קבוע משני הצדדים
    glyph.left_side_bearing  = SIDE_BEARING
    glyph.right_side_bearing = SIDE_BEARING

    return glyph



def create_ttf_from_svgs(svg_folder, output_path, font_name="ProjectFont"):
    import fontforge

    font = fontforge.font()
    font.fontname   = font_name
    font.familyname = font_name
    font.fullname   = font_name

    _set_font_metrics(font)

    # מיפוי שם קובץ → תו
    char_map = {
        "A_upper": "A", "B_upper": "B", "C_upper": "C", "D_upper": "D",
        "E_upper": "E", "F_upper": "F", "G_upper": "G", "H_upper": "H",
        "I_upper": "I", "J_upper": "J", "K_upper": "K", "L_upper": "L",
        "M_upper": "M", "N_upper": "N", "O_upper": "O", "P_upper": "P",
        "Q_upper": "Q", "R_upper": "R", "S_upper": "S", "T_upper": "T",
        "U_upper": "U", "V_upper": "V", "W_upper": "W", "X_upper": "X",
        "Y_upper": "Y", "Z_upper": "Z",
        "a": "a", "b": "b", "c": "c", "d": "d", "e": "e", "f": "f",
        "g": "g", "h": "h", "i": "i", "j": "j", "k": "k", "l": "l",
        "m": "m", "n": "n", "o": "o", "p": "p", "q": "q", "r": "r",
        "s": "s", "t": "t", "u": "u", "v": "v", "w": "w", "x": "x",
        "y": "y", "z": "z",
    }

    files_imported = 0

    for filename in sorted(os.listdir(svg_folder)):
        if not filename.lower().endswith(".svg"):
            continue

        name_no_ext = os.path.splitext(filename)[0]
        char_to_use = char_map.get(name_no_ext)

        if char_to_use is None:
            print(f" [Skip] לא נמצא מיפוי עבור: {filename}")
            continue

        try:
            _import_glyph(
                font,
                svg_path=os.path.join(svg_folder, filename),
                unicode_val=ord(char_to_use),
                glyph_name=name_no_ext,
                char=char_to_use,
            )
            print(f" Imported: {filename} → '{char_to_use}'")
            files_imported += 1

        except Exception as e:
            print(f" Error importing {filename}: {e}")

    if files_imported == 0:
        print(" No glyphs were imported.")
        return

    font.encoding = 'UnicodeFull'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    font.generate(output_path)
    print(f"\n--- Done! Font saved: {output_path} ({files_imported} glyphs) ---")


# ---------------------------------------------------------------------------
# generate_ttf — מפעיל FontForge כתהליך חיצוני עם הסקריפט הזה
# ---------------------------------------------------------------------------
import subprocess

def generate_ttf(fontforge_exe, svg_dir, output_path, font_name):
    script_path = os.path.abspath(__file__)
    command = [fontforge_exe, script_path, svg_dir, output_path, font_name]

    try:
        subprocess.run(command, check=True)
        print("[V] FontForge finished successfully.")
    except Exception as e:
        print(f"[X] FontForge failed: {e}")


























# ---------------------------------------------------------------------------
# __main__ — כשמופעל ישירות על ידי FontForge (דרך generate_ttf)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) == 4:
        create_ttf_from_svgs(
            svg_folder=sys.argv[1],
            output_path=sys.argv[2],
            font_name=sys.argv[3],
        )
    else:
        print("[!] Usage:")
        print("    ffpython ttf_generator.py <svg_folder> <output_path> <font_name>")