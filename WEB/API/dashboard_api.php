<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/supabase.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($requestMethod === 'POST') {
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'get_doctor_data':
            getDoctorData($input['email'], $input['user_type'] ?? 'dokter');
            break;
        
        case 'get_queue_stats':
            getQueueStats($input['id_dokter']);
            break;
        
        case 'get_medicine_alerts':
            getMedicineAlerts($input['id_dokter']);
            break;
        
        case 'get_financial_summary':
            getFinancialSummary($input['id_dokter']);
            break;
        
        case 'get_patient_stats':
            getPatientStats($input['id_dokter']);
            break;

         case 'get_queue_details':
            getQueueDetails($input['id_dokter']);
            break;
        
        case 'get_patient_visit_chart':
            getPatientVisitChart($input['id_dokter']);
            break;
        
        case 'get_financial_chart':
            getFinancialChart($input['id_dokter']);
            break;
        
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
}

/**
 * Get user profile data including avatar and QR code
 * Works for both dokter and asisten_dokter
 */
function getDoctorData($email, $userType = 'dokter') {
    try {
        if (empty($email)) {
            echo json_encode([
                'success' => false,
                'message' => 'Email is required'
            ]);
            return;
        }

        // Determine which table to query based on user type
        if ($userType === 'asisten_dokter') {
            // Query asisten_dokter table
            $result = supabase('GET', 'asisten_dokter', 
                "email=ilike.$email&select=id_asisten_dokter,nama_lengkap,email,avatar_url,id_dokter,created_at"
            );
            
            if (!empty($result) && !isset($result['code'])) {
                // Return asisten data with consistent structure
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id_dokter' => $result[0]['id_asisten_dokter'], // Use asisten ID as primary ID
                        'nama_lengkap' => $result[0]['nama_lengkap'],
                        'email' => $result[0]['email'],
                        'avatar_url' => $result[0]['avatar_url'] ?? null,
                        'created_at' => $result[0]['created_at'],
                        'user_type' => 'asisten_dokter',
                        'id_dokter_parent' => $result[0]['id_dokter'], // Parent doctor ID
                        'nama_faskes' => null, // Asisten doesn't have faskes
                        'qr_code_data' => null // Asisten doesn't have QR code
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Asisten dokter data not found'
                ]);
            }
        } else {
            // Query dokter table (default)
            $result = supabase('GET', 'dokter', 
                "email=ilike.$email&select=id_dokter,nama_lengkap,nama_faskes,email,avatar_url,qr_code_data,created_at"
            );
            
            if (!empty($result) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'data' => array_merge($result[0], ['user_type' => 'dokter'])
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Doctor data not found'
                ]);
            }
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get queue statistics for today
 */
function getQueueStats($id_dokter) {
    try {
        $today = date('Y-m-d');
        
        // Get today's queue
        $result = supabase('GET', 'antrian', 
            "id_dokter=eq.$id_dokter&tanggal_antrian=eq.$today&select=status_antrian"
        );
        
        $stats = [
            'total' => 0,
            'selesai' => 0,
            'dalam_pemeriksaan' => 0,
            'menunggu' => 0
        ];
        
        if (is_array($result) && !isset($result['error'])) {
            $stats['total'] = count($result);
            
            foreach ($result as $item) {
                $status = strtolower($item['status_antrian'] ?? '');
                if ($status === 'selesai') {
                    $stats['selesai']++;
                } elseif ($status === 'dalam pemeriksaan') {
                    $stats['dalam_pemeriksaan']++;
                } elseif ($status === 'menunggu' || $status === 'belum periksa') {
                    $stats['menunggu']++;
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get medicine alerts (expiring and low stock)
 */
function getMedicineAlerts($id_dokter) {
    try {
        // Get medicines expiring soon (within 30 days)
        $expiryDate = date('Y-m-d', strtotime('+30 days'));
        $today = date('Y-m-d');
        
        // ✅ Join with obat table to filter by doctor
        $expiring = supabase('GET', 'detail_obat', 
            "obat.id_dokter=eq.$id_dokter&tanggal_expired=gte.$today&tanggal_expired=lte.$expiryDate&status_batch=eq.aktif&select=id_detail_obat,obat!inner(id_dokter)"
        );
        
        // ✅ Join with obat table to filter by doctor
        $lowStock = supabase('GET', 'detail_obat', 
            "obat.id_dokter=eq.$id_dokter&stock=lt.10&status_batch=eq.aktif&select=id_detail_obat,obat!inner(id_dokter)"
        );
        
        $expiringCount = is_array($expiring) && !isset($expiring['error']) ? count($expiring) : 0;
        $lowStockCount = is_array($lowStock) && !isset($lowStock['error']) ? count($lowStock) : 0;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'expiring' => $expiringCount,
                'low_stock' => $lowStockCount
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
 * Get financial summary for current month
 */
function getFinancialSummary($id_dokter) {
    try {
        $startOfMonth = date('Y-m-01');
        $endOfMonth = date('Y-m-t');
        
        // Get pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&created_at=gte.{$startOfMonth}T00:00:00Z&created_at=lte.{$endOfMonth}T23:59:59Z&select=total"
        );
        
        $totalPemasukan = 0;
        if (is_array($pemasukan) && !isset($pemasukan['error'])) {
            foreach ($pemasukan as $item) {
                $totalPemasukan += floatval($item['total'] ?? 0);
            }
        }
        
        // Get pengeluaran
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&tanggal=gte.$startOfMonth&tanggal=lte.$endOfMonth&select=pengeluaran_detail(jumlah,harga)"
        );
        
        $totalPengeluaran = 0;
        if (is_array($pengeluaran) && !isset($pengeluaran['error'])) {
            foreach ($pengeluaran as $item) {
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $totalPengeluaran += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
            }
        }
        
        $profit = $totalPemasukan - $totalPengeluaran;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'pemasukan' => $totalPemasukan,
                'pengeluaran' => $totalPengeluaran,
                'profit' => $profit
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
 * Get patient statistics for current month
 */
function getPatientStats($id_dokter) {
    try {
        $startOfMonth = date('Y-m-01');
        $today = date('Y-m-d');
        
        // Get patient visits this month
        $result = supabase('GET', 'antrian', 
            "id_dokter=eq.$id_dokter&tanggal_antrian=gte.$startOfMonth&tanggal_antrian=lte.$today&select=id_antrian"
        );
        
        $totalPatients = is_array($result) && !isset($result['error']) ? count($result) : 0;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_patients' => $totalPatients
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getQueueDetails($id_dokter) {
    try {
        $today = date('Y-m-d');
        
        // Get today's queue with patient details
        $result = supabase('GET', 'antrian', 
            "id_dokter=eq.$id_dokter&tanggal_antrian=eq.$today&order=no_antrian.asc&select=id_antrian,no_antrian,jenis_pasien,jam_antrian,status_antrian,pasien(nama)"
        );
        
        $queueList = [];
        
        if (is_array($result) && !isset($result['error'])) {
            foreach ($result as $item) {
                $queueList[] = [
                    'id_antrian' => $item['id_antrian'],
                    'no_antrian' => $item['no_antrian'],
                    'nama_pasien' => $item['pasien']['nama'] ?? 'Unknown',
                    'jam_antrian' => $item['jam_antrian'],
                    'jenis_pasien' => $item['jenis_pasien'],
                    'status_antrian' => $item['status_antrian']
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $queueList
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getPatientVisitChart($id_dokter) {
    try {
        $monthlyData = [];
        
        // Get last 12 months data
        for ($i = 11; $i >= 0; $i--) {
            $month = date('Y-m', strtotime("-$i months"));
            $startDate = $month . '-01';
            $endDate = date('Y-m-t', strtotime($startDate));
            
            // Count patients for this month
            $result = supabase('GET', 'antrian', 
                "id_dokter=eq.$id_dokter&tanggal_antrian=gte.$startDate&tanggal_antrian=lte.$endDate&select=id_antrian"
            );
            
            $count = is_array($result) && !isset($result['error']) ? count($result) : 0;
            
            $monthlyData[] = [
                'month' => date('M', strtotime($startDate)),
                'count' => $count
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $monthlyData
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getFinancialChart($id_dokter) {
    try {
        $monthlyData = [];
        
        // Get last 12 months data
        for ($i = 11; $i >= 0; $i--) {
            $month = date('Y-m', strtotime("-$i months"));
            $startDate = $month . '-01';
            $endDate = date('Y-m-t', strtotime($startDate));
            
            // Get income for this month
            $pemasukan = supabase('GET', 'pemasukan', 
                "id_dokter=eq.$id_dokter&created_at=gte.{$startDate}T00:00:00Z&created_at=lte.{$endDate}T23:59:59Z&select=total"
            );
            
            $totalPemasukan = 0;
            if (is_array($pemasukan) && !isset($pemasukan['error'])) {
                foreach ($pemasukan as $item) {
                    $totalPemasukan += floatval($item['total'] ?? 0);
                }
            }
            
            $monthlyData[] = [
                'month' => date('M', strtotime($startDate)),
                'income' => round($totalPemasukan / 1000000, 1) // Convert to millions
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $monthlyData
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>