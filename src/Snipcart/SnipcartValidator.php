<?php

declare(strict_types=1);

final class SnipcartValidator
{
    public static function validateIncoming(): void
    {
        $secret = $_ENV['SNIPCART_SECRET_API_KEY']
            ?? $_SERVER['SNIPCART_SECRET_API_KEY']
            ?? '';

        if ($secret === '') {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'errors' => [[
                    'key' => 'config',
                    'message' => 'Snipcart secret key not configured'
                ]]
            ]);
            exit;
        }

        $headers = array_change_key_case($_SERVER, CASE_LOWER);
        $signature = $headers['http_x_snipcart_signature'] ?? null;

        if ($signature) {
            $payload   = file_get_contents('php://input');
            $computed  = hash_hmac('sha256', $payload, $secret);
            if (!hash_equals($computed, $signature)) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode([
                    'errors' => [[
                        'key' => 'invalid-signature',
                        'message' => 'Signature Snipcart invalide'
                    ]]
                ]);
                exit;
            }
            return;
        }

        $token = $headers['http_x_snipcart_requesttoken'] ?? null;
        if ($token) {
            $ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . urlencode($token));
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER     => ['Accept: application/json'],
                CURLOPT_USERPWD        => $secret . ':',
                CURLOPT_TIMEOUT        => 10,
            ]);
            curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($code !== 200 && $code !== 204) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode([
                    'errors' => [[
                        'key' => 'invalid-token',
                        'message' => 'Jeton Snipcart invalide'
                    ]]
                ]);
                exit;
            }
            return;
        }

        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            'errors' => [[
                'key' => 'missing-token',
                'message' => 'Signature ou jeton Snipcart manquant'
            ]]
        ]);
        exit;
    }
}

