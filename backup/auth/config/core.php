<?php
  // показывать сообщения об ошибках 
  error_reporting(E_ALL);
  
  // установить часовой пояс по умолчанию 
  date_default_timezone_set('Europe/Moscow');

  $issuedAt = time();

  // jwt valid for 60 days (60 seconds * 60 minutes * 24 hours * 60 days)
  $expirationTime = $issuedAt + 60 * 1 * 1 * 1;

  // переменные, используемые для JWT 
  $key = "your_secret_key";
  $iss = "http://any-site.org";
  $aud = "http://any-site.com";
  $iat = $issuedAt;
  $nbf = $issuedAt;
  $exp = $expirationTime;
?>