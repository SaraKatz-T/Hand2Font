
from numpy import *
# import bezier
from . import bezier


# מקבלת את רשימת הנקודות של האות ומחזירה רשימה של עקומות בזייה(נקודות בקרה)
# הפונקציה שולחת את המשיק השמאלי והמשיק הימני לפונקציה fitCubic שתנסה להתאים את העקומה
# המטרה: 1. למציאת נקודות הבקרה בשיטת הריבועים הפחותים
# 2. בעת פיצול עקומה לשניים הוא נותן את המשיק הזה כמשיק ימני לעקומה הראשונה וכמשיק שמאלי לעקומה השנייה
def fitCurve(points, maxError):
    leftTangent = normalize(points[1] - points[0])
    rightTangent = normalize(points[-2] - points[-1])
    return fitCubic(points, leftTangent, rightTangent, maxError)

#התאמת עקומה- רקורסיה
#
def fitCubic(points, leftTangent, rightTangent, error):
    # תנאי עצירה - אם נשארו 2 נקודות תתאים עקומה מאוזנת
    # בשביל ליצור עקומה מאוזנת משתמשים בכלל האצבע(Heuristic) - אורך הידיות צריך להיות שליש מאורך הקו הכולל
    if (len(points) == 2):
        dist = linalg.norm(points[0] - points[1]) / 3.0
        bezCurve = [points[0], points[0] + leftTangent * dist, points[1] + rightTangent * dist, points[1]]
        return [bezCurve]

    # פרמטריזציה של נקודות, וניסיון להתאים עקומה
    u = chordLengthParameterize(points)
    bezCurve = generateBezier(points, u, leftTangent, rightTangent)

    maxError, splitPoint = computeMaxError(points, bezCurve, u)
    if maxError < error:
        return [bezCurve]

    # אם השגיאה גדולה מדי אך לא ענקית מפעילים ניוטון-רפסון (- אולי הזמן שנתנו לכל נקודה לא מדויק)
    if maxError < error**2:
        for i in range(20):
            uPrime = reparameterize(bezCurve, points, u)
            bezCurve = generateBezier(points, uPrime, leftTangent, rightTangent)
            maxError, splitPoint = computeMaxError(points, bezCurve, uPrime)
            if maxError < error:
                return [bezCurve]
            u = uPrime

    # הפיצול הרקורסיבי
    beziers = []
    centerTangent = normalize(points[splitPoint-1] - points[splitPoint+1])
    beziers += fitCubic(points[:splitPoint+1], leftTangent, centerTangent, error)
    beziers += fitCubic(points[splitPoint:], -centerTangent, rightTangent, error)

    return beziers

# מציאת נקודות הבקרה על פי שיטת הריבועים הפחותים
#
def generateBezier(points, parameters, leftTangent, rightTangent):
    bezCurve = [points[0], None, None, points[-1]]

    # נוסחת ברנשטיין לעקומת בזייה
    #   B(t) = P₀·(1-t)³ + P₁·3(1-t)²t + P₂·3(1-t)t² + P₃·t³
    #
    # נקודות הבקרה האמצעיות מאולצות על כיווני המשיקים
    #   P₁ = P₀ + leftTangent  · α_l
    #   P₂ = P₃ + rightTangent · α_r
    #
    # לאחר הצבה והפרדת החלק הקבוע מהנעלמים
    #   B(t) − q([P₀,P₀,P₃,P₃], t) = α_l·(leftTangent·3(1-t)²t) + α_r·(rightTangent·3(1-t)t²)
    #
    # שני הביטויים בסוגריים הם וקטורי המקדמים
    #   A[i][0] = leftTangent  * 3*(1-u)**2 * u
    #   A[i][1] = rightTangent * 3*(1-u)    * u**2
    A = zeros((len(parameters), 2, 2))
    for i, u in enumerate(parameters):
        A[i][0] = leftTangent  * 3*(1-u)**2 * u
        A[i][1] = rightTangent * 3*(1-u)    * u**2

    # בניית המטריצה C והוקטור X
    # dot - מכפלה סקלרית
    C = zeros((2, 2))
    X = zeros(2)

    # חישוב המטריצה
    # כל תא = מכפלה פנימית (dot) בין שני משיקים, משוקללת לפי המיקום u של כל נקודה
    # הכוונה-
    # האלכסון הראשי (C[0][0], C[1][1]) - כמה השפעה יש לכל ידית במערכת
    # האלכסון המשני (C[0][1], C[1][0]) - הזווית בין שני המשיקים
    for i, (point, u) in enumerate(zip(points, parameters)):
        C[0][0] += dot(A[i][0], A[i][0])
        C[0][1] += dot(A[i][0], A[i][1])
        C[1][0] += dot(A[i][0], A[i][1])
        C[1][1] += dot(A[i][1], A[i][1])

        # חישוב ה- X
        #  הוא וקטור ההפרש בין נקודת הדגימה לבין הנקודה המתאימה על עקומת הבסיס המנוונת(ללא הידיות)-  tmp
        # הוא מייצג את השארית שתרומת הידיות נדרשת לכסות -  הפער הגאומטרי בין איפה העקומה עוברת בלי ידיות, לבין איפה הנקודות האמיתיות נמצאות
        # ומשמש לבניית הוקטור X במערכת המשוואות
        tmp = point - bezier.q([points[0], points[0], points[-1], points[-1]], u)

        X[0] += dot(A[i][0], tmp)
        X[1] += dot(A[i][1], tmp)

    # חישוב הדטרמיננטה
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1]
    det_C0_X  = C[0][0] * X[1] - C[1][0] * X[0]
    det_X_C1  = X[0] * C[1][1] - X[1] * C[0][1]

    # חישוב האלפות
    alpha_l = 0.0 if det_C0_C1 == 0 else det_X_C1 / det_C0_C1
    alpha_r = 0.0 if det_C0_C1 == 0 else det_C0_X / det_C0_C1

    # בדיקות תקינות לאלפות והתאמת עקומה סטנדרטית כדי שבהמשך לא יקרוס על מספרים לא הגיוניים
    #
    segLength = linalg.norm(points[0] - points[-1])
    epsilon = 1.0e-6 * segLength
    if alpha_l < epsilon or alpha_r < epsilon:
       bezCurve[1] = bezCurve[0] + leftTangent * (segLength / 3.0)
       bezCurve[2] = bezCurve[3] + rightTangent * (segLength / 3.0)

    else:
        # נקודות הבקרה P_1 ו-P_2 במרחק של האלפות שמצאנו
        #
        bezCurve[1] = bezCurve[0] + leftTangent * alpha_l
        bezCurve[2] = bezCurve[3] + rightTangent * alpha_r

    return bezCurve

# קוראת לניוטון-רפסון
#
def reparameterize(bezier, points, parameters):
    return [newtonRaphsonRootFind(bezier, point, u) for point, u in zip(points, parameters)]

#   f(x) / f'(x) - ניוטון-רפסון. החישוב
# היא לוקחת כל נקודה ובודקת האם יש זמן u אחר, קצת שונה, שבו העקומה תעבור קרוב יותר לנקודה הזו
def newtonRaphsonRootFind(bez, point, u):
    d = bezier.q(bez, u) - point
    numerator = (d * bezier.qprime(bez, u)).sum()
    denominator = (bezier.qprime(bez, u) ** 2 + d * bezier.qprimeprime(bez, u)).sum()

    if denominator == 0.0:
        return u
    else:
        return u - numerator/denominator

# התאמה לכל נקודת מקור את הכתובת היחסית שלה לאורך העקומה ( 0-1 )
# הספרייה linalg - קיצור של Linear Algebra זוהי "תת-ספרייה" בתוך ספריית numpy הענקית, והיא מרכזת את כל הפקודות שעושות חישובים גיאומטריים ומטריציוניים מסובכים
# norm - מחזירה את המרחק בין 2 הנקודות
def chordLengthParameterize(points):
    u = [0.0]
    for i in range(1, len(points)):
        u.append(u[i-1] + linalg.norm(points[i] - points[i-1]))

    for i, _ in enumerate(u):
        u[i] = u[i] / u[-1]

    return u

# מחזיר את השגיאה הכי גדולה והמיקום שבו זה קרה(שם נחתוך אם השגיאה תהיה גדולה)
#
def computeMaxError(points, bez, parameters):
    maxDist = 0.0
    splitPoint = len(points)/2
    for i, (point, u) in enumerate(zip(points, parameters)):
        dist = linalg.norm(bezier.q(bez, u) - point) ** 2
        if dist > maxDist:
            maxDist = dist
            splitPoint = i

    return maxDist, splitPoint

# הפיכת וקטור לוקטור היחידה- שהאורך של הוקטור יהיה 1
# המטרה- שלא ישפיע על האלפות
def normalize(v):
    return v / linalg.norm(v)

