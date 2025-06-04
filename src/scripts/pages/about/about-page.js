class AboutPage {
  async render() {
    return `
      <section class="container about-page-section">
        <div class="about-content-wrapper">
          <h1 class="about-title">Tentang</h1>

          <article class="about-section">
            <h2>Selamat Datang!</h2>
            <p>
              Dicoding Story App adalah sebuah platform Single-Page Application (SPA) yang dirancang untuk memungkinkan pengguna berbagi cerita, pengalaman, atau momen berkesan mereka. Setiap cerita dapat dilengkapi dengan foto menarik dan data lokasi geografis, menjadikannya lebih hidup dan personal.
            </p>
            <p>
              Proyek ini dibangun dari awal menggunakan Vanilla JavaScript, dengan fokus pada penerapan arsitektur Model-View-Presenter (MVP) dan berbagai Web API modern untuk menciptakan pengalaman pengguna yang interaktif dan responsif.
            </p>
          </article>

          <article class="about-section">
            <h2>Fitur Utama Aplikasi</h2>
            <ul>
              <li><strong>Autentikasi Pengguna:</strong> Sistem registrasi dan login yang aman untuk pengguna.</li>
              <li><strong>Berbagi Cerita:</strong> Pengguna dapat membuat cerita baru dengan deskripsi naratif.</li>
              <li><strong>Unggah Foto:</strong> Setiap cerita dapat disertai dengan foto yang bisa diambil langsung melalui kamera perangkat atau diunggah dari galeri.</li>
              <li><strong>Pelabelan Lokasi (Geolocation):</strong> Pengguna dapat menandai lokasi cerita mereka dengan memilih titik di peta digital atau menggunakan lokasi mereka saat ini secara otomatis.</li>
              <li><strong>Tampilan Cerita Interaktif:</strong> Cerita-cerita ditampilkan dalam format daftar yang menarik di halaman beranda, lengkap dengan peta yang menunjukkan semua lokasi cerita.</li>
              <li><strong>Detail Cerita:</strong> Halaman khusus untuk melihat detail lengkap dari setiap cerita, termasuk peta lokasi spesifiknya.</li>
              <li><strong>Single-Page Application (SPA):</strong> Navigasi antar halaman yang cepat dan mulus tanpa memuat ulang seluruh halaman, didukung oleh View Transitions API.</li>
              <li><strong>Desain Responsif & Aksesibel:</strong> Antarmuka yang beradaptasi dengan berbagai ukuran layar dan dibangun dengan memperhatikan standar aksesibilitas web (misalnya, *skip-to-content*, teks alternatif untuk gambar, label formulir yang tepat, dan penggunaan HTML semantik).</li>
            </ul>
          </article>

          <article class="about-section">
            <h2>Teknologi yang Digunakan</h2>
            <ul>
              <li><strong>HTML5 & CSS3:</strong> Untuk struktur dan presentasi visual.</li>
              <li><strong>Vanilla JavaScript (ES6+):</strong> Untuk semua logika aplikasi dan interaktivitas.</li>
              <li><strong>Dicoding Story API:</strong> Sebagai backend dan sumber data utama untuk semua cerita.</li>
              <li><strong>Webpack:</strong> Sebagai *module bundler* untuk mengelola aset dan dependensi proyek.</li>
              <li><strong>Leaflet.js:</strong> Untuk integrasi dan tampilan peta digital.</li>
              <li><strong>Pola Arsitektur MVP (Model-View-Presenter):</strong> Untuk memastikan kode yang terstruktur dan mudah dikelola.</li>
              <li><strong>Web API Modern:</strong> Pemanfaatan Geolocation API, Media Devices API (untuk kamera), dan View Transitions API.</li>
            </ul>
          </article>
          
          <article class="about-section">
            <h2>Pengembang</h2>
            <p>
              Aplikasi ini dikembangkan oleh <strong>Haikal Fawwaz Karim</strong> sebagai bagian dari pembelajaran dan implementasi materi di Dicoding.
            </p>
            <p>
              Terima kasih telah mengunjungi dan menggunakan Dicoding Story App!
            </p>
          </article>

        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log(
      'AboutPage afterRender: Halaman "Tentang Kami" telah dirender.'
    );
  }
}

export default AboutPage;
