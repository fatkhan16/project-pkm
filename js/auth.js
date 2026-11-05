// ============================================================
// auth.js - Login, logout, dan penjagaan halaman berdasarkan peran.
//
// CATATAN: password plaintext hanya untuk demo. Di sistem asli,
// autentikasi (cek password, sesi/token) dikerjakan oleh backend.
// ============================================================

var Auth = {

  // ----- Penjagaan halaman --------------------------------------
  // Dipanggil di awal guru.js / siswa.js.
  // Jika belum login atau perannya salah -> arahkan ke index.html.
  // Jika benar -> Promise berisi data session, lalu halaman ditampilkan.
  requireRole: function (role) {
    return Api.getSession().then(function (session) {
      if (!session || session.role !== role) {
        window.location.replace("index.html");
        return new Promise(function () {});   // berhenti di sini (sedang pindah halaman)
      }
      document.getElementById("app").hidden = false;   // tampilkan halaman
      return session;
    });
  },

  // ----- Tombol Keluar ------------------------------------------
  // beforeLogout (opsional): fungsi yang mengembalikan false untuk membatalkan
  // (dipakai halaman guru untuk menanyakan perubahan yang belum disimpan).
  setupLogoutButton: function (beforeLogout) {
    var button = document.getElementById("logout-btn");
    button.addEventListener("click", function () {
      if (beforeLogout && beforeLogout() === false) {
        return;
      }
      button.disabled = true;
      Api.logout().then(function () {
        window.location.href = "index.html";
      });
    });
  },

  // ----- Halaman login (index.html) -----------------------------
  initLoginPage: function () {
    var form = document.getElementById("login-form");
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var usernameError = document.getElementById("username-error");
    var passwordError = document.getElementById("password-error");
    var loginError = document.getElementById("login-error");
    var loginButton = document.getElementById("login-btn");
    var resetButton = document.getElementById("reset-btn");
    var resetMessage = document.getElementById("reset-message");

    // Jika sudah login, langsung ke halaman sesuai peran
    Api.getSession().then(function (session) {
      if (session) {
        Auth.goToHome(session.role);
      }
    });

    // Menandai input salah / benar beserta pesannya
    function setFieldError(input, errorBox, message) {
      errorBox.textContent = message;
      errorBox.hidden = (message === "");
      if (message === "") {
        input.removeAttribute("aria-invalid");
      } else {
        input.setAttribute("aria-invalid", "true");
      }
    }

    // Kirim form login
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      loginError.hidden = true;

      var username = usernameInput.value.trim();
      var password = passwordInput.value;

      // Validasi: tidak boleh kosong
      setFieldError(usernameInput, usernameError, username === "" ? "Username wajib diisi." : "");
      setFieldError(passwordInput, passwordError, password === "" ? "Password wajib diisi." : "");
      if (username === "") { usernameInput.focus(); return; }
      if (password === "") { passwordInput.focus(); return; }

      loginButton.disabled = true;
      loginButton.textContent = "Memproses...";
      Api.login(username, password).then(function (session) {
        Auth.goToHome(session.role);
      }).catch(function (error) {
        loginError.textContent = error.message;
        loginError.hidden = false;
        loginButton.disabled = false;
        loginButton.textContent = "Masuk";
      });
    });

    // Daftar akun demo: klik untuk mengisi form
    Api.getDemoAccounts().then(function (accounts) {
      var teacherBox = document.getElementById("demo-teachers");
      var studentBox = document.getElementById("demo-students");
      for (var i = 0; i < accounts.length; i++) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.textContent = accounts[i].username;
        button.setAttribute("data-username", accounts[i].username);
        button.setAttribute("data-password", accounts[i].password);
        (accounts[i].role === "guru" ? teacherBox : studentBox).appendChild(button);
      }
    }).catch(function () {
      document.getElementById("demo-accounts").hidden = true;
    });

    document.getElementById("demo-accounts").addEventListener("click", function (event) {
      var target = event.target;
      if (target.classList.contains("chip")) {
        usernameInput.value = target.getAttribute("data-username");
        passwordInput.value = target.getAttribute("data-password");
        setFieldError(usernameInput, usernameError, "");
        setFieldError(passwordInput, passwordError, "");
        loginError.hidden = true;
        loginButton.focus();
      }
    });

    // Tombol reset data demo
    resetButton.addEventListener("click", function () {
      if (!window.confirm("Kembalikan semua data ke data awal? Nilai yang sudah diubah akan hilang.")) {
        return;
      }
      Api.resetDemoData().then(function () {
        resetMessage.textContent = "Data demo sudah dikembalikan ke data awal.";
        resetMessage.hidden = false;
      }).catch(function (error) {
        resetMessage.textContent = "Gagal reset data: " + error.message;
        resetMessage.hidden = false;
      });
    });
  },

  // Pindah ke halaman sesuai peran
  goToHome: function (role) {
    window.location.href = (role === "guru") ? "guru.html" : "siswa.html";
  }
};
