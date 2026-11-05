// ============================================================
// utils.js - Fungsi bantu bersama (hitung nilai, format angka, validasi)
// Dipakai oleh guru.js, siswa.js, dan api.js.
// ============================================================

var Utils = {

  // ----- Validasi input nilai -----------------------------------
  // Menerima teks dari kotak input (boleh pakai koma atau titik).
  // Hasil:
  //   { empty: true }                     -> kosong (boleh)
  //   { valid: true, value: 80.5 }        -> valid
  //   { valid: false, message: "..." }    -> tidak valid
  parseScoreInput: function (text) {
    var clean = String(text).trim().replace(",", ".");
    if (clean === "") {
      return { empty: true, valid: true, value: null };
    }
    // Harus angka biasa: digit, lalu boleh titik dan digit
    if (!/^\d+(\.\d+)?$/.test(clean)) {
      return { valid: false, message: "Isi dengan angka 0–100" };
    }
    var parts = clean.split(".");
    var decimals = parts.length > 1 ? parts[1] : "";
    if (decimals.length > 2) {
      return { valid: false, message: "Maksimal 2 desimal" };
    }
    var value = Number(clean);
    if (value < 0 || value > 100) {
      return { valid: false, message: "Harus antara 0–100" };
    }
    return { valid: true, value: value };
  },

  // ----- Hitung nilai akhir -------------------------------------
  // scores = { pts: 80, pas: 85.5 }  (kosong = null)
  // Hasil: angka nilai akhir (2 desimal), atau null jika ada komponen kosong.
  //
  // Agar tidak ada floating point error, perhitungan memakai bilangan bulat:
  // nilai dikali 100 dulu (80,95 -> 8095), dibulatkan half-up, baru dibagi 100.
  calculateFinal: function (scores) {
    var total = 0;
    for (var i = 0; i < CONFIG.COMPONENTS.length; i++) {
      var component = CONFIG.COMPONENTS[i];
      var value = scores[component.key];
      // Nilai kosong TIDAK dianggap 0 -> nilai akhir tidak dihitung
      if (value === null || value === undefined) {
        return null;
      }
      var valueTimes100 = Math.round(value * 100);   // bilangan bulat
      total += valueTimes100 * component.weight;
    }
    // total = nilai akhir x 10000. Kita butuh x 100 dengan pembulatan half-up.
    var finalTimes100 = Math.floor((total + 50) / 100);
    return finalTimes100 / 100;
  },

  // Rata-rata dari daftar angka, dibulatkan half-up 2 desimal (tanpa error float)
  calculateAverage: function (numbers) {
    if (numbers.length === 0) {
      return null;
    }
    var sumTimes100 = 0;
    for (var i = 0; i < numbers.length; i++) {
      sumTimes100 += Math.round(numbers[i] * 100);
    }
    var count = numbers.length;
    // round(sum / count) half-up dengan bilangan bulat
    var averageTimes100 = Math.floor((2 * sumTimes100 + count) / (2 * count));
    return averageTimes100 / 100;
  },

  // ----- Status -------------------------------------------------
  // Hasil: { text: "Tuntas", cssClass: "status-pass" }
  // Status selalu berupa teks (warna hanya tambahan).
  getStatus: function (finalScore) {
    if (finalScore === null || finalScore === undefined) {
      return { text: "Belum lengkap", cssClass: "status-incomplete" };
    }
    if (finalScore >= CONFIG.KKM) {
      return { text: "Tuntas", cssClass: "status-pass" };
    }
    return { text: "Belum tuntas", cssClass: "status-fail" };
  },

  // ----- Format angka Indonesia (koma desimal) ------------------
  // fixed2 = true  -> selalu 2 desimal (90,00)
  // fixed2 = false -> tanpa nol di belakang (90 / 90,5)
  // Nilai kosong tampil "—".
  formatNumber: function (value, fixed2) {
    if (value === null || value === undefined) {
      return "—";
    }
    var text;
    if (fixed2) {
      text = value.toFixed(2);
    } else {
      text = String(Math.round(value * 100) / 100);
    }
    return text.replace(".", ",");
  },

  // ----- Keamanan tampilan --------------------------------------
  // Mengubah teks agar aman dimasukkan ke innerHTML
  escapeHtml: function (text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  // ----- Tampilan: loading / kosong / error / isi ---------------
  // Elemen yang punya atribut data-view="loading|empty|error|content"
  // hanya ditampilkan jika namanya sama dengan nama yang dipilih.
  showView: function (viewName) {
    var elements = document.querySelectorAll("[data-view]");
    for (var i = 0; i < elements.length; i++) {
      elements[i].hidden = (elements[i].getAttribute("data-view") !== viewName);
    }
  },

  // Teks tentang bobot, contoh: "PTS 50% + PAS 50%"
  getWeightText: function () {
    var parts = [];
    for (var i = 0; i < CONFIG.COMPONENTS.length; i++) {
      parts.push(CONFIG.COMPONENTS[i].label + " " + CONFIG.COMPONENTS[i].weight + "%");
    }
    return parts.join(" + ");
  }
};
