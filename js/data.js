// ============================================================
// data.js - Data awal (seed). Mudah diedit.
// Bentuknya meniru tabel database:
//   users, teachers, students, classes, subjects,
//   teaching_assignments, scores
// Semua relasi memakai id angka yang konsisten antar tabel.
//
// Data ini dimuat ke localStorage SATU KALI (saat pertama dibuka).
// Setelah mengedit file ini, klik "Reset data demo" di halaman login
// supaya perubahan terbaca.
// ============================================================

var SEED_DATA = {

  // Akun login. role: "guru" atau "siswa".
  // CATATAN: password plaintext hanya untuk demo. Di sistem asli,
  // password di-hash dan autentikasi dikerjakan backend.
  users: [
    { id: 1, username: "guru1", password: "guru123", role: "guru" },
    { id: 2, username: "guru2", password: "guru123", role: "guru" },
    { id: 3, username: "guru3", password: "guru123", role: "guru" },
    { id: 4, username: "guru4", password: "guru123", role: "guru" },

    { id: 5,  username: "siswa001", password: "siswa123", role: "siswa" },
    { id: 6,  username: "siswa002", password: "siswa123", role: "siswa" },
    { id: 7,  username: "siswa003", password: "siswa123", role: "siswa" },
    { id: 8,  username: "siswa004", password: "siswa123", role: "siswa" },
    { id: 9,  username: "siswa005", password: "siswa123", role: "siswa" },
    { id: 10, username: "siswa006", password: "siswa123", role: "siswa" },
    { id: 11, username: "siswa007", password: "siswa123", role: "siswa" },
    { id: 12, username: "siswa008", password: "siswa123", role: "siswa" },
    { id: 13, username: "siswa009", password: "siswa123", role: "siswa" },
    { id: 14, username: "siswa010", password: "siswa123", role: "siswa" },
    { id: 15, username: "siswa011", password: "siswa123", role: "siswa" },
    { id: 16, username: "siswa012", password: "siswa123", role: "siswa" },
    { id: 17, username: "siswa013", password: "siswa123", role: "siswa" },
    { id: 18, username: "siswa014", password: "siswa123", role: "siswa" },
    { id: 19, username: "siswa015", password: "siswa123", role: "siswa" },
    { id: 20, username: "siswa016", password: "siswa123", role: "siswa" },
    { id: 21, username: "siswa017", password: "siswa123", role: "siswa" },
    { id: 22, username: "siswa018", password: "siswa123", role: "siswa" },
    { id: 23, username: "siswa019", password: "siswa123", role: "siswa" },
    { id: 24, username: "siswa020", password: "siswa123", role: "siswa" }
  ],

  // Data guru (user_id menunjuk ke tabel users)
  teachers: [
    { id: 1, user_id: 1, name: "Hj. Siti Aminah, S.Pd.I." },
    { id: 2, user_id: 2, name: "Dra. Ratna Kumala Dewi, M.Pd." },
    { id: 3, user_id: 3, name: "Bambang Supriyadi, S.Si." },
    { id: 4, user_id: 4, name: "Agus Setiawan, S.Pd." }
  ],

  // Kelas
  classes: [
    { id: 1, name: "X-1" },
    { id: 2, name: "X-2" }
  ],

  // Mata pelajaran (PLACEHOLDER - silakan ganti)
  subjects: [
    { id: 1, name: "Pendidikan Agama" },
    { id: 2, name: "Pancasila" },
    { id: 3, name: "Bahasa Indonesia" },
    { id: 4, name: "Matematika" },
    { id: 5, name: "Bahasa Inggris" },
    { id: 6, name: "Sejarah" },
    { id: 7, name: "Informatika" },
    { id: 8, name: "PJOK" }
  ],

  // Data siswa (user_id -> users, class_id -> classes)
  students: [
    // Kelas X-1
    { id: 1,  user_id: 5,  nis: "2026001", name: "Ahmad Fauzi",            class_id: 1 },
    { id: 2,  user_id: 6,  nis: "2026002", name: "Aisyah Putri Rahmawati", class_id: 1 },
    { id: 3,  user_id: 7,  nis: "2026003", name: "Budi Santoso",           class_id: 1 },
    { id: 4,  user_id: 8,  nis: "2026004", name: "Citra Dewi Lestari",     class_id: 1 },
    { id: 5,  user_id: 9,  nis: "2026005", name: "Dimas Prasetyo",         class_id: 1 },
    { id: 6,  user_id: 10, nis: "2026006", name: "Eka Wulandari",          class_id: 1 },
    { id: 7,  user_id: 11, nis: "2026007", name: "Fajar Nugroho",          class_id: 1 },
    { id: 8,  user_id: 12, nis: "2026008", name: "Gita Permata Sari",      class_id: 1 },
    { id: 9,  user_id: 13, nis: "2026009", name: "Hendra Wijaya",          class_id: 1 },
    { id: 10, user_id: 14, nis: "2026010", name: "Indah Kusumawati",       class_id: 1 },
    // Kelas X-2
    { id: 11, user_id: 15, nis: "2026011", name: "Joko Susilo",            class_id: 2 },
    { id: 12, user_id: 16, nis: "2026012", name: "Kartika Ayu Ningrum",    class_id: 2 },
    { id: 13, user_id: 17, nis: "2026013", name: "Lukman Hakim",           class_id: 2 },
    { id: 14, user_id: 18, nis: "2026014", name: "Maya Anggraini",         class_id: 2 },
    { id: 15, user_id: 19, nis: "2026015", name: "Naufal Ramadhan",        class_id: 2 },
    { id: 16, user_id: 20, nis: "2026016", name: "Olivia Maharani",        class_id: 2 },
    { id: 17, user_id: 21, nis: "2026017", name: "Putra Mahendra",         class_id: 2 },
    { id: 18, user_id: 22, nis: "2026018", name: "Rina Safitri",           class_id: 2 },
    { id: 19, user_id: 23, nis: "2026019", name: "Slamet Riyadi",          class_id: 2 },
    { id: 20, user_id: 24, nis: "2026020", name: "Tiara Salsabila",        class_id: 2 }
  ],

  // Penugasan mengajar: guru x mapel x kelas.
  // Tiap guru mengampu 2 mapel di kedua kelas.
  teaching_assignments: [
    // Guru 1: Pendidikan Agama & Pancasila
    { id: 1,  teacher_id: 1, subject_id: 1, class_id: 1 },
    { id: 2,  teacher_id: 1, subject_id: 1, class_id: 2 },
    { id: 3,  teacher_id: 1, subject_id: 2, class_id: 1 },
    { id: 4,  teacher_id: 1, subject_id: 2, class_id: 2 },
    // Guru 2: Bahasa Indonesia & Bahasa Inggris
    { id: 5,  teacher_id: 2, subject_id: 3, class_id: 1 },
    { id: 6,  teacher_id: 2, subject_id: 3, class_id: 2 },
    { id: 7,  teacher_id: 2, subject_id: 5, class_id: 1 },
    { id: 8,  teacher_id: 2, subject_id: 5, class_id: 2 },
    // Guru 3: Matematika & Informatika
    { id: 9,  teacher_id: 3, subject_id: 4, class_id: 1 },
    { id: 10, teacher_id: 3, subject_id: 4, class_id: 2 },
    { id: 11, teacher_id: 3, subject_id: 7, class_id: 1 },
    { id: 12, teacher_id: 3, subject_id: 7, class_id: 2 },
    // Guru 4: Sejarah & PJOK
    { id: 13, teacher_id: 4, subject_id: 6, class_id: 1 },
    { id: 14, teacher_id: 4, subject_id: 6, class_id: 2 },
    { id: 15, teacher_id: 4, subject_id: 8, class_id: 1 },
    { id: 16, teacher_id: 4, subject_id: 8, class_id: 2 }
  ],

  // Nilai. Satu baris = satu nilai satu komponen satu siswa satu mapel:
  //   { id, student_id, subject_id, component, value }
  // "component" berisi key dari CONFIG.COMPONENTS ("pts" / "pas").
  // Nilai yang kosong = tidak ada barisnya (BUKAN 0).
  // Diisi oleh fungsi buildSeedScores() di bawah.
  scores: []
};

// Membuat nilai contoh secara otomatis supaya tidak perlu menulis ratusan baris.
// Pola per (siswa + mapel):
//   sisa 0, 1, 2 -> PTS dan PAS terisi (lengkap)
//   sisa 3       -> hanya PTS terisi (belum lengkap)
//   sisa 4       -> kosong semua
// Siswa id 20 sengaja tidak punya nilai sama sekali ("Belum ada nilai").
// Beberapa nilai memakai desimal (.75) untuk contoh.
function buildSeedScores() {
  var rows = [];
  var nextId = 1;
  var componentKeys = ["pts", "pas"];

  for (var studentId = 1; studentId <= 19; studentId++) {
    for (var subjectId = 1; subjectId <= 8; subjectId++) {
      var pattern = (studentId + subjectId) % 5;
      var filledCount = 0;                  // berapa komponen yang diisi
      if (pattern <= 2) { filledCount = 2; }
      if (pattern === 3) { filledCount = 1; }

      for (var c = 0; c < filledCount; c++) {
        var value = 60 + (studentId * 7 + subjectId * 11 + c * 13) % 40;
        if ((studentId + subjectId + c) % 4 === 0) { value = value + 0.75; }
        rows.push({
          id: nextId,
          student_id: studentId,
          subject_id: subjectId,
          component: componentKeys[c],
          value: value
        });
        nextId++;
      }
    }
  }
  return rows;
}

SEED_DATA.scores = buildSeedScores();
