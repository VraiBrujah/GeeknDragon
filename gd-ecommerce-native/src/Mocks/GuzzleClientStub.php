<?php

namespace GeeknDragon\Mocks;

class GuzzleClientStub
{
    public function request($method, $uri, $options = [])
    {
        return new GuzzleResponseStub();
    }
    
    public function get($uri, $options = [])
    {
        return new GuzzleResponseStub();
    }
    
    public function post($uri, $options = [])
    {
        return new GuzzleResponseStub();
    }
}

class GuzzleResponseStub
{
    public function getStatusCode()
    {
        return 200;
    }
    
    public function getBody()
    {
        return new GuzzleStreamStub();
    }
}

class GuzzleStreamStub
{
    public function getContents()
    {
        return json_encode(['mock' => true, 'status' => 'ok']);
    }
}