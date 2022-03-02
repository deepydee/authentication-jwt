<?php
  // показывать сообщения об ошибках 
  error_reporting(E_ALL);
  
  // установить часовой пояс по умолчанию 
  date_default_timezone_set('Europe/Moscow');

  // URL домашней страницы 
  $home_url="http://localhost/prg/authentication-jwt/api/v1/";

  // страница указана в параметре URL, страница по умолчанию одна 
  $page = isset($_GET['page']) ? $_GET['page'] : 1;

  // установка количества записей на странице 
  $records_per_page = 5;

  // расчёт для запроса предела записей 
  $from_record_num = ($records_per_page * $page) - $records_per_page;
?>