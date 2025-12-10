<?php
	header('Content-Type: application/json');
	header('Cache-Control: no-store');

	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		http_response_code(405);
		echo json_encode(['error' => 'Method Not Allowed']);
		exit;
	}

	$rawInput = file_get_contents('php://input');
	$payload = json_decode($rawInput, true);
	if (!is_array($payload)) {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid JSON body']);
		exit;
	}

    // Prefer Razorpay field names; fallback to generic names if present
    $orderId   = isset($payload['razorpay_order_id'])   ? trim($payload['razorpay_order_id'])   : (isset($payload['order_id'])   ? trim($payload['order_id'])   : '');
    $paymentId = isset($payload['razorpay_payment_id']) ? trim($payload['razorpay_payment_id']) : (isset($payload['payment_id']) ? trim($payload['payment_id']) : '');
    $signature = isset($payload['razorpay_signature'])  ? trim($payload['razorpay_signature'])  : (isset($payload['signature'])  ? trim($payload['signature'])  : '');

    if ($orderId === '' || $paymentId === '' || $signature === '') {
        http_response_code(400);
        echo json_encode(['error' => 'razorpay_order_id, razorpay_payment_id, razorpay_signature are required']);
        exit;
    }

	// Razorpay secret used to generate signature (trim to avoid accidental spaces)
	$razorpayKeySecret = trim(' iotUbAmBeeAszaUjLipKTIu4');

	$generatedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $razorpayKeySecret);

    // Optional: log values for debugging in server error logs
    error_log("RZP verify: orderId=$orderId paymentId=$paymentId signature=$signature generated=$generatedSignature");

    if (hash_equals($generatedSignature, $signature)) {
        echo json_encode(['valid' => true]);
        exit;
    }

    // Respond 200 so Axios doesn't throw; frontend can show message
    http_response_code(200);
    echo json_encode(['valid' => false, 'message' => 'Signature mismatch']);
    exit;
?>