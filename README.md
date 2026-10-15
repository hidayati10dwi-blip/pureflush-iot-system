**PUREFLUSH**


**Smart IoT Touchless & Eco-Friendly Flush System**


Sistem flush toilet otomatis berbasis Arduino yang tidak perlu disentuh, tidak bergantung pada ingatan pengguna, dan hanya memakai air sesuai kebutuhan.
Proyek ini kami buat untuk kelengkapan pada lomba Hackathon dengan subtema Healthcare & Sustainability.

| No-Touch Technology |·| Smart Dual-Flush  |·| Real-Time Telemetry |



**Daftar Isi:**
1.  Tentang Proyek
2.  Penyelesaian Masalah
3.  Solusi: PureFlush
4.  Fitur Utama
5.  Cara Kerja
6.  Komponen yang Digunakan
7.  Parameter Penting
8.  Cara Mencoba
9.  Keputusan Desain
10. Struktur Repositori
11. Transparansi Penggunaan AI
12. Rencana Pengembangan
13. Tim



**TENTANG PROYEK**


PureFlush mengubah kloset biasa menjadi kloset pintar. Sensor ultrasonik mengenali kapan pengguna datang dan kapan pengguna pergi. Begitu pengguna pergi, servo menggerakkan mekanisme flush secara otomatis. Lama pemakaian ikut dihitung, sehingga sistem bisa memilih bilasan ringan atau bilasan penuh.
Semua dibangun dari komponen Arduino yang murah dan mudah dicari, supaya siapa pun bisa merakit ulang, mencoba, dan mengembangkannya.

**PENYELESAIAN MASALAH**


Kami mulai dari pengamatan sederhana tentang toilet umum. Ada lima masalah yang saling berkaitan: <br>
1. Lupa atau malas menyiram. Banyak orang keluar dari toilet tanpa menyiram. Lansia sering lupa, orang dengan daya ingat yang menurun bisa langsung keluar tanpa sadar, dan sebagian orang memang sekadar malas lalu meninggalkannya begitu saja. Pengguna berikutnya yang menanggung akibatnya. <br>
2. Kuman berkembang biak. Kotoran yang dibiarkan menjadi tempat bakteri dan kuman tumbuh. Toilet yang tidak dibilas lama-lama berubah menjadi sumber penyakit, bukan sekadar masalah estetika. <br>
3. Bau dan penyebaran lewat udara. Bau tidak sedap adalah tanda kebersihan yang terabaikan. Selain mengganggu kenyamanan, percikan mikro dari toilet yang tidak disiram juga bisa membawa mikroorganisme ke udara di ruangan tertutup. Risikonya paling besar di rumah sakit dan fasilitas umum yang dipakai orang dengan kondisi kesehatan yang sangat beragam. <br>
4. Kontaminasi silang lewat tombol flush. Tombol flush konvensional disentuh ratusan orang setiap hari, dan biasanya tepat setelah mereka selesai dari toilet. Tombol itu menjadi salah satu titik penularan kuman yang paling sering terlewat.<br>
5. Pemborosan air bersih. Kloset biasa mengeluarkan volume air yang sama untuk semua orang, entah dipakai sebentar atau lama. Kalau dikalikan jumlah toilet umum yang ada, air yang terbuang tidak sedikit.


**SOLUSI: PureFlush**


kami rancang untuk menjawab kelima masalah itu sekaligus dengan satu perangkat:<br>
| Masalah | Jawaban PureFlush|
| :--- | :--- | 
| Lupa atau malas menyiram | Flush berjalan otomatis setiap kali pengguna pergi, tanpa perlu diingat |
| Kuman berkembang biak | Toilet langsung dibilas sehingga kotoran tidak sempat menumpuk |
| Bau dan penyebaran udara | Kotoran tidak dibiarkan terbuka, sehingga sumber bau berkurang |
| Kontaminasi silang | Tidak ada tombol yang harus disentuh |
| Pemborosan air |	Dual-flush: volume air menyesuaikan lama pemakaian| 


**FITUR UTAMA**


1. Sepenuhnya nirsentuh. Sensor HC-SR04 membaca jarak pengguna. Sistem aktif saat pengguna mendekat dan menyiram saat pengguna pergi. Fitur ini sangat membantu lansia dan siapa pun yang mudah lupa.<br>
2. Dual-flush cerdas. Lama pemakaian dihitung dengan millis(), lalu sistem memilih mode:<br>-Light Flush: pemakaian kurang dari 5 detik. Servo bergerak 45° selama 0,8 detik. Lebih hemat air.<br>-Full Flush: pemakaian 5 detik atau lebih. Servo bergerak 90° selama 1,5 detik. Untuk pembersihan maksimal.<br>
4. Umpan balik audio dan visual. LED hijau berarti toilet kosong dan siap dipakai. LED merah berarti toilet sedang terisi. Piezo buzzer memberi tanda suara saat pengguna terdeteksi dan saat siklus selesai.<br>
5. Respons cepat. Sensor dibaca setiap 50 ms dengan debounce, jadi pembacaan stabil dan tidak ada jeda yang mengganggu antrean.


**CARA KERJA**


Alurnya bisa dibaca seperti berikut:
<br>
```text
Standby (LED hijau)
      |
      v
Ada objek < 60 cm?  --tidak--> tetap Standby
      | ya
      v
LED merah menyala + buzzer berbunyi 1x
Mulai hitung durasi (millis)
      |
      v
Objek > 80 cm?  --tidak--> terus hitung durasi
      | ya
      v
Durasi < 5 detik?
   |-- ya    --> Light Flush (servo 45°, 0,8 detik)
   |-- tidak --> Full Flush  (servo 90°, 1,5 detik)
      |
      v
Servo kembali ke posisi awal + buzzer berbunyi 2x
      |
      v
Kembali ke Standby (LED hijau)
```
<br>
Penjelasan langkah demi langkah:<br>
1. Standby. LED hijau menyala. Toilet kosong dan siap dipakai.<br>
2. Pengguna masuk. Sensor mendeteksi objek pada jarak kurang dari 60 cm. LED berubah merah, buzzer berbunyi sekali, dan sistem mulai menghitung durasi pemakaian.<br>
3. Pengguna pergi. Saat jarak melebihi 80 cm, sistem menghentikan hitungan dan memilih jenis flush berdasarkan durasi tadi. Servo lalu bergerak ke 45° atau 90°.<br>
4. Selesai. Servo kembali ke posisi awal, buzzer berbunyi dua kali, dan LED hijau menyala lagi untuk pengguna berikutnya.


**KOMPONEN YANG DIGUNAKAN:**


| Komponen| Fungsi |
| :--- | :--- |
| Arduino Uno R3 | Otak sistem, memproses semua logika program |
| Sensor ultrasonik HC-SR04 | Mengukur jarak untuk mendeteksi pengguna |
| Micro Servo SG90 | Menggerakkan mekanisme flush |
| LED merah dan LED hijau | Indikator status toilet |
| Resistor 220 Ω | Pembatas arus agar LED aman |
| Piezo buzzer | Penanda suara | 


**PARAMETER PENTING ** 


Angka-angka ini adalah hasil pengaturan dan pengujian kami:
<br>
| Parameter | Nilai |
| :--- | :--- |
| Jarak deteksi pengguna masuk | kurang dari 60 cm |
| Jarak pengguna dianggap pergi	| lebih dari 80 cm |
| Batas durasi Light Flush dan Full Flush |	5 detik |
| Light Flush | servo 45°, durasi 0,8 detik | 
| Full Flush | servo 90°, durasi 1,5 detik |
| Interval pembacaan sensor | 50 ms |
| Buzzer saat pengguna masuk | 1 kali bunyi |
| Buzzer saat siklus selesai | 2 kali bunyi |


**CARA MENCOBA**  


cara untuk menjalankan PureFlush.<br>
Simulasi di Tinkercad Circuits:
1. Buka proyek simulasi kami: [tempel tautan simulasi Tinkercad di sini] 
2. Klik Start Simulation.
3. Geser objek pada sensor ultrasonik untuk meniru pengguna yang mendekat dan menjauh.
4. Perhatikan LED, buzzer, dan gerakan servo.
5. Coba dua skenario:
--> Dekati sensor, tunggu kurang dari 5 detik, lalu jauhkan. Servo akan bergerak 45° (Light Flush).
-->Dekati sensor, tunggu 5 detik atau lebih, lalu jauhkan. Servo akan bergerak 90° (Full Flush).


**KEPUTUSAN DESAIN**


Beberapa pilihan yang kami ambil, beserta alasannya:
1. Dua ambang jarak (60 cm dan 80 cm), bukan satu. Jika hanya ada satu ambang, sistem bisa bolak-balik berpindah status saat pengguna berdiri tepat di batas jangkauan sensor. Jeda antara 60 dan 80 cm membuat perpindahan status lebih stabil. <br>
2. Durasi dihitung dengan millis(). Dengan millis(), kami bisa mengukur lama pemakaian tanpa membekukan program, sehingga sensor dan indikator tetap bisa bekerja. <br>
3. Debounce dan sampling 50 ms. Sensor ultrasonik kadang memberi pembacaan yang melompat-lompat. Debounce dan interval pembacaan yang teratur membuat respons lebih stabil dan tidak salah memicu flush. <br>
4. Resistor 220 Ω pada setiap LED. Untuk membatasi arus agar LED dan pin Arduino tetap aman. <br>
5. Dua mode flush dengan sudut servo berbeda. Sudut 45° dan 90° memberi dua tingkat bukaan, sehingga volume air yang keluar berbeda sesuai kebutuhan. <br>

   
**STRUKTUR REPOSITORI**


```
PureFlush/
├── pureflush.ino   
└── README.md        
```

**TRANSPARAN PENGGUNAAN AI**


Dibantu AI:
GEMINI, CLAUDE, CANVA, VIGMA, CHAT GPT
(alasanya karena memudahkan dan gratis untuk mahasiswa)


**RENCANA PENGEMBANGAN**


Versi sekarang yang kami kembangan secara mandiri di satu perangkat. Langkah berikutnya: <br>
1. Telemetri ke cloud. Menambahkan modul Wi-Fi seperti ESP32 untuk mengirim data pemakaian harian ke dashboard pusat. Pengelola gedung bisa memantau kondisi toilet dan menjadwalkan perawatan secara real-time. <br>
2. Uji di lingkungan nyata. Mencoba di mal, stasiun, kampus, rumah sakit, dan gedung perkantoran pintar (Smart Building), lalu menyempurnakan berdasarkan hasil di lapangan. <br>

  
**TIM**


[ PLANET CELUP'T ]
<br>
1. DENOK DWI HIDAYATI  <br>
2. JOFAN HANDIKA  <br>
3. EKA WIDIASTUTI   <br>
4. PYPYT R KHASANAH   <br>



