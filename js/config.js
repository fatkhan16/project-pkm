// ============================================================
// config.js - Pengaturan penilaian (ubah di sini, bukan di tempat lain)
// ============================================================

var CONFIG = {
  // Kriteria Ketuntasan Minimal, berlaku untuk semua mapel
  KKM: 75,

  // Teks semester & tahun ajaran yang tampil di header
  SEMESTER_LABEL: "Semester Ganjil 2026/2027",

  // Daftar komponen nilai.
  //   key    = nama kunci yang disimpan di data (jangan diubah setelah ada nilai)
  //   label  = nama yang tampil di tabel
  //   weight = bobot dalam persen (jumlah semua bobot HARUS 100, bilangan bulat)
  // TODO: Bobot PTS 50% dan PAS 50% di bawah ini masih PLACEHOLDER.
  //       Harus dikonfirmasi ke pihak sekolah sebelum dipakai sungguhan.
  COMPONENTS: [
    { key: "pts", label: "PTS", weight: 50 },
    { key: "pas", label: "PAS", weight: 50 }
  ]
};

// Pengecekan sederhana: beri peringatan di console jika total bobot bukan 100
(function () {
  var total = 0;
  for (var i = 0; i < CONFIG.COMPONENTS.length; i++) {
    total += CONFIG.COMPONENTS[i].weight;
  }
  if (total !== 100) {
    console.warn("Total bobot komponen nilai harus 100, sekarang: " + total);
  }
})();
