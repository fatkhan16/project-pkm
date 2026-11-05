# Sistem Informasi Nilai Siswa (SMA/SMK)

Aplikasi web sederhana untuk input dan melihat nilai PTS & PAS. Hanya memakai HTML, CSS, dan JavaScript biasa (tanpa framework, tanpa npm, tanpa internet).

## Cara menjalankan

1. Klik dua kali `index.html` (terbuka di browser, tidak perlu server).
2. Masuk memakai akun demo (klik nama akun di halaman login untuk mengisi form):
   - Guru: `guru1` s.d. `guru4`, password `guru123`
   - Siswa: `siswa001` s.d. `siswa020`, password `siswa123`
3. Tombol **Reset data demo** di halaman login mengembalikan semua data ke data awal.

> Data yang Anda ubah disimpan di browser (localStorage), jadi tetap ada setelah halaman di-refresh. Data hanya ada di browser dan komputer yang sama.

## Fungsi tiap file

| File | Fungsi |
|---|---|
| `index.html` | Halaman login |
| `guru.html` | Halaman guru: input nilai, ringkasan kelas |
| `siswa.html` | Halaman siswa: melihat nilai sendiri (read-only) |
| `css/style.css` | Seluruh tampilan (satu file untuk semua halaman) |
| `js/config.js` | KKM, daftar komponen nilai + bobot, teks semester |
| `js/data.js` | Data awal (seed): mapel, kelas, siswa, guru, nilai |
| `js/utils.js` | Fungsi bantu: hitung nilai akhir, status, format angka, validasi |
| `js/api.js` | **Satu-satunya** tempat membaca/menyimpan data |
| `js/auth.js` | Login, logout, penjagaan halaman berdasarkan peran |
| `js/guru.js` | Logika halaman guru |
| `js/siswa.js` | Logika halaman siswa |

Aturan penting: file selain `api.js` **tidak boleh** memakai `localStorage`/`sessionStorage` langsung.

## Aturan penilaian

- Nilai akhir = (PTS × bobot PTS + PAS × bobot PAS) / 100, dibulatkan half-up 2 desimal (misal 80,975 menjadi 80,98).
- Nilai akhir hanya dihitung jika **semua** komponen terisi. Jika ada yang kosong tampil "—" dan "Belum lengkap" (kosong tidak dihitung 0).
- Nilai akhir ≥ KKM = "Tuntas", di bawahnya "Belum tuntas".
- Nilai valid: 0–100, maksimal 2 desimal (boleh memakai koma atau titik saat mengetik).

## Cara mengubah data

Setelah mengedit `data.js`, klik **Reset data demo** di halaman login supaya data baru terbaca.

- **Daftar mapel**: edit array `subjects` di `js/data.js`. Jika menambah mapel baru, tambahkan juga penugasannya di `teaching_assignments`.
- **Siswa**: tambahkan baris di `students` (id, `user_id`, `nis` unik, `name`, `class_id`) dan satu akun di `users` (`role: "siswa"`) dengan `id` yang sama dengan `user_id`.
- **Guru**: tambahkan baris di `teachers` (dengan `user_id`) dan akun di `users` (`role: "guru"`). Atur mapel dan kelas yang diampu di `teaching_assignments` (guru × mapel × kelas).
- **KKM**: ubah `CONFIG.KKM` di `js/config.js`.
- **Bobot**: ubah `weight` pada `CONFIG.COMPONENTS` di `js/config.js`. Jumlah semua bobot harus 100. (Bobot sekarang 50/50 masih placeholder, konfirmasikan ke sekolah.)
- **Menambah komponen nilai** (misal Tugas): tambahkan satu objek di `CONFIG.COMPONENTS`, misal `{ key: "tugas", label: "Tugas", weight: 20 }`, lalu atur ulang bobot lain sampai total 100. Kolom di tabel dan rumus nilai akhir ikut menyesuaikan otomatis. Nilai awalnya di `data.js` boleh dikosongkan.
- **Semester / tahun ajaran**: ubah `CONFIG.SEMESTER_LABEL`.

## Cara menyambung ke database

Semua fungsi di `js/api.js` sudah mengembalikan `Promise`. Ganti **isi** fungsi dengan `fetch()` ke backend; file lain tidak perlu diubah. Di atas tiap fungsi sudah ada komentar bentuk JSON dan contoh `fetch()` (cari tulisan `GANTI DI SINI`).

| Fungsi | Input | Output (JSON) |
|---|---|---|
| `login(username, password)` | username, password | `{ userId, username, role, name, teacherId, studentId }` atau error |
| `logout()` | - | `{ ok: true }` |
| `getSession()` | - | objek session seperti `login`, atau `null` |
| `getTeacherAssignments(teacherId)` | id guru | `[ { id, subjectId, subjectName, classId, className } ]` |
| `getAssignmentScores(assignmentId)` | id penugasan | `{ assignment: { id, subjectName, className }, students: [ { studentId, nis, name, scores: { pts, pas } } ] }` |
| `saveScores(assignmentId, changes)` | id penugasan, `[ { studentId, scores: { pts, pas } } ]` | `{ ok: true, savedStudents }` atau error |
| `getStudentGrades(studentId)` | id siswa | `{ student: { id, nis, name, className }, grades: [ { subjectId, subjectName, scores: { pts, pas } } ] }` |

Catatan:
- Nilai kosong dikirim/diterima sebagai `null` (bukan 0).
- `getDemoAccounts()` dan `resetDemoData()` hanya untuk demo dan tidak perlu ada di backend.
- Hapus `FAKE_DELAY_MS` di `api.js` saat memakai backend.
- Password plaintext di `data.js` hanya untuk demo. Di sistem asli, autentikasi (hash password, sesi/token) dan pengecekan hak akses dikerjakan backend.
