// ============================================================
// api.js - SATU-SATUNYA tempat membaca dan menyimpan data.
//
// Aturan: file lain DILARANG memakai localStorage / sessionStorage langsung.
// Semua data diambil lewat fungsi Api.xxx() di bawah.
//
// Saat ini data disimpan di localStorage browser (data awal dari data.js).
// Semua fungsi mengembalikan Promise, jadi nanti saat database siap
// cukup ganti ISI fungsi dengan fetch() ke backend. File lain tidak perlu diubah.
//
// Cara pakai:  Api.getTeacherAssignments(1).then(function (list) { ... });
// ============================================================

var Api = (function () {

  // Nama kunci penyimpanan di browser
  var DB_KEY = "sinilai_db";            // seluruh data (localStorage)
  var SESSION_KEY = "sinilai_session";  // data login (sessionStorage)

  // Jeda palsu (milidetik) untuk meniru waktu menunggu server,
  // supaya tampilan "Memuat..." bisa terlihat. HAPUS saat memakai backend.
  var FAKE_DELAY_MS = 150;

  // ===== Fungsi bantu internal (tidak dipakai di luar file ini) =====

  // Membungkus pekerjaan sinkron menjadi Promise.
  // Jika work() melempar Error, Promise ditolak (reject).
  function respond(work) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          resolve(work());
        } catch (error) {
          reject(error);
        }
      }, FAKE_DELAY_MS);
    });
  }

  // Menyalin objek (supaya data asli tidak ikut berubah)
  function copy(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // Menulis seluruh data ke localStorage
  function writeDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  // Membaca seluruh data. Jika belum ada, pakai data awal dari data.js.
  function readDb() {
    var text = localStorage.getItem(DB_KEY);
    if (text) {
      try {
        return JSON.parse(text);
      } catch (error) {
        // data rusak -> mulai ulang dari data awal
      }
    }
    var fresh = copy(SEED_DATA);
    writeDb(fresh);
    return fresh;
  }

  // Mencari satu item di array berdasarkan id
  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return list[i];
      }
    }
    return null;
  }

  // Membaca session dari sessionStorage (null jika belum login)
  function readSession() {
    var text = sessionStorage.getItem(SESSION_KEY);
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  // Memastikan sudah login dengan peran tertentu. Jika tidak, lempar Error.
  // (Di sistem asli, pengecekan ini dikerjakan backend di setiap request.)
  function requireSession(role) {
    var session = readSession();
    if (!session || session.role !== role) {
      throw new Error("Sesi tidak valid. Silakan masuk kembali.");
    }
    return session;
  }

  // Mengambil nilai satu siswa untuk satu mapel -> { pts: 80, pas: null }
  function getScoresOf(db, studentId, subjectId) {
    var result = {};
    for (var i = 0; i < CONFIG.COMPONENTS.length; i++) {
      result[CONFIG.COMPONENTS[i].key] = null;   // awalnya kosong
    }
    for (var j = 0; j < db.scores.length; j++) {
      var row = db.scores[j];
      if (row.student_id === studentId && row.subject_id === subjectId) {
        result[row.component] = row.value;
      }
    }
    return result;
  }

  // Cek nilai valid: null atau angka 0-100 dengan maksimal 2 desimal
  function isValidScore(value) {
    if (value === null) {
      return true;
    }
    if (typeof value !== "number" || isNaN(value)) {
      return false;
    }
    if (value < 0 || value > 100) {
      return false;
    }
    return Math.abs(value * 100 - Math.round(value * 100)) < 0.000001;
  }

  // Cek apakah key komponen dikenal (ada di CONFIG.COMPONENTS)
  function isKnownComponent(key) {
    for (var i = 0; i < CONFIG.COMPONENTS.length; i++) {
      if (CONFIG.COMPONENTS[i].key === key) {
        return true;
      }
    }
    return false;
  }

  // ===== Fungsi publik =====
  return {

    // ----------------------------------------------------------
    // login(username, password)
    //
    // Input  : "guru1", "guru123"
    // Output : {
    //   "userId": 1, "username": "guru1", "role": "guru",
    //   "name": "Hj. Siti Aminah, S.Pd.I.",
    //   "teacherId": 1, "studentId": null
    // }
    // Gagal  : Promise ditolak dengan Error("Username atau password salah.")
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ username: username, password: password })
    //   }).then(function (res) {
    //     if (!res.ok) { throw new Error("Username atau password salah."); }
    //     return res.json();   // backend sebaiknya memakai cookie/token sesi
    //   });
    // ----------------------------------------------------------
    login: function (username, password) {
      return respond(function () {
        var db = readDb();
        var cleanName = String(username).trim().toLowerCase();
        var user = null;
        for (var i = 0; i < db.users.length; i++) {
          // Password plaintext hanya untuk demo!
          if (db.users[i].username === cleanName && db.users[i].password === password) {
            user = db.users[i];
          }
        }
        if (!user) {
          throw new Error("Username atau password salah.");
        }

        var session = {
          userId: user.id,
          username: user.username,
          role: user.role,
          name: "",
          teacherId: null,
          studentId: null
        };
        if (user.role === "guru") {
          for (var t = 0; t < db.teachers.length; t++) {
            if (db.teachers[t].user_id === user.id) {
              session.teacherId = db.teachers[t].id;
              session.name = db.teachers[t].name;
            }
          }
        } else {
          for (var s = 0; s < db.students.length; s++) {
            if (db.students[s].user_id === user.id) {
              session.studentId = db.students[s].id;
              session.name = db.students[s].name;
            }
          }
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
      });
    },

    // ----------------------------------------------------------
    // logout()
    //
    // Input  : (tidak ada)
    // Output : { "ok": true }
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/logout", { method: "POST" })
    //     .then(function () { return { ok: true }; });
    // ----------------------------------------------------------
    logout: function () {
      return respond(function () {
        sessionStorage.removeItem(SESSION_KEY);
        return { ok: true };
      });
    },

    // ----------------------------------------------------------
    // getSession()
    //
    // Input  : (tidak ada)
    // Output : objek session seperti hasil login(), atau null jika belum login
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/session").then(function (res) {
    //     return res.ok ? res.json() : null;
    //   });
    // ----------------------------------------------------------
    getSession: function () {
      return respond(function () {
        return readSession();
      });
    },

    // ----------------------------------------------------------
    // getTeacherAssignments(teacherId)
    // Daftar mapel + kelas yang diampu satu guru.
    //
    // Input  : 1
    // Output : [
    //   { "id": 1, "subjectId": 1, "subjectName": "Pendidikan Agama",
    //     "classId": 1, "className": "X-1" },
    //   ...
    // ]
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/teachers/" + teacherId + "/assignments")
    //     .then(function (res) { return res.json(); });
    // ----------------------------------------------------------
    getTeacherAssignments: function (teacherId) {
      return respond(function () {
        var session = requireSession("guru");
        if (session.teacherId !== teacherId) {
          throw new Error("Akses ditolak.");
        }
        var db = readDb();
        var result = [];
        for (var i = 0; i < db.teaching_assignments.length; i++) {
          var a = db.teaching_assignments[i];
          if (a.teacher_id === teacherId) {
            result.push({
              id: a.id,
              subjectId: a.subject_id,
              subjectName: findById(db.subjects, a.subject_id).name,
              classId: a.class_id,
              className: findById(db.classes, a.class_id).name
            });
          }
        }
        return result;
      });
    },

    // ----------------------------------------------------------
    // getAssignmentScores(assignmentId)
    // Daftar siswa di kelas penugasan itu, beserta nilainya.
    // Nilai kosong = null (BUKAN 0).
    //
    // Input  : 1
    // Output : {
    //   "assignment": { "id": 1, "subjectName": "Pendidikan Agama", "className": "X-1" },
    //   "students": [
    //     { "studentId": 1, "nis": "2026001", "name": "Ahmad Fauzi",
    //       "scores": { "pts": 80, "pas": null } },
    //     ...
    //   ]
    // }
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/assignments/" + assignmentId + "/scores")
    //     .then(function (res) { return res.json(); });
    // ----------------------------------------------------------
    getAssignmentScores: function (assignmentId) {
      return respond(function () {
        var session = requireSession("guru");
        var db = readDb();
        var assignment = findById(db.teaching_assignments, assignmentId);
        if (!assignment || assignment.teacher_id !== session.teacherId) {
          throw new Error("Akses ditolak.");
        }

        var students = [];
        for (var i = 0; i < db.students.length; i++) {
          var student = db.students[i];
          if (student.class_id === assignment.class_id) {
            students.push({
              studentId: student.id,
              nis: student.nis,
              name: student.name,
              scores: getScoresOf(db, student.id, assignment.subject_id)
            });
          }
        }
        return {
          assignment: {
            id: assignment.id,
            subjectName: findById(db.subjects, assignment.subject_id).name,
            className: findById(db.classes, assignment.class_id).name
          },
          students: students
        };
      });
    },

    // ----------------------------------------------------------
    // saveScores(assignmentId, changes)
    // Menyimpan nilai siswa yang berubah. Nilai null = dikosongkan.
    //
    // Input  : 1, [
    //   { "studentId": 1, "scores": { "pts": 80.5, "pas": null } },
    //   { "studentId": 2, "scores": { "pts": 90,   "pas": 85 } }
    // ]
    // Output : { "ok": true, "savedStudents": 2 }
    // Gagal  : Promise ditolak dengan Error("pesan yang jelas")
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/assignments/" + assignmentId + "/scores", {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ changes: changes })
    //   }).then(function (res) {
    //     if (!res.ok) { throw new Error("Gagal menyimpan nilai."); }
    //     return res.json();
    //   });
    // ----------------------------------------------------------
    saveScores: function (assignmentId, changes) {
      return respond(function () {
        var session = requireSession("guru");
        var db = readDb();
        var assignment = findById(db.teaching_assignments, assignmentId);
        if (!assignment || assignment.teacher_id !== session.teacherId) {
          throw new Error("Akses ditolak.");
        }

        // 1) Periksa semua perubahan dulu. Jika ada yang salah, tidak ada yang disimpan.
        var i, key;
        for (i = 0; i < changes.length; i++) {
          var student = findById(db.students, changes[i].studentId);
          if (!student || student.class_id !== assignment.class_id) {
            throw new Error("Ada siswa yang bukan anggota kelas ini.");
          }
          for (key in changes[i].scores) {
            if (!isKnownComponent(key)) {
              throw new Error("Komponen nilai tidak dikenal: " + key);
            }
            if (!isValidScore(changes[i].scores[key])) {
              throw new Error("Nilai harus 0–100 dengan maksimal 2 desimal.");
            }
          }
        }

        // 2) Simpan
        for (i = 0; i < changes.length; i++) {
          for (key in changes[i].scores) {
            var newValue = changes[i].scores[key];
            // cari baris nilai yang sudah ada
            var index = -1;
            for (var j = 0; j < db.scores.length; j++) {
              var row = db.scores[j];
              if (row.student_id === changes[i].studentId &&
                  row.subject_id === assignment.subject_id &&
                  row.component === key) {
                index = j;
              }
            }

            if (newValue === null) {
              if (index >= 0) { db.scores.splice(index, 1); }   // hapus = kosong
            } else if (index >= 0) {
              db.scores[index].value = newValue;                // ubah
            } else {
              var maxId = 0;                                    // tambah baru
              for (var k = 0; k < db.scores.length; k++) {
                if (db.scores[k].id > maxId) { maxId = db.scores[k].id; }
              }
              db.scores.push({
                id: maxId + 1,
                student_id: changes[i].studentId,
                subject_id: assignment.subject_id,
                component: key,
                value: newValue
              });
            }
          }
        }
        writeDb(db);
        return { ok: true, savedStudents: changes.length };
      });
    },

    // ----------------------------------------------------------
    // getStudentGrades(studentId)
    // Nilai semua mapel milik satu siswa (hanya boleh milik sendiri).
    //
    // Input  : 1
    // Output : {
    //   "student": { "id": 1, "nis": "2026001", "name": "Ahmad Fauzi", "className": "X-1" },
    //   "grades": [
    //     { "subjectId": 1, "subjectName": "Pendidikan Agama",
    //       "scores": { "pts": 80, "pas": null } },
    //     ...
    //   ]
    // }
    //
    // GANTI DI SINI saat database siap, contoh:
    //   return fetch("/api/students/" + studentId + "/grades")
    //     .then(function (res) { return res.json(); });
    // (backend harus memastikan siswa hanya bisa melihat datanya sendiri)
    // ----------------------------------------------------------
    getStudentGrades: function (studentId) {
      return respond(function () {
        var session = requireSession("siswa");
        if (session.studentId !== studentId) {
          throw new Error("Akses ditolak. Anda hanya boleh melihat nilai sendiri.");
        }
        var db = readDb();
        var student = findById(db.students, studentId);
        if (!student) {
          throw new Error("Data siswa tidak ditemukan.");
        }

        // Mapel siswa = mapel yang diajarkan di kelasnya
        var grades = [];
        var seen = {};
        for (var i = 0; i < db.teaching_assignments.length; i++) {
          var a = db.teaching_assignments[i];
          if (a.class_id === student.class_id && !seen[a.subject_id]) {
            seen[a.subject_id] = true;
            grades.push({
              subjectId: a.subject_id,
              subjectName: findById(db.subjects, a.subject_id).name,
              scores: getScoresOf(db, studentId, a.subject_id)
            });
          }
        }
        grades.sort(function (x, y) { return x.subjectId - y.subjectId; });

        return {
          student: {
            id: student.id,
            nis: student.nis,
            name: student.name,
            className: findById(db.classes, student.class_id).name
          },
          grades: grades
        };
      });
    },

    // ----------------------------------------------------------
    // getDemoAccounts()
    // Daftar akun demo untuk ditampilkan di halaman login.
    // Hanya untuk demo - TIDAK perlu ada di backend asli.
    //
    // Output : [ { "username": "guru1", "password": "guru123", "role": "guru" }, ... ]
    // ----------------------------------------------------------
    getDemoAccounts: function () {
      return respond(function () {
        var result = [];
        for (var i = 0; i < SEED_DATA.users.length; i++) {
          var u = SEED_DATA.users[i];
          result.push({ username: u.username, password: u.password, role: u.role });
        }
        return result;
      });
    },

    // ----------------------------------------------------------
    // resetDemoData()
    // Mengembalikan semua data ke data awal (data.js) dan mengeluarkan session.
    // Hanya untuk demo - TIDAK perlu ada di backend asli.
    //
    // Output : { "ok": true }
    // ----------------------------------------------------------
    resetDemoData: function () {
      return respond(function () {
        writeDb(copy(SEED_DATA));
        sessionStorage.removeItem(SESSION_KEY);
        return { ok: true };
      });
    }
  };
})();
