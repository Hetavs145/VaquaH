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

	$orderId = isset($payload['order_id']) ? trim($payload['order_id']) : '';
	$paymentId = isset($payload['payment_id']) ? trim($payload['payment_id']) : '';
	$signature = isset($payload['signature']) ? trim($payload['signature']) : '';

	if ($orderId === '' || $paymentId === '' || $signature === '') {
		http_response_code(400);
		echo json_encode(['error' => 'order_id, payment_id, signature are required']);
		exit;
	}

	// Razorpay secret used to generate signature
	$razorpayKeySecret = 'jG290rNOiIq8DRRX0vrznonK';

	$generatedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $razorpayKeySecret);

	if (hash_equals($generatedSignature, $signature)) {
		echo json_encode(['status' => 'ok']);
		exit;
	}

	http_response_code(400);
	echo json_encode(['status' => 'failed', 'error' => 'Signature mismatch']);
	exit;
?>