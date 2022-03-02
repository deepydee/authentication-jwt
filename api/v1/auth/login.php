<?php
// заголовки 
header("Access-Control-Allow-Origin: http://localhost/prg/authentication-jwt/");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// файлы необходимые для соединения с БД 
include_once 'config/database.php';
include_once 'objects/user.php';
include_once 'objects/refreshToken.php';
 
// получаем соединение с базой данных 
$database = new Database();
$db = $database->getConnection();
 
// создание объекта 'User' 
$user = new User($db);
 
// получаем данные 
$data = json_decode(file_get_contents("php://input"));
 
// устанавливаем значения 
$user->email = $data->email;
$email_exists = $user->emailExists();

$fp = isset($data->fp) ? $data->fp : '';
$ip = $_SERVER['REMOTE_ADDR'];
$ua = $_SERVER['HTTP_USER_AGENT'];
 
// подключение файлов jwt 
include_once 'config/core.php';
include_once 'libs/php-jwt-master/src/BeforeValidException.php';
include_once 'libs/php-jwt-master/src/ExpiredException.php';
include_once 'libs/php-jwt-master/src/SignatureInvalidException.php';
include_once 'libs/php-jwt-master/src/JWT.php';
use \Firebase\JWT\JWT;
 
// существует ли электронная почта и соответствует ли пароль тому, что находится в базе данных 
if ( $email_exists && password_verify($data->password, $user->password) ) {
 
    $token = array(
       "iss" => $iss,
       "aud" => $aud,
       "iat" => $iat,
       "nbf" => $nbf,
       "exp" => $exp,
       "data" => array(
           "id" => $user->id,
           "firstname" => $user->firstname,
           "lastname" => $user->lastname,
           "email" => $user->email,
           "userRole" => $user->user_role
       )
    );

    // данные для создания refresh-токена
    $refresh_token_data = [
      "uid" => $user->id,
      "ua" => $ua,
      "fp" => $fp,
      "ip" => $ip,
      "exp" => $expiresIn
    ];

    // создание объекта 'refreshToken' 
    $refresh_token = new RefreshToken($db);
    
    // в случае успешного создания записи генерируем jwt acsess-token
    if ($refresh_token->setRefreshSession($refresh_token_data)) {

      $arr_cookie_options = array (
        'expires' => time() + $expiresIn,
        'path' => '/',
        'domain' => '', // .example.com leading dot for compatibility or use subdomain
        'secure' => false,     // or false
        'httponly' => true,    // or false
        'samesite' => 'Strict' // None || Lax  || Strict
        );

      // и записываем значение в http-only куку
      setcookie("refreshToken", $refresh_token->refreshToken, $arr_cookie_options);
      
      // код ответа 200 - OK
      http_response_code(200);
  
      // создание jwt 
      $jwt = JWT::encode($token, $key);
      echo json_encode(
          array(
              "message" => "Успешный вход в систему.",
              "jwt" => $jwt,
              "refreshToken" => $refresh_token->refreshToken
          )
      );
    } 
}
 
// Если электронная почта не существует или пароль не совпадает, 
// сообщим пользователю, что он не может войти в систему 
else {
 
  // код ответа 401 - Unauthorized (не авторизованный запрос)
  http_response_code(401);

  // сказать пользователю что войти не удалось 
  echo json_encode(array("message" => "Ошибка входа."));
}
?>