<?php
/**
 * Verify Google reCAPTCHA response using cURL.
 *
 * @param string $secret    Secret key.
 * @param string $response  User response token.
 * @param float  $threshold Minimum score for v3 (default 0.5).
 *
 * @return array{success:bool,error?:string}
 */
function verifyRecaptcha(string $secret, string $response, float $threshold = 0.5): array
{
    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $secret,
            'response' => $response,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);

    $apiResponse = curl_exec($ch);
    if ($apiResponse === false) {
        curl_close($ch);
        return ['success' => false, 'error' => 'Impossible de contacter le service reCAPTCHA.'];
    }

    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpStatus !== 200) {
        return ['success' => false, 'error' => 'Service reCAPTCHA indisponible.'];
    }

    $captchaResult = json_decode($apiResponse, true);

    if (isset($captchaResult['score'])) {
        if (!empty($captchaResult['success']) && $captchaResult['score'] >= $threshold) {
            return ['success' => true];
        }
        return ['success' => false, 'error' => 'La vérification reCAPTCHA a échoué.'];
    }

    if (!empty($captchaResult['success'])) {
        return ['success' => true];
    }

    return ['success' => false, 'error' => 'La vérification reCAPTCHA a échoué.'];
}
