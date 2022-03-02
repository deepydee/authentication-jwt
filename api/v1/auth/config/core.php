<?php
  // показывать сообщения об ошибках 
  error_reporting(E_ALL);
  
  // установить часовой пояс по умолчанию 
  date_default_timezone_set('Europe/Moscow');

  $issuedAt = new DateTimeImmutable(); // time()

  // jwt valid for 60 days (60 seconds * 60 minutes * 24 hours * 60 days)
  //$expirationTime = $issuedAt + 60 * 1 * 1 * 1;

  $expirationTime = $issuedAt->modify('+10 minutes')->getTimestamp();

  // переменные, используемые для JWT 
  $key = "bGS6lzFqvvSQ8ALbOxatm7/Vk7mLQyzqaS34Q4oR1ew=";
  $iss = "http://any-site.org";
  $aud = "http://any-site.com";
  $iat = $issuedAt->getTimestamp();
  $nbf = $issuedAt->getTimestamp();
  $exp = $expirationTime;
  // refresh token valid for 60 days (60 seconds * 60 minutes * 24 hours * 60 days)
  $expiresIn = 60 * 60 * 25 * 60;
?>