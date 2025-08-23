<?php
declare(strict_types=1);

namespace GeeknDragon\Core;

use Psr\Log\AbstractLogger;

class SimpleLogger extends AbstractLogger
{
    public function log($level, $message, array $context = []): void
    {
        $trace = $context['trace'] ?? '';
        error_log(sprintf('[%s] %s%s', strtoupper((string) $level), (string) $message, $trace ? "\n$trace" : ''));
    }
}
