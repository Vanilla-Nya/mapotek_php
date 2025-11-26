<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/supabase.php';

// Get the action from query parameter
$action = $_GET['action'] ?? '';

// Get id_dokter from session or query parameter
session_start();

// Try to get from session first
$id_dokter = $_SESSION['id_dokter'] ?? null;

// If not in session, try from query parameter
if (!$id_dokter && isset($_GET['dokter_id'])) {
    $id_dokter = $_GET['dokter_id'];
}

// If still not found, try from POST body
if (!$id_dokter) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_dokter = $input['id_dokter'] ?? null;
}

if (!$id_dokter) {
    error_log("❌ PEMBUKUAN API: No doctor ID found");
    
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized - No dokter ID found'
    ]);
    exit();
}

error_log("✅ PEMBUKUAN API: Doctor ID found: $id_dokter, Action: $action");

switch ($action) {
    case 'get_pembukuan':
        getPembukuan($id_dokter);
        break;
    
    case 'add_transaksi':
        addTransaksi($id_dokter);
        break;
    
    case 'get_summary':
        getSummary($id_dokter);
        break;
    
    case 'filter_pembukuan':
        filterPembukuan($id_dokter);
        break;
    
    case 'delete_transaksi':
        deleteTransaksi($id_dokter);
        break;
    
    case 'get_detail_transaksi':
        getDetailTransaksi($id_dokter);
        break;
    
    case 'get_patient_detail':
        getPatientDetail($id_dokter);
        break;

    case 'get_patient_stats':
        getPatientStats($id_dokter);
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
}

/**
 * Get all pembukuan data (pemasukan + pengeluaran) - GROUPED BY DATE
 */
function getPembukuan($id_dokter) {
    try {
        // ✅ NEW DEFAULT: Show TODAY's data only
        $today = date('Y-m-d');
        
        $startDateTime = $today . 'T00:00:00Z';
        $endDateTime = $today . 'T23:59:59Z';
        
        error_log("📅 DEFAULT FILTER: Today only - $today");
        
        // Get pemasukan - TODAY ONLY
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=*&order=created_at.desc"
        );
        
        // Get pengeluaran - TODAY ONLY
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&tanggal=gte.$today&tanggal=lte.$today&select=*,pengeluaran_detail(*)&order=created_at.desc"
        );
        
        // Group by date
        $groupedByDate = [];
        
        // Process pemasukan
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $tanggal = $item['created_at'] ? date('Y-m-d', strtotime($item['created_at'])) : date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at']
                    ];
                }
                
                $groupedByDate[$tanggal]['pemasukan'] += floatval($item['total'] ?? 0);
            }
        }
        
        // Process pengeluaran
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                $tanggal = $item['tanggal'] ?? date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at'] ?? ($tanggal . 'T00:00:00Z')
                    ];
                }
                
                // Calculate total from detail
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $groupedByDate[$tanggal]['pengeluaran'] += $total;
            }
        }
        
        // Convert to array and sort by date
        $dailySummary = array_values($groupedByDate);
        usort($dailySummary, function($a, $b) {
            return strtotime($a['tanggal']) - strtotime($b['tanggal']);
        });
        
        // Calculate running balance
        $saldo = 0;
        foreach ($dailySummary as &$day) {
            $saldo += $day['pemasukan'] - $day['pengeluaran'];
            $day['saldo'] = $saldo;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $dailySummary,
            'is_filtered' => false,
            'date_range' => [
                'start' => $today,
                'end' => $today
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
/**
 * Add new transaction
 */
function addTransaksi($id_dokter) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $tipe = $input['tipe'] ?? '';
        $tanggal = $input['tanggal'] ?? date('Y-m-d');
        $judul = $input['judul'] ?? '';
        $deskripsi = $input['deskripsi'] ?? '';
        $total = floatval($input['total'] ?? 0);
        
        error_log("📝 Adding transaction: type=$tipe, total=$total, dokter=$id_dokter");
        
        if (empty($tipe) || empty($judul) || $total <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Data tidak lengkap'
            ]);
            return;
        }
        
        if ($tipe === 'pemasukan') {
            // For manual entries, we DON'T set id_antrian at all
            $data = [
                'id_dokter' => $id_dokter,
                'total' => $total,
                'metode_pembayaran' => 'MANUAL',
                'jenis_pemasukan' => $judul,
                'deskripsi' => $deskripsi,
                'created_at' => $tanggal . 'T' . date('H:i:s') . 'Z'  // ISO 8601 format
            ];
            
            error_log("💰 Inserting pemasukan (manual): " . json_encode($data));
            
            $result = supabase('POST', 'pemasukan', '', $data);
            
        } else {
            // Insert to pengeluaran table
            $data = [
                'id_dokter' => $id_dokter,
                'keterangan' => $judul,
                'tanggal' => $tanggal,
                'created_at' => $tanggal . 'T' . date('H:i:s') . 'Z',  // ISO 8601 format
                'updated_at' => date('Y-m-d\TH:i:s\Z')  // ISO 8601 format
            ];
            
            error_log("💸 Inserting pengeluaran: " . json_encode($data));
            
            $result = supabase('POST', 'pengeluaran', '', $data);
            
            // If pengeluaran created successfully, add detail
            if (!isset($result['error']) && isset($result[0]['id_pengeluaran'])) {
                $id_pengeluaran = $result[0]['id_pengeluaran'];
                
                // Insert detail
                $detailData = [
                    'id_pengeluaran' => $id_pengeluaran,
                    'jumlah' => 1,
                    'harga' => $total
                ];
                
                error_log("📋 Inserting pengeluaran detail: " . json_encode($detailData));
                
                supabase('POST', 'pengeluaran_detail', '', $detailData);
            }
        }
        
        if (isset($result['error'])) {
            error_log("❌ Supabase error: " . json_encode($result));
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . ($result['message'] ?? 'Unknown error'),
                'details' => $result['error']
            ]);
        } else {
            error_log("✅ Transaction saved successfully");
            echo json_encode([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => $result
            ]);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception in addTransaksi: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get summary (total pemasukan, pengeluaran, profit)
 */
function getSummary($id_dokter) {
    try {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        $dateFilter = '';
        if ($startDate && $endDate) {
            $dateFilter = "&created_at=gte.$startDate&created_at=lte.$endDate";
        }
        
        // Get total pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&select=total$dateFilter"
        );
        
        $totalPemasukan = 0;
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $totalPemasukan += floatval($item['total'] ?? 0);
            }
        }
        
        // Get total pengeluaran
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&select=pengeluaran_detail(jumlah,harga)$dateFilter"
        );
        
        $totalPengeluaran = 0;
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $totalPengeluaran += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
            }
        }
        
        $totalProfit = $totalPemasukan - $totalPengeluaran;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'total_profit' => $totalProfit
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Filter pembukuan by date range - GROUPED BY DATE
 */
function filterPembukuan($id_dokter) {
    try {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        error_log("🔍 FILTER: start=$startDate, end=$endDate, dokter=$id_dokter");
        
        if (!$startDate || !$endDate) {
            echo json_encode([
                'success' => false,
                'message' => 'Tanggal tidak lengkap'
            ]);
            return;
        }
        
        // Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) for Supabase
        $startDateTime = $startDate . 'T00:00:00Z';
        $endDateTime = $endDate . 'T23:59:59Z';
        
        error_log("📅 Using ISO format: start=$startDateTime, end=$endDateTime");
        
        // Get filtered pemasukan
        $pemasukanQuery = "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=*&order=created_at.desc";
        $pemasukan = supabase('GET', 'pemasukan', $pemasukanQuery);
        
        // Get filtered pengeluaran
        $pengeluaranQuery = "id_dokter=eq.$id_dokter&tanggal=gte.$startDate&tanggal=lte.$endDate&select=*,pengeluaran_detail(*)&order=tanggal.desc";
        $pengeluaran = supabase('GET', 'pengeluaran', $pengeluaranQuery);
        
        // Group by date
        $groupedByDate = [];
        
        // Process pemasukan - group by date
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $tanggal = $item['created_at'] ? date('Y-m-d', strtotime($item['created_at'])) : date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at']
                    ];
                }
                
                $groupedByDate[$tanggal]['pemasukan'] += floatval($item['total'] ?? 0);
            }
        }
        
        // Process pengeluaran - group by date
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                $tanggal = $item['tanggal'] ?? date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at'] ?? ($tanggal . 'T00:00:00Z')
                    ];
                }
                
                // Calculate total from detail
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $groupedByDate[$tanggal]['pengeluaran'] += $total;
            }
        }
        
        // Convert to array and sort by date
        $dailySummary = array_values($groupedByDate);
        usort($dailySummary, function($a, $b) {
            return strtotime($a['tanggal']) - strtotime($b['tanggal']);
        });
        
        // Calculate running balance
        $saldo = 0;
        foreach ($dailySummary as &$day) {
            $saldo += $day['pemasukan'] - $day['pengeluaran'];
            $day['saldo'] = $saldo;
        }
        
        error_log("✅ Filter completed. Total days: " . count($dailySummary));
        
        echo json_encode([
            'success' => true,
            'data' => $dailySummary,
            'debug' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'pemasukan_count' => is_array($pemasukan) && !isset($pemasukan['error']) ? count($pemasukan) : 0,
                'pengeluaran_count' => is_array($pengeluaran) && !isset($pengeluaran['error']) ? count($pengeluaran) : 0,
                'total_days' => count($dailySummary)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Filter error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Delete transaction
 */
function deleteTransaksi($id_dokter) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? '';
        $jenis = $input['jenis'] ?? '';
        
        if (empty($id) || empty($jenis)) {
            echo json_encode([
                'success' => false,
                'message' => 'Data tidak lengkap'
            ]);
            return;
        }
        
        if ($jenis === 'Pemasukan') {
            $result = supabase('DELETE', 'pemasukan', 
                "id_pemasukan=eq.$id&id_dokter=eq.$id_dokter"
            );
        } else {
            // Delete detail first
            supabase('DELETE', 'pengeluaran_detail', 
                "id_pengeluaran=eq.$id"
            );
            
            // Then delete pengeluaran
            $result = supabase('DELETE', 'pengeluaran', 
                "id_pengeluaran=eq.$id&id_dokter=eq.$id_dokter"
            );
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * ⭐ ENHANCED - Get transaction details for a specific date WITH PATIENT INFO
 * NOW INCLUDES: BPJS transactions even with Rp 0 (GRATIS)
 */
function getDetailTransaksi($id_dokter) {
    try {
        $tanggal = $_GET['tanggal'] ?? null;
        
        if (!$tanggal) {
            echo json_encode([
                'success' => false,
                'message' => 'Tanggal tidak ditemukan'
            ]);
            return;
        }
        
        error_log("========================================");
        error_log("🔍 DEBUG GET DETAIL TRANSAKSI");
        error_log("========================================");
        error_log("📅 Tanggal: $tanggal");
        error_log("👨‍⚕️ Doctor ID: $id_dokter");
        
        $allDetails = [];
        $debugInfo = [
            'tanggal' => $tanggal,
            'id_dokter' => $id_dokter,
            'queries' => []
        ];
        
        // ========================================
        // 1. PEMASUKAN (UMUM patients)
        // ========================================
        $pemasukanQuery = "id_dokter=eq.$id_dokter&select=id_pemasukan,id_antrian,total,metode_pembayaran,jenis_pemasukan,deskripsi,created_at,antrian(id_antrian,no_antrian,jenis_pasien,id_pasien,pasien(nama,nik))&created_at=gte.{$tanggal}T00:00:00Z&created_at=lte.{$tanggal}T23:59:59Z&order=created_at.desc";
        
        error_log("💰 PEMASUKAN Query: $pemasukanQuery");
        $debugInfo['queries']['pemasukan'] = $pemasukanQuery;
        
        $pemasukan = supabase('GET', 'pemasukan', $pemasukanQuery);
        
        error_log("💰 PEMASUKAN Raw Result: " . json_encode($pemasukan));
        $debugInfo['pemasukan_result'] = $pemasukan;
        
        if (isset($pemasukan['error'])) {
            error_log("❌ PEMASUKAN Error: " . json_encode($pemasukan['error']));
        } elseif (!is_array($pemasukan)) {
            error_log("❌ PEMASUKAN Result is not an array!");
        } else {
            error_log("✅ PEMASUKAN Found: " . count($pemasukan) . " records");
        }
        
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $patientName = 'Transaksi Manual';
                $id_antrian = null;
                $hasPatient = false;
                $jenisPasien = null;
                
                if (isset($item['id_antrian']) && !empty($item['id_antrian'])) {
                    $id_antrian = $item['id_antrian'];
                    $hasPatient = true;
                    
                    if (isset($item['antrian'])) {
                        $jenisPasien = $item['antrian']['jenis_pasien'] ?? null;
                        if (isset($item['antrian']['pasien']['nama'])) {
                            $patientName = $item['antrian']['pasien']['nama'];
                        }
                    }
                }
                
                $allDetails[] = [
                    'id' => $item['id_pemasukan'],
                    'id_antrian' => $id_antrian,
                    'deskripsi' => $item['jenis_pemasukan'] ?? 'Pemasukan',
                    'detail' => $item['deskripsi'] ?? "Pemasukan Pasien: $patientName",
                    'patient_name' => $patientName,
                    'jenis_pasien' => $jenisPasien,
                    'total' => floatval($item['total'] ?? 0),
                    'jenis' => 'Pemasukan',
                    'metode_pembayaran' => $item['metode_pembayaran'] ?? '-',
                    'created_at' => $item['created_at'],
                    'has_patient' => $hasPatient,
                    'is_bpjs_free' => false
                ];
            }
        }
        
        // ========================================
        // 2. PENGELUARAN
        // ========================================
        $pengeluaranQuery = "id_dokter=eq.$id_dokter&tanggal=eq.$tanggal&select=id_pengeluaran,id_antrian,keterangan,tanggal,created_at,pengeluaran_detail(*),antrian(id_antrian,no_antrian,jenis_pasien,id_pasien,pasien(nama,nik))&order=created_at.desc";
        
        error_log("💸 PENGELUARAN Query: $pengeluaranQuery");
        $debugInfo['queries']['pengeluaran'] = $pengeluaranQuery;
        
        $pengeluaran = supabase('GET', 'pengeluaran', $pengeluaranQuery);
        
        error_log("💸 PENGELUARAN Raw Result: " . json_encode($pengeluaran));
        
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                error_log("📋 Processing pengeluaran ID: " . $item['id_pengeluaran']);
                
                // Calculate total from detail
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                // Check patient info
                $id_antrian = $item['id_antrian'] ?? null;
                $hasPatient = false;
                $patientName = null;
                $jenisPasien = null;
                
                if ($id_antrian && !empty($id_antrian)) {
                    $hasPatient = true;
                    
                    if (isset($item['antrian'])) {
                        $jenisPasien = $item['antrian']['jenis_pasien'] ?? null;
                        if (isset($item['antrian']['pasien']['nama'])) {
                            $patientName = $item['antrian']['pasien']['nama'];
                        }
                    }
                }
                
                // Determine if BPJS free
                $isBPJSFree = ($hasPatient && $jenisPasien === 'BPJS' && $total == 0);
                
                // Build description
                $deskripsi = $item['keterangan'] ?? 'Pengeluaran';
                if ($hasPatient && $jenisPasien === 'BPJS') {
                    $deskripsi = "BPJS - " . ($patientName ?? 'Pasien');
                }
                
                // Decide inclusion
                $shouldInclude = false;
                
                if ($hasPatient && $jenisPasien === 'BPJS') {
                    $shouldInclude = true;
                } elseif ($hasPatient && $total > 0) {
                    $shouldInclude = true;
                } elseif (!$hasPatient && $total > 0) {
                    $shouldInclude = true;
                }
                
                if ($shouldInclude) {
                    $allDetails[] = [
                        'id' => $item['id_pengeluaran'],
                        'id_antrian' => $id_antrian,
                        'deskripsi' => $deskripsi,
                        'detail' => $item['keterangan'] ?? '-',
                        'patient_name' => $patientName,
                        'jenis_pasien' => $jenisPasien,
                        'total' => $total,
                        'jenis' => 'Pengeluaran',
                        'metode_pembayaran' => $jenisPasien === 'BPJS' ? 'BPJS (Gratis)' : '-',
                        'created_at' => $item['created_at'],
                        'has_patient' => $hasPatient,
                        'is_bpjs_free' => $isBPJSFree
                    ];
                }
            }
        }
        
        // Sort by created_at
        usort($allDetails, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        error_log("========================================");
        error_log("✅ FINAL RESULTS");
        error_log("   Total transactions: " . count($allDetails));
        error_log("========================================");
        
        echo json_encode([
            'success' => true,
            'data' => $allDetails,
            'tanggal' => $tanggal,
            'stats' => [
                'total_transactions' => count($allDetails),
                'bpjs_free_count' => count(array_filter($allDetails, function($item) {
                    return $item['is_bpjs_free'] === true;
                }))
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
        
    } catch (Exception $e) {
        error_log("❌ Error getting detail: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * ⭐ FIXED - Get patient detail with comprehensive debugging
 * Now searches through ALL antrian with same encounter to find pemeriksaan
 */
function getPatientDetail($id_dokter) {
    try {
        $id_antrian = $_GET['id_antrian'] ?? null;
        
        if (!$id_antrian) {
            echo json_encode([
                'success' => false,
                'message' => 'ID antrian tidak ditemukan'
            ]);
            return;
        }
        
        error_log("========================================");
        error_log("👨‍⚕️ GET PATIENT DETAIL - FIXED VERSION");
        error_log("========================================");
        error_log("📋 id_antrian: $id_antrian");
        error_log("👨‍⚕️ id_dokter: $id_dokter");
        
        // ✅ STEP 1: Get antrian with patient info
        $antrianQuery = "id_antrian=eq.$id_antrian&select=*,pasien(*)";
        error_log("🔍 Antrian Query: $antrianQuery");
        
        $antrian = supabase('GET', 'antrian', $antrianQuery);
        
        if (isset($antrian['error']) || empty($antrian) || !is_array($antrian)) {
            error_log("❌ Antrian not found or error");
            throw new Exception('Data antrian tidak ditemukan');
        }
        
        $antrianData = $antrian[0];
        $patientData = $antrianData['pasien'] ?? null;
        $encounterId = $antrianData['id_encounter_satusehat'] ?? null;
        
        error_log("✅ Antrian found");
        error_log("   Patient: " . ($patientData['nama'] ?? 'NULL'));
        error_log("   Encounter ID: " . ($encounterId ?? 'NULL'));
        
        // ✅ STEP 2: If no encounter, try direct pemeriksaan lookup
        $pemeriksaan = null;
        $anamnesa = null;
        $diagnosisData = [];
        $diagnosaProsedurData = [];
        $medicineData = [];
        $resep = [];
        $vitalSigns = [];
        
        if ($encounterId) {
            error_log("🔍 Encounter ID found, looking for ALL antrian with same encounter...");
            
            // ✅ STEP 3: Get ALL antrian with same encounter
            $allAntrianQuery = "id_encounter_satusehat=eq.$encounterId&select=id_antrian";
            $allAntrian = supabase('GET', 'antrian', $allAntrianQuery);
            
            if (!isset($allAntrian['error']) && is_array($allAntrian)) {
                $antrianIds = array_column($allAntrian, 'id_antrian');
                error_log("   Found " . count($antrianIds) . " antrian with same encounter: " . implode(', ', $antrianIds));
                
                // ✅ STEP 4: Try to find pemeriksaan for ANY of these antrian IDs
                foreach ($antrianIds as $currentAntrianId) {
                    $pemeriksaanQuery = "id_antrian=eq.$currentAntrianId&select=*";
                    error_log("   Trying pemeriksaan for antrian: $currentAntrianId");
                    
                    $tempPemeriksaan = supabase('GET', 'pemeriksaan', $pemeriksaanQuery);
                    
                    if (!isset($tempPemeriksaan['error']) && is_array($tempPemeriksaan) && count($tempPemeriksaan) > 0) {
                        $pemeriksaan = $tempPemeriksaan[0];
                        error_log("   ✅✅✅ FOUND pemeriksaan with id_antrian: $currentAntrianId");
                        error_log("   Pemeriksaan ID: " . $pemeriksaan['id_pemeriksaan']);
                        error_log("   id_anamnesa: " . ($pemeriksaan['id_anamnesa'] ?? 'NULL'));
                        break; // Found it, stop searching
                    }
                }
            }
        }
        
        // ✅ FALLBACK: If no encounter or not found via encounter, try direct lookup
        if (!$pemeriksaan) {
            error_log("⚠️ No pemeriksaan found via encounter, trying direct lookup for id_antrian: $id_antrian");
            $pemeriksaanQuery = "id_antrian=eq.$id_antrian&select=*";
            $tempPemeriksaan = supabase('GET', 'pemeriksaan', $pemeriksaanQuery);
            
            if (!isset($tempPemeriksaan['error']) && is_array($tempPemeriksaan) && count($tempPemeriksaan) > 0) {
                $pemeriksaan = $tempPemeriksaan[0];
                error_log("   ✅ Found pemeriksaan directly");
            }
        }
        
        // ✅ STEP 5: If pemeriksaan found, load all related data
        if ($pemeriksaan) {
            error_log("========================================");
            error_log("✅ PEMERIKSAAN FOUND - LOADING ALL DATA");
            error_log("========================================");
            error_log("   id_pemeriksaan: " . $pemeriksaan['id_pemeriksaan']);
            error_log("   id_anamnesa: " . ($pemeriksaan['id_anamnesa'] ?? 'NULL'));
            
            $id_anamnesa = $pemeriksaan['id_anamnesa'] ?? null;
            
            // ✅ Load Anamnesa
            if ($id_anamnesa && !empty($id_anamnesa) && $id_anamnesa !== 'null') {
                error_log("🩺 Querying anamnesa with id: $id_anamnesa");
                
                $anamnesaQuery = "id_anamnesa=eq.$id_anamnesa&select=*";
                $anamnesaResult = supabase('GET', 'anamnesa', $anamnesaQuery);
                
                if (!isset($anamnesaResult['error']) && is_array($anamnesaResult) && count($anamnesaResult) > 0) {
                    $anamnesa = $anamnesaResult[0];
                    error_log("   ✅✅✅ ANAMNESA LOADED SUCCESSFULLY!");
                    error_log("   Keluhan: " . ($anamnesa['keluhan'] ?? 'NULL'));
                    error_log("   Anamnesis: " . ($anamnesa['anamnesis'] ?? 'NULL'));
                } else {
                    error_log("   ⚠️ Anamnesa query returned no results");
                    error_log("   Query: $anamnesaQuery");
                    error_log("   Result: " . json_encode($anamnesaResult));
                }
            } else {
                error_log("   ⚠️ id_anamnesa is null/empty, skipping anamnesa query");
            }
            
            // ✅ Load Vital Signs (LOINC)
            try {
                $vitalQuery = "id_pemeriksaan=eq." . $pemeriksaan['id_pemeriksaan'] . "&select=*";
                $vitalResult = supabase('GET', 'table_pemeriksaan_loinc', $vitalQuery);
                
                if (!isset($vitalResult['error']) && is_array($vitalResult)) {
                    $vitalSigns = $vitalResult;
                    error_log("   ✅ Loaded " . count($vitalSigns) . " vital signs");
                }
            } catch (Exception $e) {
                error_log("   ⚠️ Failed to load vital signs: " . $e->getMessage());
            }
            
            // ✅ Load Diagnosis ICD-X
            try {
                $diagnosisQuery = "id_pemeriksaan=eq." . $pemeriksaan['id_pemeriksaan'] . "&select=*";
                $diagnosisResult = supabase('GET', 'diagnosis_icdx', $diagnosisQuery);
                
                if (!isset($diagnosisResult['error']) && is_array($diagnosisResult)) {
                    $diagnosisData = $diagnosisResult;
                    error_log("   ✅ Loaded " . count($diagnosisData) . " ICD-X diagnoses");
                }
            } catch (Exception $e) {
                error_log("   ⚠️ Failed to load ICD-X: " . $e->getMessage());
            }
            
            // ✅ Load Diagnosis ICD-IX (Procedures)
            try {
                $prosedurQuery = "id_pemeriksaan=eq." . $pemeriksaan['id_pemeriksaan'] . "&select=*";
                $prosedurResult = supabase('GET', 'diagnosis_icdix', $prosedurQuery);
                
                if (!isset($prosedurResult['error']) && is_array($prosedurResult)) {
                    $diagnosaProsedurData = $prosedurResult;
                    error_log("   ✅ Loaded " . count($diagnosaProsedurData) . " ICD-IX procedures");
                }
            } catch (Exception $e) {
                error_log("   ⚠️ Failed to load ICD-IX: " . $e->getMessage());
            }
            
            // ✅ Load Medicines
            try {
                $obatQuery = "id_pemeriksaan=eq." . $pemeriksaan['id_pemeriksaan'] . "&select=*,obat:id_obat(*)";
                $obatResult = supabase('GET', 'pemeriksaan_obat', $obatQuery);
                
                if (!isset($obatResult['error']) && is_array($obatResult)) {
                    foreach ($obatResult as $obatItem) {
                        $obat = $obatItem['obat'] ?? null;
                        if ($obat) {
                            $jumlah = intval($obatItem['jumlah'] ?? 0);
                            $hargaSatuan = floatval($obat['harga_jual'] ?? 0);
                            
                            $medicineData[] = [
                                'nama_obat' => $obat['nama_obat'] ?? '-',
                                'bentuk_obat' => $obat['bentuk_obat'] ?? '-',
                                'signa' => $obatItem['signa'] ?? '-',
                                'jumlah' => $jumlah,
                                'harga_satuan' => $hargaSatuan,
                                'subtotal' => $hargaSatuan * $jumlah
                            ];
                        }
                    }
                    error_log("   ✅ Loaded " . count($medicineData) . " medicines");
                }
            } catch (Exception $e) {
                error_log("   ⚠️ Failed to load medicines: " . $e->getMessage());
            }
            
        } else {
            error_log("⚠️⚠️⚠️ NO PEMERIKSAAN FOUND AT ALL");
        }
        
        // ✅ Get Doctor Info
        $doctor = null;
        if ($antrianData['id_dokter']) {
            try {
                $doctorQuery = "id_dokter=eq." . $antrianData['id_dokter'] . "&select=*";
                $doctorResult = supabase('GET', 'dokter', $doctorQuery);
                
                if (!isset($doctorResult['error']) && is_array($doctorResult) && count($doctorResult) > 0) {
                    $doctor = $doctorResult[0];
                    error_log("   ✅ Loaded doctor: " . ($doctor['nama_lengkap'] ?? 'Unknown'));
                }
            } catch (Exception $e) {
                error_log("   ⚠️ Failed to load doctor: " . $e->getMessage());
            }
        }
        
        // ✅ Get Payment Info
        $pemasukanQuery = "id_antrian=eq.$id_antrian&select=*";
        $pemasukan = supabase('GET', 'pemasukan', $pemasukanQuery);
        
        $paymentData = null;
        $paymentType = 'Unknown';
        
        if (!isset($pemasukan['error']) && !empty($pemasukan) && is_array($pemasukan)) {
            $paymentData = $pemasukan[0];
            $paymentType = 'Pemasukan (UMUM)';
        } else {
            $pengeluaranQuery = "id_antrian=eq.$id_antrian&select=*";
            $pengeluaran = supabase('GET', 'pengeluaran', $pengeluaranQuery);
            
            if (!isset($pengeluaran['error']) && !empty($pengeluaran) && is_array($pengeluaran)) {
                $paymentData = [
                    'total' => 0,
                    'metode_pembayaran' => 'BPJS (Gratis)',
                    'created_at' => $pengeluaran[0]['created_at'] ?? null
                ];
                $paymentType = 'BPJS (Gratis)';
            }
        }
        
        error_log("========================================");
        error_log("📊 FINAL DATA SUMMARY");
        error_log("========================================");
        error_log("   Patient: " . ($patientData['nama'] ?? 'NULL'));
        error_log("   Pemeriksaan found: " . ($pemeriksaan ? 'YES ✅' : 'NO ❌'));
        error_log("   Anamnesa found: " . ($anamnesa ? 'YES ✅' : 'NO ❌'));
        if ($anamnesa) {
            error_log("   - Keluhan: " . ($anamnesa['keluhan'] ?? 'EMPTY'));
            error_log("   - Anamnesis: " . ($anamnesa['anamnesis'] ?? 'EMPTY'));
        }
        error_log("   Diagnosis count: " . count($diagnosisData));
        error_log("   Procedures count: " . count($diagnosaProsedurData));
        error_log("   Medicine count: " . count($medicineData));
        error_log("   Payment type: " . $paymentType);
        error_log("========================================");
        
        // ✅ Prepare diagnosis array
        $allDiagnosis = [];
        foreach ($diagnosisData as $d) {
            $allDiagnosis[] = [
                'kode' => $d['kode_icdx'] ?? '-',
                'deskripsi' => $d['deskripsi'] ?? '-',
                'jenis' => 'ICD-X'
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'patient' => [
                    'nama' => $patientData['nama'] ?? '-',
                    'nik' => $patientData['nik'] ?? '-',
                    'jenis_kelamin' => $patientData['jenis_kelamin'] ?? '-',
                    'tanggal_lahir' => $patientData['tanggal_lahir'] ?? '-',
                    'no_telp' => $patientData['no_telp'] ?? '-',
                    'alamat' => $patientData['alamat'] ?? '-'
                ],
                'antrian' => [
                    'no_antrian' => $antrianData['no_antrian'] ?? '-',
                    'tanggal' => $antrianData['tanggal_antrian'] ?? '-',
                    'jenis_pasien' => $antrianData['jenis_pasien'] ?? '-',
                    'status' => $antrianData['status_antrian'] ?? '-'
                ],
                'anamnesa' => [
                    'keluhan' => $anamnesa['keluhan'] ?? '-',
                    'anamnesis' => $anamnesa['anamnesis'] ?? '-',
                    'alergi_makanan' => $anamnesa['alergi_makanan'] ?? '-',
                    'alergi_udara' => $anamnesa['alergi_udara'] ?? '-',
                    'alergi_obat' => $anamnesa['alergi_obat'] ?? '-',
                    'prognosa' => $anamnesa['prognosa'] ?? '-',
                    'terapi_obat' => $anamnesa['terapi_obat'] ?? '-',
                    'terapi_non_obat' => $anamnesa['terapi_non_obat'] ?? '-'
                ],
                'diagnosis' => $allDiagnosis,
                'medicines' => $medicineData,
                'payment' => [
                    'total' => floatval($paymentData['total'] ?? 0),
                    'metode' => $paymentData['metode_pembayaran'] ?? '-',
                    'tanggal' => $paymentData['created_at'] ?? '-',
                    'type' => $paymentType
                ]
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("========================================");
        error_log("❌ ERROR IN GET PATIENT DETAIL");
        error_log("========================================");
        error_log("   Message: " . $e->getMessage());
        error_log("   File: " . $e->getFile());
        error_log("   Line: " . $e->getLine());
        error_log("========================================");
        
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getPatientStats($id_dokter) {
    try {
        $start_date = $_GET['start_date'] ?? null;
        $end_date = $_GET['end_date'] ?? null;
        
        if (!$start_date || !$end_date) {
            $start_date = date('Y-m-d');
            $end_date = date('Y-m-d');
        }
        
        error_log("========================================");
        error_log("📊 GET PATIENT STATS - BLOCKCHAIN AWARE");
        error_log("========================================");
        error_log("👨‍⚕️ Doctor ID: $id_dokter");
        error_log("📅 Start Date: $start_date");
        error_log("📅 End Date: $end_date");
        
        // ✅ Get all antrian records within date range
        $startDateTime = $start_date . 'T00:00:00';
        $endDateTime = $end_date . 'T23:59:59';
        
        $antrianQuery = "id_dokter=eq.$id_dokter" .
            "&created_at=gte.$startDateTime" .
            "&created_at=lte.$endDateTime" .
            "&select=id_antrian,id_pasien,jenis_pasien,created_at,current_hash,prev_hash" .
            "&order=created_at.desc";
        
        error_log("🔍 Query: $antrianQuery");
        
        $antrian = supabase('GET', 'antrian', $antrianQuery);
        
        error_log("📥 Total Records Fetched: " . (is_array($antrian) ? count($antrian) : 'NOT ARRAY'));
        
        if (isset($antrian['error'])) {
            error_log("❌ Supabase Error: " . json_encode($antrian['error']));
            echo json_encode([
                'success' => true,
                'data' => [
                    'total_pasien' => 0,
                    'total_bpjs' => 0,
                    'total_umum' => 0,
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ],
                'debug' => [
                    'error' => $antrian['error'],
                    'query' => $antrianQuery
                ]
            ]);
            return;
        }
        
        // ✅ BLOCKCHAIN LOGIC: Group by id_pasien and keep only the LATEST record
        $latestRecordsPerPatient = [];
        
        if (!isset($antrian['error']) && is_array($antrian)) {
            error_log("🔄 Processing " . count($antrian) . " antrian records...");
            
            foreach ($antrian as $item) {
                $id_pasien = $item['id_pasien'] ?? null;
                
                if (!$id_pasien) {
                    error_log("⚠️ Skipping record without id_pasien");
                    continue;
                }
                
                // Check if we already have a record for this patient
                if (!isset($latestRecordsPerPatient[$id_pasien])) {
                    // First record for this patient - add it
                    $latestRecordsPerPatient[$id_pasien] = $item;
                    error_log("   ✅ Added patient: $id_pasien (first record)");
                } else {
                    // Compare created_at to keep the latest
                    $existingTime = strtotime($latestRecordsPerPatient[$id_pasien]['created_at']);
                    $newTime = strtotime($item['created_at']);
                    
                    if ($newTime > $existingTime) {
                        // This record is newer - replace it
                        $latestRecordsPerPatient[$id_pasien] = $item;
                        error_log("   🔄 Updated patient: $id_pasien (newer record found)");
                    } else {
                        error_log("   ⏭️ Skipped patient: $id_pasien (older record)");
                    }
                }
            }
            
            error_log("📊 After deduplication: " . count($latestRecordsPerPatient) . " unique patients");
        }
        
        // ✅ Count patients by type (BPJS vs UMUM)
        $totalVisits = 0;
        $totalBPJSVisits = 0;
        $totalUMUMVisits = 0;
        
        foreach ($latestRecordsPerPatient as $id_pasien => $item) {
            $jenisPasien = $item['jenis_pasien'] ?? 'UMUM';
            $totalVisits++;
            
            if (strtoupper($jenisPasien) === 'BPJS') {
                $totalBPJSVisits++;
                error_log("   👤 Patient $id_pasien: BPJS");
            } else {
                $totalUMUMVisits++;
                error_log("   👤 Patient $id_pasien: UMUM");
            }
        }
        
        error_log("========================================");
        error_log("📊 FINAL STATISTICS (UNIQUE PATIENTS)");
        error_log("   Total Patients: $totalVisits");
        error_log("   BPJS Patients: $totalBPJSVisits");
        error_log("   UMUM Patients: $totalUMUMVisits");
        error_log("========================================");
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_pasien' => $totalVisits,
                'total_bpjs' => $totalBPJSVisits,
                'total_umum' => $totalUMUMVisits,
                'start_date' => $start_date,
                'end_date' => $end_date
            ],
            'debug' => [
                'total_records_fetched' => count($antrian),
                'unique_patients_counted' => $totalVisits
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ ERROR: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'data' => [
                'total_pasien' => 0,
                'total_bpjs' => 0,
                'total_umum' => 0
            ]
        ]);
    }
}

?>