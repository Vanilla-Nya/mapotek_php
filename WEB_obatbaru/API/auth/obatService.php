<?php
class ObatService {
    private $supabaseFunc;

    public function __construct($supabaseFuncName = 'supabase') {
        if (!function_exists($supabaseFuncName)) {
            throw new Exception("Fungsi Supabase tidak ditemukan");
        }
        $this->supabaseFunc = $supabaseFuncName;
    }

    /**
     * 🎯 Ambil semua JENIS OBAT dari tabel jenis_obat
     */
    public function getAllJenisObat(): array {
        try {
            // ✅ PERBAIKAN: Pisahkan table dan params
            // Signature: supabase($method, $table, $params, $data, $token)
            $result = call_user_func(
                $this->supabaseFunc, 
                'GET',                                    // method
                'jenis_obat',                            // table
                'select=id_jenis_obat,nama_jenis_obat'       // params
            );
            
            if (!is_array($result)) {
                error_log('getAllJenisObat: Result bukan array');
                return [];
            }
            
            error_log('✅ getAllJenisObat: Success - ' . count($result) . ' items');
            return $result;
            
        } catch (Exception $e) {
            error_log('❌ Error getAllJenisObat: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * 🎯 Ambil semua BENTUK OBAT (enum/distinct)
     */
    public function getAllBentukObat(): array {
        try {
            // ✅ Untuk RPC, gunakan format khusus
            $result = call_user_func(
                $this->supabaseFunc,
                'POST',
                'rpc/get_bentuk_obat_enum',
                ''  // params kosong untuk RPC
            );

            if (!is_array($result)) {
                error_log('getAllBentukObat: Result bukan array');
                return [];
            }

            $options = [];
            foreach ($result as $r) {
                if (isset($r['bentuk'])) {
                    $options[] = $r['bentuk'];
                } elseif (isset($r['get_bentuk_obat_enum'])) {
                    $options[] = $r['get_bentuk_obat_enum'];
                } else {
                    $vals = array_values($r);
                    if (isset($vals[0])) $options[] = $vals[0];
                }
            }

            $uniqueOptions = array_values(array_unique($options));
            error_log('✅ getAllBentukObat: Success - ' . count($uniqueOptions) . ' items');
            return $uniqueOptions;
            
        } catch (Exception $e) {
            error_log('❌ Error getAllBentukObat: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * 🎯 Ambil semua data OBAT dari view tabel_obat
     */
     public function getAllObatData(): array {
        $viewName = 'tabel_obat';
        $select = "id_obat,id_detail_obat,nama_obat,bentuk_obat,jenis_obat,harga_jual,stock,tanggal_expired";

        $rows = call_user_func($this->supabaseFunc, 'GET', $viewName, $select);

        if (!is_array($rows)) {
            throw new Exception("Gagal mengambil data dari Supabase.");
        }

        $medicines = [];
        foreach ($rows as $r) {
            $medicines[] = [
                'id_obat' => $r['id_obat'] ?? null,
                'id_detail' => $r['id_detail_obat'] ?? null,
                'nama_obat' => $r['nama_obat'] ?? '-',
                'bentuk_obat' => $r['bentuk_obat'] ?? '-',
                'jenis' => $r['jenis_obat'] ?? '-',
                'harga' => $r['harga_jual'] ?? 0,
                'stock' => isset($r['stock']) ? (int)$r['stock'] : 0,
                'expired_date' => $r['tanggal_expired'] ?? '-'
            ];
        }

        return $medicines;
    }
    /**
     * 🎯 Tambah jenis obat baru
     */
    public function addJenisObat(string $namaJenis): array {
        try {
            if (empty(trim($namaJenis))) {
                throw new Exception('Nama jenis obat tidak boleh kosong');
            }

            $data = ['nama_jenis' => trim($namaJenis)];
            
            // ✅ PERBAIKAN: Pisahkan table dan params
            $result = call_user_func(
                $this->supabaseFunc,
                'POST',
                'jenis_obat',       // table
                '',                 // params (kosong untuk POST)
                $data               // data yang akan di-insert
            );

            return [
                'success' => true,
                'data' => $result,
                'message' => 'Jenis obat berhasil ditambahkan'
            ];

        } catch (Exception $e) {
            error_log('❌ Error addJenisObat: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * 🎯 Tambah obat baru
     * Manual: Fungsi ini menerima payload yang sudah termasuk id_dokter dari session
     */
    /**
     * 🎯 Tambah obat baru
     * Manual: Fungsi ini menerima payload yang sudah termasuk id_dokter dari session
     */
    public function addObat(array $payload): array {
    try {
        // 🧩 Validasi input dasar
        $required = [
            'nama_obat', 'id_jenis_obat', 'bentuk_obat',
            'harga_jual', 'harga_beli', 'stok',
            'tanggal_expired', 'id_dokter'
        ];

        foreach ($required as $field) {
            if (!isset($payload[$field]) || $payload[$field] === '') {
                throw new Exception("Field $field wajib diisi");
            }
        }

        // 🧠 Mapping data ke parameter RPC
        $params = [
            'p_nama_obat'       => trim($payload['nama_obat']),
            'p_id_jenis_obat'   => $payload['id_jenis_obat'],
            'p_bentuk_obat'     => $payload['bentuk_obat'],
            'p_harga_jual'      => (float)$payload['harga_jual'],
            'p_harga_beli'      => (float)$payload['harga_beli'],
            'p_stok'            => (int)$payload['stok'],
            'p_tanggal_expired' => $payload['tanggal_expired'],
            'p_id_dokter'       => $payload['id_dokter']
        ];

        error_log('📤 addObat RPC params: ' . json_encode($params));

        // 🚀 Panggil RPC di Supabase
        $result = call_user_func(
            $this->supabaseFunc,
            'POST',
            'rpc/tambah_obat',   // nama RPC
            '',                             // params kosong (karena RPC)
            $params                         // data parameter RPC
        );

        error_log('✅ addObat RPC result: ' . json_encode($result));

        return [
            'success' => true,
            'data' => $result,
            'message' => 'Obat dan detail berhasil ditambahkan'
        ];

    } catch (Exception $e) {
        error_log('❌ Error addObat (RPC): ' . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
}