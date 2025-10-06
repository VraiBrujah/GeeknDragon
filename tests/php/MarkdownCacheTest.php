<?php

use PHPUnit\Framework\TestCase;
use GeeknDragon\Includes\MarkdownCache;

final class MarkdownCacheTest extends TestCase
{
    public function testConvertToHtmlBasic(): void
    {
        $html = MarkdownCache::convertToHtml("Hello **world**");
        $this->assertIsString($html);
        $this->assertStringContainsString('Hello', $html);
    }

    public function testConvertToPlainTextBasic(): void
    {
        $text = MarkdownCache::convertToPlainText("Hello **world**");
        $this->assertIsString($text);
        $this->assertStringContainsString('Hello', $text);
        $this->assertStringNotContainsString('**', $text);
    }
}
