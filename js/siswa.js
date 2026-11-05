// ============================================================
// siswa.js - Logika halaman siswa (hanya melihat nilai sendiri)
// ============================================================

var studentSession = null;   // data siswa yang login

Auth.requireRole("siswa").then(function (session) {
  studentSession = session;
  document.getElementById("header-name").textContent = session.name;
  document.getElementById("header-semester").textContent = CONFIG.SEMESTER_LABEL;
  loadGrades();
});

Auth.setupLogoutButton();

document.getElementById("retry-btn").addEventListener("click", loadGrades);

// ----- Memuat nilai -------------------------------------------
function loadGrades() {
  Utils.showView("loading");

  // Hanya meminta data milik siswa yang login
  Api.getStudentGrades(studentSession.studentId).then(function (data) {
    document.getElementById("header-class").textContent = "Kelas " + data.student.className;
    renderGrades(data);
  }).catch(function (error) {
    document.getElementById("error-text").textContent =
      "Gagal memuat nilai: " + (error && error.message ? error.message : "kesalahan tidak diketahui");
    Utils.showView("error");
  });
}

// ----- Menampilkan nilai --------------------------------------
function renderGrades(data) {
  var components = CONFIG.COMPONENTS;

  // Jika tidak ada satu pun nilai terisi -> "Belum ada nilai"
  var hasAnyScore = false;
  for (var g = 0; g < data.grades.length; g++) {
    for (var c = 0; c < components.length; c++) {
      if (data.grades[g].scores[components[c].key] !== null) {
        hasAnyScore = true;
      }
    }
  }
  if (!hasAnyScore) {
    Utils.showView("empty");
    return;
  }

  // Judul kolom
  var head = "<tr><th>Mata Pelajaran</th>";
  for (var h = 0; h < components.length; h++) {
    head += "<th>" + Utils.escapeHtml(components[h].label) + "</th>";
  }
  head += "<th>Nilai Akhir</th><th>Status</th><th>KKM</th></tr>";
  document.querySelector(".grade-table thead").innerHTML = head;

  document.getElementById("grade-info").textContent =
    "Bobot: " + Utils.getWeightText() + " · Nilai akhir muncul jika semua komponen terisi.";

  // Isi baris + kumpulkan nilai akhir untuk ringkasan
  var body = "";
  var finals = [];
  var passCount = 0;

  for (var i = 0; i < data.grades.length; i++) {
    var grade = data.grades[i];
    var finalScore = Utils.calculateFinal(grade.scores);
    var status = Utils.getStatus(finalScore);

    if (finalScore !== null) {
      finals.push(finalScore);
      if (finalScore >= CONFIG.KKM) { passCount++; }
    }

    body += "<tr>" +
      '<td data-label="Mata Pelajaran" class="cell-name">' + Utils.escapeHtml(grade.subjectName) + "</td>";
    for (var k = 0; k < components.length; k++) {
      body += '<td data-label="' + Utils.escapeHtml(components[k].label) + '">' +
        Utils.formatNumber(grade.scores[components[k].key], false) + "</td>";
    }
    body += '<td data-label="Nilai Akhir" class="cell-final">' + Utils.formatNumber(finalScore, true) + "</td>" +
      '<td data-label="Status"><span class="status ' + status.cssClass + '">' + status.text + "</span></td>" +
      '<td data-label="KKM">' + CONFIG.KKM + "</td>" +
      "</tr>";
  }
  document.getElementById("grade-body").innerHTML = body;

  // Ringkasan (hanya dari mapel yang nilainya lengkap)
  document.getElementById("sum-average").textContent =
    Utils.formatNumber(Utils.calculateAverage(finals), true);
  document.getElementById("sum-pass").textContent =
    finals.length > 0 ? passCount + " dari " + finals.length : "—";
  document.getElementById("sum-note").textContent =
    "Dihitung dari " + finals.length + " dari " + data.grades.length + " mapel yang nilainya lengkap.";

  Utils.showView("content");
}
