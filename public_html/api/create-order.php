<?php
	header('Content-Type: application/json');
	header('Cache-Control: no-store');

	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		http_response_code(405);
		echo json_encode(['error' => 'Method Not Allowed']);
		exit;
	}

	// Read JSON body
	$rawInput = file_get_contents('php://input');
	$payload = json_decode($rawInput, true);
	if (!is_array($payload)) {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid JSON body']);
		exit;
	}

	$amount = isset($payload['amount']) ? intval($payload['amount']) : 0; // amount in paise
	$currency = isset($payload['currency']) ? strtoupper(trim($payload['currency'])) : 'INR';
	$receipt = isset($payload['receipt']) ? (string)$payload['receipt'] : ('rcpt_' . uniqid());

	if ($amount <= 0) {
		http_response_code(400);
		echo json_encode(['error' => 'Amount (in paise) must be > 0']);
		exit;
	}

	// Razorpay credentials (server-side only)
	$razorpayKeyId = 'rzp_test_R7RxkON5q04Q4G';
	$razorpayKeySecret = 'jG290rNOiIq8DRRX0vrznonK';

	// Build order payload
	$orderData = [
		'amount' => $amount,
		'currency' => $currency,
		'receipt' => $receipt,
		'payment_capture' => 1,
	];

	$ch = curl_init('https://api.razorpay.com/v1/orders');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
	// Use basic auth
	curl_setopt($ch, CURLOPT_USERPWD, $razorpayKeyId . ':' . $razorpayKeySecret);

	$responseBody = curl_exec($ch);
	$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$curlErrNo = curl_errno($ch);
	$curlErr = curl_error($ch);
	curl_close($ch);

	if ($curlErrNo) {
		http_response_code(502);
		echo json_encode(['error' => 'Curl error', 'details' => $curlErr]);
		exit;
	}

	// Pass-through Razorpay response and status
	http_response_code($httpStatus ?: 500);
	echo $responseBody !== false ? $responseBody : json_encode(['error' => 'Empty response from Razorpay']);
	exit;
?>