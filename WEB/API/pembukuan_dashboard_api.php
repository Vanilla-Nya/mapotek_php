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
        case 'get_summary':
            getPembukuanSummary($input['id_dokter'], $input['period'] ?? 'month');
            break;
        
        case 'get_recent_transactions':
            getRecentTransactions($input['id_dokter'], $input['limit'] ?? 10);
            break;
        
        case 'get_monthly_chart':
            getMonthlyChartData($input['id_dokter'], $input['year'] ?? date('Y'));
            break;
        
        case 'get_category_breakdown':
            getCategoryBreakdown($input['id_dokter']);
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
 * Get financial summary for dashboard
 */
function getPembukuanSummary($id_dokter, $period = 'month') {
    try {
        // Determine date range based on period
        switch ($period) {
            case 'today':
                $startDate = date('Y-m-d');
                $endDate = date('Y-m-d');
                break;
            case 'week':
                $startDate = date('Y-m-d', strtotime('monday this week'));
                $endDate = date('Y-m-d', strtotime('sunday this week'));
                break;
            case 'year':
                $startDate = date('Y-01-01');
                $endDate = date('Y-12-31');
                break;
            case 'month':
            default:
                $startDate = date('Y-m-01');
                $endDate = date('Y-m-t');
                break;
        }
        
        $startDateTime = $startDate . 'T00:00:00Z';
        $endDateTime = $endDate . 'T23:59:59Z';
        
        // Get pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=total,jenis_pemasukan"
        );
        
        $totalPemasukan = 0;
        $pemasukanByType = [];
        
        if (is_array($pemasukan) && !isset($pemasukan['error'])) {
            foreach ($pemasukan as $item) {
                $total = floatval($item['total'] ?? 0);
                $totalPemasukan += $total;
                
                $jenis = $item['jenis_pemasukan'] ?? 'Lainnya';
                if (!isset($pemasukanByType[$jenis])) {
                    $pemasukanByType[$jenis] = 0;
                }
                $pemasukanByType[$jenis] += $total;
            }
        }
        
        // Get pengeluaran
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&tanggal=gte.$startDate&tanggal=lte.$endDate&select=keterangan,pengeluaran_detail(jumlah,harga)"
        );
        
        $totalPengeluaran = 0;
        $pengeluaranByType = [];
        
        if (is_array($pengeluaran) && !isset($pengeluaran['error'])) {
            foreach ($pengeluaran as $item) {
                $itemTotal = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $itemTotal += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                $totalPengeluaran += $itemTotal;
                
                $keterangan = $item['keterangan'] ?? 'Lainnya';
                if (!isset($pengeluaranByType[$keterangan])) {
                    $pengeluaranByType[$keterangan] = 0;
                }
                $pengeluaranByType[$keterangan] += $itemTotal;
            }
        }
        
        $profit = $totalPemasukan - $totalPengeluaran;
        $profitMargin = $totalPemasukan > 0 ? ($profit / $totalPemasukan) * 100 : 0;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'total_profit' => $profit,
                'profit_margin' => round($profitMargin, 2),
                'pemasukan_by_type' => $pemasukanByType,
                'pengeluaran_by_type' => $pengeluaranByType,
                'transaction_count' => [
                    'pemasukan' => count($pemasukan ?? []),
                    'pengeluaran' => count($pengeluaran ?? [])
                ]
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
 * Get recent transactions for quick view
 */
function getRecentTransactions($id_dokter, $limit = 10) {
    try {
        $allTransactions = [];
        
        // Get recent pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&select=*&order=created_at.desc&limit=$limit"
        );
        
        if (is_array($pemasukan) && !isset($pemasukan['error'])) {
            foreach ($pemasukan as $item) {
                $allTransactions[] = [
                    'id' => $item['id_pemasukan'],
                    'type' => 'Pemasukan',
                    'description' => $item['jenis_pemasukan'] ?? 'Pemasukan',
                    'detail' => $item['deskripsi'] ?? '-',
                    'amount' => floatval($item['total'] ?? 0),
                    'date' => $item['created_at'],
                    'payment_method' => $item['metode_pembayaran'] ?? '-'
                ];
            }
        }
        
        // Get recent pengeluaran
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&select=*,pengeluaran_detail(*)&order=created_at.desc&limit=$limit"
        );
        
        if (is_array($pengeluaran) && !isset($pengeluaran['error'])) {
            foreach ($pengeluaran as $item) {
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $allTransactions[] = [
                    'id' => $item['id_pengeluaran'],
                    'type' => 'Pengeluaran',
                    'description' => $item['keterangan'] ?? 'Pengeluaran',
                    'detail' => $item['keterangan'] ?? '-',
                    'amount' => $total,
                    'date' => $item['created_at'],
                    'tanggal' => $item['tanggal']
                ];
            }
        }
        
        // Sort by date
        usort($allTransactions, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        // Limit results
        $allTransactions = array_slice($allTransactions, 0, $limit);
        
        echo json_encode([
            'success' => true,
            'data' => $allTransactions
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get monthly chart data for the year
 */
function getMonthlyChartData($id_dokter, $year) {
    try {
        $monthlyData = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $startDate = "$year-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01";
            $endDate = date("Y-m-t", strtotime($startDate));
            
            $startDateTime = $startDate . 'T00:00:00Z';
            $endDateTime = $endDate . 'T23:59:59Z';
            
            // Get pemasukan for month
            $pemasukan = supabase('GET', 'pemasukan', 
                "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=total"
            );
            
            $totalPemasukan = 0;
            if (is_array($pemasukan) && !isset($pemasukan['error'])) {
                foreach ($pemasukan as $item) {
                    $totalPemasukan += floatval($item['total'] ?? 0);
                }
            }
            
            // Get pengeluaran for month
            $pengeluaran = supabase('GET', 'pengeluaran', 
                "id_dokter=eq.$id_dokter&tanggal=gte.$startDate&tanggal=lte.$endDate&select=pengeluaran_detail(jumlah,harga)"
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
            
            $monthlyData[] = [
                'month' => $month,
                'month_name' => date('M', strtotime($startDate)),
                'pemasukan' => $totalPemasukan,
                'pengeluaran' => $totalPengeluaran,
                'profit' => $totalPemasukan - $totalPengeluaran
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'year' => $year,
                'monthly' => $monthlyData
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
 * Get category breakdown for pie/donut charts
 */
function getCategoryBreakdown($id_dokter) {
    try {
        $startOfMonth = date('Y-m-01');
        $endOfMonth = date('Y-m-t');
        
        $startDateTime = $startOfMonth . 'T00:00:00Z';
        $endDateTime = $endOfMonth . 'T23:59:59Z';
        
        // Get pemasukan breakdown
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=jenis_pemasukan,total"
        );
        
        $pemasukanCategories = [];
        if (is_array($pemasukan) && !isset($pemasukan['error'])) {
            foreach ($pemasukan as $item) {
                $jenis = $item['jenis_pemasukan'] ?? 'Lainnya';
                if (!isset($pemasukanCategories[$jenis])) {
                    $pemasukanCategories[$jenis] = 0;
                }
                $pemasukanCategories[$jenis] += floatval($item['total'] ?? 0);
            }
        }
        
        // Get pengeluaran breakdown
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&tanggal=gte.$startOfMonth&tanggal=lte.$endOfMonth&select=keterangan,pengeluaran_detail(jumlah,harga)"
        );
        
        $pengeluaranCategories = [];
        if (is_array($pengeluaran) && !isset($pengeluaran['error'])) {
            foreach ($pengeluaran as $item) {
                $keterangan = $item['keterangan'] ?? 'Lainnya';
                $total = 0;
                
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                if (!isset($pengeluaranCategories[$keterangan])) {
                    $pengeluaranCategories[$keterangan] = 0;
                }
                $pengeluaranCategories[$keterangan] += $total;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'pemasukan_categories' => $pemasukanCategories,
                'pengeluaran_categories' => $pengeluaranCategories
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>