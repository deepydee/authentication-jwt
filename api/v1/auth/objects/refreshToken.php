<?php
// объект 'refreshToken'
class RefreshToken {

  // подключение к БД таблице "refreshSessions" 
  private $conn;
  private $table_name = "refreshSessions";

  // свойства объекта 
  
  public $refreshToken; // uuid токен вида e5e430a0-027d-4979-90e8-696cc237eda1
  private $userId; // Id пользователя
  private $ua; // useragent
  private $fingerprint;
  private $ip;
  private $expiresIn;
  private $createdAt;

  // конструктор класса RefreshToken 
  public function __construct($db) {
    $this->conn = $db;
  }

// Создание нового токена 
public function setRefreshSession($userData) {

  // Вставляем запрос 
  $query = "INSERT INTO " . $this->table_name . "
            SET
              userId = :userId,
              refreshToken = :refreshToken,
              ua = :ua,
              fingerprint = :fingerprint,
              ip = :ip,
              expiresIn = :expiresIn";

  // подготовка запроса 
  $stmt = $this->conn->prepare($query);

  // инъекция
  $this->userId = htmlspecialchars(strip_tags($userData['uid']));
  $this->ua = htmlspecialchars(strip_tags($userData['ua']));
  $this->fingerprint = htmlspecialchars(strip_tags($userData['fp']));
  $this->ip = htmlspecialchars(strip_tags($userData['ip']));
  $this->expiresIn = htmlspecialchars(strip_tags($userData['exp']));
  $this->refreshToken = $this->getGuidv4();

  // привязываем значения 
  $stmt->bindParam(':userId', $this->userId);
  $stmt->bindParam(':refreshToken', $this->refreshToken);
  $stmt->bindParam(':ua', $this->ua);
  $stmt->bindParam(':fingerprint', $this->fingerprint);
  $stmt->bindParam(':ip', $this->ip);
  $stmt->bindParam(':expiresIn', $this->expiresIn);

  // Выполняем запрос 
  // Если выполнение успешно, то информация о пользователе будет сохранена в базе данных 
  if($stmt->execute()) {
      return true;
  }
  return false;
}

public function getRefreshSession($uuid) {
  // запрос токенов 
  $query = "SELECT *
            FROM " . $this->table_name . "
            WHERE refreshToken = ?
            LIMIT 0,1";

  // подготовка запроса 
  $stmt = $this->conn->prepare( $query );

  // инъекция 
  $uuid = htmlspecialchars(strip_tags($uuid));

  // привязываем значение e-mail 
  $stmt->bindParam(1, $uuid);

    // выполняем запрос 
    $stmt->execute();

    // получаем количество строк 
    $num = $stmt->rowCount();
  
    // если токен существует,
    // вернем текущую рефреш-сессию 
    if($num > 0) {
  
        // получаем значения 
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
  
        // проверим токен на свежесть
        $this->createdAt = new DateTimeImmutable($row['createdAt']);
        $this->expiresIn = htmlspecialchars(strip_tags($row['expiresIn']));
        $now = new DateTimeImmutable();
        
        // вернём массив, потому что в базе данных существует такой токен
        if($now->getTimestamp() - $this->createdAt->getTimestamp() < $this->expiresIn) {
          // удалим запись из базы
          $this->deleteRefreshSession($uuid);
          return $row;
        } else { // если просрочен - удаляем запись
          $this->deleteRefreshSession($uuid);
        }
    }
  
    // вернём 'false', если токен не обнаружен или истек
    return false;
}

public function clean() {
  // запрос токенов 
  // $query = "SELECT *
  //           FROM " . $this->table_name . "
  //           WHERE TIME_TO_SEC(TIMEDIFF(NOW(), createdAt)) > expiresIn";

  $query = "DELETE FROM " . $this->table_name . " WHERE id IN (
    SELECT * FROM (
        SELECT id FROM " . $this->table_name . " GROUP BY id HAVING ( 
          TIME_TO_SEC(TIMEDIFF(NOW(), createdAt)) > expiresIn )
        ) AS p
    )";

  // подготовка запроса 
  $stmt = $this->conn->prepare( $query );
  
  // выполняем запрос 
  if ($stmt->execute()) {
    return true;
  }

  return false;
}

// метод delete - удаление товара 
public function deleteRefreshSession($uuid) {
      
    // запрос для удаления записи (товара) 
    $query = "DELETE FROM ".$this->table_name." WHERE refreshToken = ?";

    // подготовка запроса 
    $stmt = $this->conn->prepare($query);

    // очистка 
    $uuid = htmlspecialchars(strip_tags($uuid));

    // привязываем id записи для удаления 
    $stmt->bindParam(1, $uuid);

    // выполняем запрос 
    if ($stmt->execute()) {
        return true;
    }

    return false;

}




  // генерация токена
  private function getGuidv4($data = null) {
    $data = $data ?? random_bytes(16);
    
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
  }

}