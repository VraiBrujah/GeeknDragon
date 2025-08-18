<?php

namespace GeeknDragon\Mocks;

class StripeStub
{
    public static function setApiKey($key)
    {
        // Mock pour les tests
    }
}

class PaymentIntentStub
{
    public $id;
    public $status;
    public $client_secret;
    
    public static function create($params)
    {
        $pi = new self();
        $pi->id = 'pi_test_' . uniqid();
        $pi->status = 'requires_payment_method';
        $pi->client_secret = $pi->id . '_secret_test';
        return $pi;
    }
    
    public static function retrieve($id)
    {
        $pi = new self();
        $pi->id = $id;
        $pi->status = 'succeeded';
        $pi->client_secret = $id . '_secret_test';
        return $pi;
    }
    
    public function confirm($params = [])
    {
        $this->status = 'succeeded';
        return $this;
    }
}

class PaymentMethodStub
{
    public static function all($params)
    {
        return [
            'data' => [
                [
                    'id' => 'pm_card',
                    'type' => 'card',
                    'card' => ['brand' => 'visa']
                ]
            ]
        ];
    }
}