import pika
import time
import sys

def send_update_to_java(font_id, status):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        # וודאי שהשם כאן זהה למה שהגדרת ב-RabbitMQConfig ב-Java
        channel.queue_declare(queue='font_status_updates', durable=True)
        message = f"{font_id}:{status}"
        channel.basic_publish(exchange='', routing_key='font_status_updates', body=message)
        connection.close()
        print(f" [->] Sent to Java: {status}") # הדפסה לבדיקה שלך
    except Exception as e:
        print(f" [!] Error sending to Java: {e}")

def process_task(ch, method, properties, body):
    font_id = body.decode()
    print(f" [x] התחלת עבודה על פונט ID: {font_id}")
    time.sleep(2)

    try:
        # שלב 1: עיבוד
        send_update_to_java(font_id, "PROCESSING")
        print("Status: PROCESSING (Waiting 5s)")
        time.sleep(5)

        # שלב 2: סיום
        # הוספתי הדפסה כדי שתראי בטרמינל של הפייתון אם זה בכלל נשלח
        print(f"Sending COMPLETED for ID: {font_id}")
        send_update_to_java(font_id, "COMPLETED")

    except Exception as e:
        send_update_to_java(font_id, "FAILED")
        print(f"Error: {e}")

    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    try:
        # התחברות לשרת המקומי (localhost)
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()

        # הגדרת התור (מוודא שהוא קיים)
        channel.queue_declare(queue='font_tasks', durable=True)

        # הגדרה שה-Worker יקבל הודעה אחת בכל פעם
        channel.basic_qos(prefetch_count=1)

        # רישום פונקציית הטיפול
        channel.basic_consume(queue='font_tasks', on_message_callback=process_task)

        print(' [*] ה-Worker מחובר ל-Localhost וממתין להודעות...')
        print(' [*] כדי לצאת לחצי CTRL+C')

        channel.start_consuming()

    except pika.exceptions.AMQPConnectionError:
        print(" [!] שגיאה: לא מצליח להתחבר ל-RabbitMQ. וודאי שהשרת רץ.")
    except KeyboardInterrupt:
        print(' [!] ה-Worker נעצר על ידי המשתמש.')
        sys.exit(0)


if __name__ == '__main__':
    main()