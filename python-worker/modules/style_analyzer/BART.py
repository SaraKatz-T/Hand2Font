# מכונה 3- זיהוי על פי תוכן
import re
from transformers import pipeline

def analyze_complex_text(classifier, long_text, labels):
    sentences = [s.strip() for s in re.split(r'[.!?]', long_text) if len(s.strip()) > 5]

    if not sentences:
        print("Error: The text is too short or invalid.")
        return None

    score_board = {label: 0.0 for label in labels}
    votes = {label: 0 for label in labels}

    for i, sentence in enumerate(sentences):
        res = classifier(sentence, labels, truncation=True)

        # צבירת ציונים לכל קטגוריה
        for label, score in zip(res['labels'], res['scores']):
            score_board[label] += score

        # ספירת "קולות" (המנצח של כל משפט)
        top_label = res['labels'][0]
        votes[top_label] += 1

        # הדפסת התקדמות קצרה
        print(f"  {i + 1}. '{sentence[:30]}...' -> {top_label}")

    # חישוב אחוזים
    total_score_sum = sum(score_board.values())
    stats = {label: (score / total_score_sum) * 100 for label, score in score_board.items()}

    # הכרעה סופית לפי הציון המצטבר הגבוה ביותר
    final_winner = max(score_board, key=score_board.get)

    return final_winner, stats, votes


def get_text_style(classifier, text, labels):
    if not labels:
        return None
    #
    # labels = ["formal and official", "casual and daily", "social and friendly"]
    #
    if not text or len(text.strip()) < 5:
        return labels[0]  # ברירת מחדל לטקסט קצר

    winner, stats, votes = analyze_complex_text(classifier, text, labels)
    return winner
