// Daftar nama siswa tetap
const daftarSiswaTetap = [
  "ABYAN AFZALURAHMAN", "AHMAD KHAIRI", "ALI RAMLAN HARAHAP", "ALIF IRHAMUDIN IQBAL", "ANDHIKA BAGUS NUGRAHA", "ANDIKA TRI KUSUMA",
  "ARAFFAT HAMKA RAMADHAN", "ATALLAH AUFA SHANE", "AZIZAH KAMALIA", "AZZAM BARIQ AR RAHMAN", "DAFFA SYAKHI ZAIDAN ARIFIN", "DIMAS ARIA WASKITO",
  "FAZA AL-GHIFARY", "FIQI FIRMANSYAH", "GHAITSAA LUBNAA MALIIKA FAATIN", "HAUZAN FAYYADH MUHAMMAD", "IBNATY RAISSA PAMBUD", "JACKSON PERMANA","KEYSHA ADARA SYAHRANI",
  "KHANSA AYLA DARA","MAJID KURNIAWAN","MEGA ARDI NATASYA","MUHAMAD SYAHREZA HIBATULLAH","MUHAMMAD ALFA RIZKY","MUHAMMAD FIRDAUS","MUHAMMAD HABIBIE MAULANA SURYA","NASYWA SYARIFAH",
  "RADITYA RAFI ALAMSYAH","RAMLIH SAIF","SAFA AMANDA AURELIA","SAFIRA RAMADANI","SYAHRUL BAYU PRASETYO","TALITHA ATHAYA MILQA","ZAHRA AMELIA PUTRI","ZIOVAN ADHYA JOVANKA SYAHPUTRA"
];

const form = document.getElementById('formKas');
const tbody = document.querySelector('#tabelKas tbody');
const totalKasDisplay = document.getElementById('totalKas');
const filterBulan = document.getElementById('filterBulan');
const printBtn = document.getElementById('printBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let dataKas = JSON.parse(localStorage.getItem('dataKas')) || [];
let editMode = false;
let editInfo = null; // menyimpan info siswa yang sedang diedit

const namaSelect = document.getElementById('nama');
daftarSiswaTetap.forEach(nama => {
  const option = document.createElement('option');
  option.value = nama;
  option.textContent = nama;
  namaSelect.appendChild(option);
});

updateFilterBulan();

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const bulan = document.getElementById('bulan').value;
  const minggu = document.getElementById('minggu').value;
  const jumlah = parseInt(document.getElementById('jumlah').value);

  if (!nama || !bulan || !minggu || isNaN(jumlah) || jumlah <= 0) {
    alert('Isi semua data dengan benar!');
    return;
  }

  if (editMode && editInfo) {
    // mode edit aktif → ubah data lama
    const bulanData = dataKas.find(b => b.bulan === editInfo.bulan);
    if (bulanData) {
      const siswa = bulanData.siswa.find(s => s.nama === editInfo.nama);
      if (siswa) {
        siswa[`minggu${minggu}`] = jumlah;
      }
    }
    alert('Data berhasil diperbarui!');
    editMode = false;
    editInfo = null;
  } else {
    // mode tambah data baru
    let bulanData = dataKas.find(item => item.bulan === bulan);
    if (!bulanData) {
      bulanData = { bulan, siswa: [] };
      dataKas.push(bulanData);
    }

    let siswa = bulanData.siswa.find(s => s.nama.toLowerCase() === nama.toLowerCase());
    if (!siswa) {
      siswa = { nama, minggu1: 0, minggu2: 0, minggu3: 0, minggu4: 0 };
      bulanData.siswa.push(siswa);
    }

    siswa[`minggu${minggu}`] = jumlah;
    alert('Data berhasil ditambahkan!');
  }

  localStorage.setItem('dataKas', JSON.stringify(dataKas));
  updateFilterBulan();
  renderTable(filterBulan.value || bulan);
  form.reset();
});

filterBulan.addEventListener('change', () => {
  renderTable(filterBulan.value);
});

function renderTable(bulan) {
  tbody.innerHTML = '';
  let totalKas = 0;

  const bulanData = dataKas.find(item => item.bulan === bulan);
  if (!bulanData) {
    totalKasDisplay.textContent = 'Rp 0';
    return;
  }

  bulanData.siswa.forEach((item, index) => {
    const total = item.minggu1 + item.minggu2 + item.minggu3 + item.minggu4;
    totalKas += total;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nama}</td>
      <td class="${item.minggu1 > 0 ? 'lunas' : 'belum'}">${item.minggu1 > 0 ? 'Lunas' : 'Belum'}</td>
      <td class="${item.minggu2 > 0 ? 'lunas' : 'belum'}">${item.minggu2 > 0 ? 'Lunas' : 'Belum'}</td>
      <td class="${item.minggu3 > 0 ? 'lunas' : 'belum'}">${item.minggu3 > 0 ? 'Lunas' : 'Belum'}</td>
      <td class="${item.minggu4 > 0 ? 'lunas' : 'belum'}">${item.minggu4 > 0 ? 'Lunas' : 'Belum'}</td>
      <td>Rp ${total.toLocaleString()}</td>
      <td>
        <button class="editBtn" data-bulan="${bulan}" data-nama="${item.nama}">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  totalKasDisplay.textContent = 'Rp ' + totalKas.toLocaleString();

  // tambahkan event listener untuk tombol edit
  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nama = e.target.getAttribute('data-nama');
      const bulan = e.target.getAttribute('data-bulan');
      startEdit(nama, bulan);
    });
  });
}

function startEdit(nama, bulan) {
  const bulanData = dataKas.find(b => b.bulan === bulan);
  if (!bulanData) return;
  const siswa = bulanData.siswa.find(s => s.nama === nama);
  if (!siswa) return;

  // isi form dengan data lama
  document.getElementById('nama').value = siswa.nama;
  document.getElementById('bulan').value = bulan;

  // cari minggu terakhir yang berisi data (supaya bisa diedit ulang)
  let mingguTerisi = Object.entries(siswa).find(([k, v]) => k.startsWith('minggu') && v > 0);
  if (mingguTerisi) {
    const minggu = mingguTerisi[0].replace('minggu', '');
    document.getElementById('minggu').value = minggu;
    document.getElementById('jumlah').value = siswa[`minggu${minggu}`];
  }

  editMode = true;
  editInfo = { nama, bulan };

  alert(`Mode edit: ${nama} (${bulan}) — ubah data lalu klik Simpan.`);
}

function updateFilterBulan() {
  const bulanList = [...new Set(dataKas.map(item => item.bulan))];
  filterBulan.innerHTML = '<option value="">-- Pilih Bulan --</option>';
  bulanList.forEach(bulan => {
    const opt = document.createElement('option');
    opt.value = bulan;
    opt.textContent = bulan;
    filterBulan.appendChild(opt);
  });
}

printBtn.addEventListener('click', () => {
  if (!filterBulan.value) {
    alert('Pilih bulan terlebih dahulu!');
    return;
  }
  window.print();
});

// 💾 EXPORT DATA
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(dataKas, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_kas.json';
  a.click();
  URL.revokeObjectURL(url);
});

// 📂 IMPORT DATA
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        dataKas = importedData;
        localStorage.setItem('dataKas', JSON.stringify(dataKas));
        updateFilterBulan();
        renderTable(filterBulan.value);
        alert('Data berhasil dimuat!');
      } else {
        alert('Format file tidak valid!');
      }
    } catch (err) {
      alert('Gagal membaca file!');
    }
  };
  reader.readAsText(file);
});

// tampilkan data awal
if (filterBulan.options.length > 1) {
  filterBulan.selectedIndex = 1;
  renderTable(filterBulan.value);
}
