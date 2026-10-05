# 🚽 PureFlush - Smart IoT Touchless Flush System

**PureFlush** adalah solusi sistem kloset otomatis berbasis IoT yang dirancang untuk meningkatkan higienitas fasilitas sanitasi publik. Menggunakan mikrokontroler Arduino, sistem ini memungkinkan proses penyiraman (*flushing*) secara penuh tanpa sentuh (nirsentuh) serta dilengkapi dengan fitur efisiensi air *Dual-Flush* dan indikator status visual/audio secara *real-time*.

---

## 📌 Fitur Utama
- **Nirsentuh (Touchless Operation):** Menggunakan sensor ultrasonik HC-SR04 untuk memicu penyiraman otomatis tanpa kontak fisik, mencegah kontaminasi silang bakteri.
- **Teknologi Dual-Flush Ramah Lingkungan:** 
  - *Light Flush* (45°, durasi 0,8s) untuk penggunaan singkat (< 5 detik).
  - *Full Flush* (90°, durasi 1,5s) untuk penggunaan standar/lama (> 5 detik).
- **Indikator Visual & Audio Real-Time:**
  - **LED Hijau:** Standby / Bilik Kosong.
  - **LED Merah:** Bilik Terisi / Sedang Digunakan.
  - **Piezo Buzzer:** Peringatan audio saat pengguna terdeteksi dan sebelum proses penyiraman bekerja.
- **Respon Cepat (High-Speed Processing):** Sampling rate sensor 50ms untuk mengakomodasi antrean padat di fasilitas umum.

---

## 🛠️ Komponen Hardware & Pinout

| Komponen | Spesifikasi | Pin Arduino Uno |
| :--- | :--- | :--- |
| **Mikrokontroler** | Arduino Uno R3 | - |
| **Sensor Jarak** | HC-SR04 Ultrasonik | **Trig:** Pin 9 \| **Echo:** Pin 10 |
| **Aktuator Mechanical**| Micro Servo SG90 | **Signal:** Pin ~6 |
| **Indikator Status** | LED Merah (Terisi) | Pin 2 |
| **Indikator Status** | LED Hijau (Kosong) | Pin 3 |
| **Indikator Audio** | Piezo Buzzer | Pin 4 |
| **Power Supply** | Regulated 5V DC | 5V & GND |

---

## 📐 Arsitektur Skema & Rangkaian
*(Unggah foto/screenshot Tinkercad kamu ke folder docs/ dan tampilkan di sini)*

![Skema PureFlush](docs/tinkercad-circuit.png)

---

## 💻 Kode Program (C++)

File kode utama berada pada [`pureflush.ino`](./pureflush.ino).

```cpp
#include <Servo.h>

const int TRIG_PIN  = 9;
const int ECHO_PIN  = 10;
const int SERVO_PIN = 6;
const int LED_RED   = 2;
const int LED_GREEN = 3;
const int BUZZER    = 4;

Servo flushServo;
bool isOccupied = false;
unsigned long usageStartTime = 0;
int usageCounter = 0;

float readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 15000);
  if (duration == 0) return 400.0;
  return duration * 0.034 / 2;
}

void beep(int count, int delayMs) {
  for (int i = 0; i < count; i++) {
    tone(BUZZER, 2000, delayMs);
    delay(delayMs * 1.2);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  flushServo.attach(SERVO_PIN);
  flushServo.write(0);
  
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_RED, LOW);
}

void loop() {
  float distance = readDistanceCM();

  if (distance < 60 && !isOccupied) {
    isOccupied = true;
    usageStartTime = millis();
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    beep(1, 50);
  }

  if (distance > 80 && isOccupied) {
    unsigned long duration = (millis() - usageStartTime) / 1000;
    usageCounter++;
    beep(2, 50);

    if (duration < 5) {
      flushServo.write(45);
      delay(800); 
    } else {
      flushServo.write(90);
      delay(1500); 
    }
    
    flushServo.write(0);
    isOccupied = false;
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, HIGH);
  }

  delay(50);
}
