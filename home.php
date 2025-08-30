<?php
    $title = "Home";
    include "components/head.php";
    include "components/header.php"; 
?>
<?php 
    include "database.php";
    // Post $response = supabase("POST", "role", "", ["nama_role" => "Admin"]);
    $response = supabase("GET", "role", "select=*");
?>
<div id="home"></div>

<?= json_encode($response); ?>

<?php include "components/footer.php"; ?>