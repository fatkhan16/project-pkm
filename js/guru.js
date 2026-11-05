// ============================================================
// guru.js - Logika halaman guru (input nilai)
// ============================================================

// Data yang sedang dipakai halaman
var state = {
  session: null,        // data guru yang login
  assignments: [],      // daftar penugasan (mapel + kelas) milik guru
  subjectId: null,      // mapel yang sedang dipilih
  classId: null,        // kelas yang sedang dipilih
  assignmentId: null,   // penugasan yang sedang dibuka
  rows: [],             // baris siswa (lihat renderTable)
  requestCount: 0,      // penanda permintaan terakhir (menghindari data tertukar)
  retry: null,          // fungsi yang dipanggil tombol "Coba lagi"
  allowLeave: false     // true = jangan tampilkan peringatan saat meninggalkan halaman
};

// Elemen-elemen halaman
var subjectSelect = document.getElementById("subject-select");
var classSelect = document.getElementById("class-select");
var scoreBody = document.getElementById("score-body");
var saveButton = document.getElementById("save-btn");
var saveMessage = document.getElementById("save-message");

// ----- Awal halaman -------------------------------------------
Auth.requireRole("guru").then(function (session) {
  state.session = session;
  document.getElementById("header-name").textContent = session.name;
  document.getElementById("header-semester").textContent = CONFIG.SEMESTER_LABEL;
  loadAssignments();
});

// Tombol Keluar: tanya dulu jika ada perubahan belum disimpan
Auth.setupLogoutButton(function () {
  if (hasUnsavedChanges()) {
    if (!window.confirm("Ada perubahan nilai yang belum disimpan. Tetap keluar?")) {
      return false;
    }
    state.allowLeave = true;
  }
});

// Peringatan jika menutup / meninggalkan halaman saat ada perubahan belum disimpan
window.addEventListener("beforeunload", function (event) {
  if (!state.allowLeave && hasUnsavedChanges()) {
    event.preventDefault();
    event.returnValue = "";   // diperlukan oleh beberapa browser
  }
});

// Tombol "Coba lagi" pada tampilan error
document.getElementById("retry-btn").addEventListener("click", function () {
  if (state.retry) {
    state.retry();
  }
});

// ----- Memuat daftar mapel & kelas ----------------------------
function loadAssignments() {
  Utils.showView("loading");
  state.retry = loadAssignments;

  Api.getTeacherAssignments(state.session.teacherId).then(function (list) {
    state.assignments = list;
    if (list.length === 0) {
      Utils.showView("empty");
      return;
    }

    // Isi dropdown mapel (tanpa duplikat)
    var subjectOptions = "";
    var seen = {};
    for (var i = 0; i < list.length; i++) {
      if (!seen[list[i].subjectId]) {
        seen[list[i].subjectId] = true;
        subjectOptions += '<option value="' + list[i].subjectId + '">' +
          Utils.escapeHtml(list[i].subjectName) + "</option>";
      }
    }
    subjectSelect.innerHTML = subjectOptions;
    state.subjectId = Number(subjectSelect.value);
    fillClassOptions(state.subjectId, null);
    state.classId = Number(classSelect.value);

    Utils.showView("content");
    loadScores();
  }).catch(showError);
}

// Isi dropdown kelas: hanya kelas yang diampu untuk mapel itu
function fillClassOptions(subjectId, preferredClassId) {
  var html = "";
  for (var i = 0; i < state.assignments.length; i++) {
    var a = state.assignments[i];
    if (a.subjectId === subjectId) {
      html += '<option value="' + a.classId + '">' + Utils.escapeHtml(a.className) + "</option>";
    }
  }
  classSelect.innerHTML = html;
  if (preferredClassId !== null) {
    classSelect.value = String(preferredClassId);
    if (classSelect.value === "") {
      classSelect.selectedIndex = 0;   // kelas pilihan tidak ada -> ambil yang pertama
    }
  }
}

// Mencari id penugasan dari mapel + kelas yang dipilih
function findAssignmentId(subjectId, classId) {
  for (var i = 0; i < state.assignments.length; i++) {
    var a = state.assignments[i];
    if (a.subjectId === subjectId && a.classId === classId) {
      return a.id;
    }
  }
  return null;
}

// Dropdown berubah
subjectSelect.addEventListener("change", handleSelectionChange);
classSelect.addEventListener("change", handleSelectionChange);

function handleSelectionChange() {
  // Jika ada perubahan belum disimpan, tanya dulu
  if (hasUnsavedChanges()) {
    if (!window.confirm("Ada perubahan nilai yang belum disimpan. Pindah tanpa menyimpan?")) {
      subjectSelect.value = String(state.subjectId);   // kembalikan pilihan lama
      fillClassOptions(state.subjectId, state.classId);
      return;
    }
  }
  state.subjectId = Number(subjectSelect.value);
  fillClassOptions(state.subjectId, Number(classSelect.value));
  state.classId = Number(classSelect.value);
  loadScores();
}

// ----- Memuat nilai satu mapel + kelas ------------------------
function loadScores() {
  var assignmentId = findAssignmentId(state.subjectId, state.classId);
  state.assignmentId = assignmentId;
  state.retry = loadScores;
  state.requestCount++;
  var thisRequest = state.requestCount;

  // Tampilkan "memuat" di area tabel
  Utils.showView("content");
  state.rows = [];
  document.getElementById("table-wrap").hidden = true;
  var status = document.getElementById("table-status");
  status.textContent = "Memuat nilai...";
  status.hidden = false;
  saveMessage.textContent = "";
  updateButtons();
  updateSummary();

  Api.getAssignmentScores(assignmentId).then(function (data) {
    if (thisRequest !== state.requestCount) { return; }   // permintaan lama, abaikan
    Utils.showView("content");
    renderTable(data);
  }).catch(function (error) {
    if (thisRequest !== state.requestCount) { return; }
    showError(error);
  });
}

// Menampilkan tampilan error
function showError(error) {
  document.getElementById("error-text").textContent =
    "Gagal memuat data: " + (error && error.message ? error.message : "kesalahan tidak diketahui");
  Utils.showView("error");
}

// ----- Membuat tabel ------------------------------------------
function renderTable(data) {
  var components = CONFIG.COMPONENTS;

  // Judul kolom
  var head = "<tr><th>No</th><th>NIS</th><th>Nama</th>";
  for (var c = 0; c < components.length; c++) {
    head += "<th>" + Utils.escapeHtml(components[c].label) + "</th>";
  }
  head += "<th>Nilai Akhir</th><th>Status</th></tr>";
  document.querySelector(".grade-table thead").innerHTML = head;

  document.getElementById("table-caption").textContent =
    "Nilai " + data.assignment.subjectName + " kelas " + data.assignment.className;
  document.getElementById("grade-info").textContent =
    "KKM " + CONFIG.KKM + " · Bobot: " + Utils.getWeightText() +
    " · Nilai akhir muncul jika semua komponen terisi.";

  // Isi baris
  state.rows = [];
  var body = "";
  for (var i = 0; i < data.students.length; i++) {
    var student = data.students[i];

    // Simpan data baris: nilai asli (dari database) dan nilai sekarang (di kotak)
    state.rows.push({
      studentId: student.studentId,
      original: student.scores,
      current: JSON.parse(JSON.stringify(student.scores)),
      invalid: false,
      changed: false,
      finalScore: null
    });

    body += '<tr>' +
      '<td data-label="No">' + (i + 1) + '</td>' +
      '<td data-label="NIS">' + Utils.escapeHtml(student.nis) + '</td>' +
      '<td data-label="Nama" class="cell-name">' + Utils.escapeHtml(student.name) + '</td>';

    for (var k = 0; k < components.length; k++) {
      var key = components[k].key;
      var inputId = "score-" + i + "-" + key;
      var errorId = "error-" + i + "-" + key;
      var value = student.scores[key];
      body += '<td data-label="' + Utils.escapeHtml(components[k].label) + '" class="cell-input">' +
        '<label class="visually-hidden" for="' + inputId + '">' +
          Utils.escapeHtml(components[k].label + " " + student.name) + '</label>' +
        '<input type="text" inputmode="decimal" autocomplete="off" class="score-input"' +
          ' id="' + inputId + '" data-index="' + i + '" data-key="' + key + '"' +
          ' value="' + (value === null ? "" : Utils.formatNumber(value, false)) + '"' +
          ' aria-describedby="' + errorId + '">' +
        '<span class="cell-error" id="' + errorId + '" hidden></span>' +
        '</td>';
    }

    body += '<td data-label="Nilai Akhir" class="cell-final" id="final-' + i + '">—</td>' +
      '<td data-label="Status"><span class="status" id="status-' + i + '"></span></td>' +
      '</tr>';
  }
  scoreBody.innerHTML = body;

  // Hitung tampilan awal tiap baris
  for (var r = 0; r < state.rows.length; r++) {
    updateRow(r);
  }
  document.getElementById("table-status").hidden = true;
  document.getElementById("table-wrap").hidden = false;
  updateButtons();
  updateSummary();
}

// ----- Memperbarui satu baris (saat mengetik) -----------------
function updateRow(index) {
  var row = state.rows[index];
  var components = CONFIG.COMPONENTS;
  var scores = {};
  row.invalid = false;
  row.changed = false;

  for (var c = 0; c < components.length; c++) {
    var key = components[c].key;
    var input = document.getElementById("score-" + index + "-" + key);
    var errorBox = document.getElementById("error-" + index + "-" + key);
    var result = Utils.parseScoreInput(input.value);

    if (result.valid) {
      scores[key] = result.value;
      input.removeAttribute("aria-invalid");
      errorBox.hidden = true;
      errorBox.textContent = "";
      if (result.value !== row.original[key]) { row.changed = true; }
    } else {
      scores[key] = null;
      row.invalid = true;
      row.changed = true;
      input.setAttribute("aria-invalid", "true");
      errorBox.textContent = result.message;
      errorBox.hidden = false;
    }
  }
  row.current = scores;

  // Nilai akhir + status (null jika ada komponen kosong / tidak valid)
  row.finalScore = row.invalid ? null : Utils.calculateFinal(scores);
  var status = Utils.getStatus(row.finalScore);
  document.getElementById("final-" + index).textContent = Utils.formatNumber(row.finalScore, true);
  var statusBox = document.getElementById("status-" + index);
  statusBox.textContent = status.text;
  statusBox.className = "status " + status.cssClass;
}

// Saat ada ketikan di salah satu kotak nilai
scoreBody.addEventListener("input", function (event) {
  var input = event.target;
  if (!input.classList.contains("score-input")) { return; }
  updateRow(Number(input.getAttribute("data-index")));
  saveMessage.textContent = "";
  saveMessage.className = "save-message";
  updateButtons();
  updateSummary();
});

// Tekan Enter -> pindah ke sel yang sama di baris bawah
scoreBody.addEventListener("keydown", function (event) {
  if (event.key !== "Enter") { return; }
  var input = event.target;
  if (!input.classList.contains("score-input")) { return; }
  event.preventDefault();
  var nextIndex = Number(input.getAttribute("data-index")) + 1;
  var next = document.getElementById("score-" + nextIndex + "-" + input.getAttribute("data-key"));
  if (next) {
    next.focus();
    next.select();
  }
});

// ----- Tombol simpan & peringatan -----------------------------
function hasUnsavedChanges() {
  for (var i = 0; i < state.rows.length; i++) {
    if (state.rows[i].changed) { return true; }
  }
  return false;
}

function hasInvalidCell() {
  for (var i = 0; i < state.rows.length; i++) {
    if (state.rows[i].invalid) { return true; }
  }
  return false;
}

// Tombol simpan aktif hanya jika ada perubahan dan semua sel valid
function updateButtons() {
  var invalid = hasInvalidCell();
  saveButton.disabled = !hasUnsavedChanges() || invalid;
  if (invalid) {
    saveMessage.textContent = "Perbaiki nilai yang berborder merah sebelum menyimpan.";
    saveMessage.className = "save-message save-warning";
  } else if (saveMessage.className.indexOf("save-warning") >= 0) {
    saveMessage.textContent = "";
    saveMessage.className = "save-message";
  }
}

saveButton.addEventListener("click", function () {
  // Kumpulkan hanya baris yang berubah
  var changes = [];
  for (var i = 0; i < state.rows.length; i++) {
    if (state.rows[i].changed) {
      changes.push({ studentId: state.rows[i].studentId, scores: state.rows[i].current });
    }
  }
  if (changes.length === 0) { return; }

  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";
  saveMessage.textContent = "";
  saveMessage.className = "save-message";

  Api.saveScores(state.assignmentId, changes).then(function () {
    // Nilai di kotak sekarang menjadi nilai "asli"
    for (var r = 0; r < state.rows.length; r++) {
      var row = state.rows[r];
      row.original = JSON.parse(JSON.stringify(row.current));
      for (var c = 0; c < CONFIG.COMPONENTS.length; c++) {
        var key = CONFIG.COMPONENTS[c].key;
        var input = document.getElementById("score-" + r + "-" + key);
        input.value = row.current[key] === null ? "" : Utils.formatNumber(row.current[key], false);
      }
      updateRow(r);
    }
    saveButton.textContent = "Simpan Perubahan";
    updateButtons();
    saveMessage.textContent = "Perubahan nilai berhasil disimpan.";
    saveMessage.className = "save-message save-success";
  }).catch(function (error) {
    saveButton.textContent = "Simpan Perubahan";
    updateButtons();
    saveMessage.textContent = "Gagal menyimpan: " + error.message;
    saveMessage.className = "save-message save-warning";
  });
});

// ----- Ringkasan kelas ----------------------------------------
// Hanya menghitung siswa yang nilainya lengkap
function updateSummary() {
  var finals = [];
  for (var i = 0; i < state.rows.length; i++) {
    if (state.rows[i].finalScore !== null) {
      finals.push(state.rows[i].finalScore);
    }
  }

  var average = Utils.calculateAverage(finals);
  var max = finals.length > 0 ? Math.max.apply(null, finals) : null;
  var min = finals.length > 0 ? Math.min.apply(null, finals) : null;
  var failCount = 0;
  for (var j = 0; j < finals.length; j++) {
    if (finals[j] < CONFIG.KKM) { failCount++; }
  }

  document.getElementById("sum-average").textContent = Utils.formatNumber(average, true);
  document.getElementById("sum-max").textContent = Utils.formatNumber(max, true);
  document.getElementById("sum-min").textContent = Utils.formatNumber(min, true);
  document.getElementById("sum-fail").textContent = finals.length > 0 ? String(failCount) : "—";
  document.getElementById("sum-note").textContent = state.rows.length === 0 ? "" :
    "Dihitung dari " + finals.length + " dari " + state.rows.length + " siswa yang nilainya lengkap.";
}
