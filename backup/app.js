// статус пользователя
var user_role = 'user';
var user_role_ru = '';

jQuery(function($) {

  // HTML приложения 
  var app_html = `
      <!-- navbar -->
      <nav class="navbar navbar-expand-md navbar-light bg-light fixed-top main-menu">

      </nav>
      <!-- /navbar -->
      
      <div class='container'>

          <div class="pb-2 mt-4 mb-2 border-bottom">
            <h1 id='page-title'></h1>
          </div>

          <!-- здесь будут подсказки / быстрые сообщения -->
          <div id="response"></div>

          <!-- здесь будет показано содержимое -->
          <div id='page-content'></div>

      </div>`;

  // вставка кода на страницу 
  $("#app").html(app_html);

  // показать домашнюю страницу
  showHomePage();

  // показать форму регистрации 
  $(document).on('click', '#sign_up', function() {

    var html = `
          <form id='sign_up_form'>
            <div class="form-group">
                <label for="firstname">Имя</label>
                <input type="text" class="form-control" name="firstname" id="firstname" required />
            </div>

            <div class="form-group">
                <label for="lastname">Фамилия</label>
                <input type="text" class="form-control" name="lastname" id="lastname" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" name="email" id="email" placeholder="name@example.com" required />
            </div>

            <div class="form-group">
                <label for="password">Пароль</label>
                <input type="password" class="form-control" name="password" id="password" required />
            </div>

            <button type='submit' class='btn btn-primary'>Зарегистрироваться</button>
        </form>
    `;

    clearResponse();
    // изменяем заголовок страницы 
    changePageTitle("Регистрация");
    
    $('#page-content').html(html);
  });

      // выполнение кода при отправке формы 
      $(document).on('submit', '#sign_up_form', function() {

        // получаем данные формы 
        var sign_up_form = $(this);
        var form_data = JSON.stringify(sign_up_form.serializeObject());
        
        // отправить данные формы в API 
        $.ajax({
            url: "api/v1/auth/create_user.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result) {
                // в случае удачного завершения запроса к серверу, 
                // сообщим пользователю, что он успешно зарегистрировался и очистим поля ввода 
                $('#response').html("<div class='alert alert-success'>Регистрация завершена успешно. Пожалуйста, войдите.</div>");
                sign_up_form.find('input').val('');
            },
            error: function(xhr, resp, text){
                // при ошибке сообщить пользователю, что регистрация не удалась 
                $('#response').html("<div class='alert alert-danger'>Невозможно зарегистрироваться. Пожалуйста, свяжитесь с администратором.</div>");
            }
        });
  
        return false;
        });

      // показать форму входа 
      $(document).on('click', '#login', function() {
        showLoginPage();
      });

      // при отправке формы входа 
      $(document).on('submit', '#login_form', function() {

        // получаем данные формы 
        var login_form = $(this);
        var form_data = JSON.stringify(login_form.serializeObject());

        // отправить данные формы в API 
        $.ajax({
            url: "api/v1/auth/login.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result){

                // сохранить JWT в куки 
                setCookie("jwt", result.jwt, 1);

                // показать домашнюю страницу и сообщить пользователю, что вход был успешным 
                showHomePage();
                $('#response').html("<div class='alert alert-success'>Успешный вход в систему.</div>");

            },
            error: function(xhr, resp, text){
                // при ошибке сообщим пользователю, что вход в систему не выполнен и очистим поля ввода 
                $('#response').html("<div class='alert alert-danger'>Ошибка входа. Email или пароль указан неверно.</div>");
                login_form.find('input').val('');
            }
        });

        return false;
    });

    // показать домашнюю страницу 
    $(document).on('click', '#home', function() {
      showHomePage();
      clearResponse();
    });

    // показать форму обновления аккаунта
    $(document).on('click', '#update_account', function() {
      showUpdateAccountForm();
    });
    
    // срабатывание при отправке формы «обновить аккаунт» 
    $(document).on('submit', '#update_account_form', function() {

      // дескриптор для update_account_form 
      var update_account_form = $(this);

      // валидация JWT для проверки доступа 
      var jwt = getCookie('jwt');

      // получаем данные формы 
      var update_account_form_obj = update_account_form.serializeObject()

      // добавим JWT 
      update_account_form_obj.jwt = jwt;

      // преобразуем значения формы в JSON с помощью функции stringify () 
      var form_data = JSON.stringify(update_account_form_obj);

      // отправить данные формы в API 
      $.ajax({
          url: "api/v1/auth/update_user.php",
          type : "POST",
          contentType : 'application/json',
          data : form_data,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
          },
          success : function(result) {

              // сказать, что учетная запись пользователя была обновлена 
              $('#response').html("<div class='alert alert-success'>Учетная запись обновлена.</div>");

              // сохраняем новый JWT в cookie 
              setCookie("jwt", result.jwt, 1);
          },

          // показать сообщение об ошибке пользователю 
          error: function(xhr, resp, text){
              if(xhr.responseJSON.message == "Невозможно обновить пользователя."){
                  $('#response').html("<div class='alert alert-danger'>Невозможно обновить пользователя.</div>");
              }

              else if(xhr.responseJSON.message == "Доступ закрыт."){
                  showLoginPage();
                  $('#response').html("<div class='alert alert-success'>Доступ закрыт. Пожалуйста войдите</div>");
              }
          }
      });

      return false;
    });

    // выйти из системы 
    $(document).on('click', '#logout', function() {
      showLoginPage();
      $('#response').html("<div class='alert alert-info'>Вы вышли из системы.</div>");
    });

});

// изменение заголовка страницы 
function changePageTitle(page_title) {

  // измение заголовка страницы 
  $('#page-title').text(page_title);

  // измение заголовка вкладки браузера 
  document.title = page_title;
}

// функция для создания значений формы в формате json 
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
};

// Удаление всех быстрых сообщений 
function clearResponse() {
  $('#response').html('');
}

// эта функция сделает меню похожим на опции для пользователя, вышедшего из системы. 
function showLoggedOutMenu() {
  // показать кнопку входа и регистрации в меню навигации 
  $("#login, #sign_up").show();
  $("#logout").hide(); // скрыть кнопку выхода 
}

// функция setCookie() поможет нам сохранить JWT в файле cookie 
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Функция поможет нам прочитать JWT, который мы сохранили ранее. 
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
  
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

// функция показывает HTML-форму для входа в систему. 
function showLoginPage() {

  // удаление jwt 
  setCookie("jwt", "", 1);
  
  // форма входа 
  var html = `
      <form id='login_form'>
          <div class='form-group'>
              <label for='email'>Email адрес</label>
              <input type='email' class='form-control' id='email' name='email' placeholder='Введите email'>
          </div>
  
          <div class='form-group'>
              <label for='password'>Пароль</label>
              <input type='password' class='form-control' id='password' name='password' placeholder='Введите пароль'>
          </div>
  
          <button type='submit' class='btn btn-primary'>Войти</button>
      </form>
      `;
  
  // изменяем заголовок страницы 
  changePageTitle("Вход");
          
  $('#page-content').html(html);
  clearResponse();
  showLoggedOutMenu();
}

// функция показать домашнюю страницу 
function showHomePage() {

  // валидация JWT для проверки доступа 
  var jwt = getCookie('jwt');
  $.post("api/v1/auth/validate_token.php", JSON.stringify({ jwt:jwt })).done(function(result) {
  
  // статус пользователя
  user_role = result.data.userRole;

  switch(user_role) {
    case 'user':
      user_role_ru = 'пользователь';
      break;
    case 'manager':
      user_role_ru = 'менеджер';
      break;
    case 'admin':
      user_role_ru = 'администратор';
      break;
  }

    // если прошел валидацию, показать домашнюю страницу 
    var html = `
      <div class="card pb-2 mt-4 mb-2">
        <div class="card-header">Добро пожаловать, ${result.data.firstname}!
          <div class="card-body">
            <h5 class="card-title">Вы вошли в систему как ${user_role_ru}.</h5>
            <p class="card-text">Вы не сможете получить доступ к домашней странице и страницам учетной записи, если вы не вошли в систему.</p>
          </div>
      </div>
    `;
    
    // показать список товаров при первой загрузке 
    showProductsFirstPage(user_role);
    
    // изменяем заголовок страницы 
    changePageTitle("Домашняя страница");

    //$('#response').html(`<div class='alert alert-success'>Добро пожаловать, ${result.data.firstname}! Вы вошли в систему как ${user_status_ru}</div>`);

    showLoggedInMenu();
  })
  
  // показать страницу входа при ошибке 
  .fail(function(result) {
      showMainMenu()
      showLoginPage();
      $('#response').html("<div class='alert alert-danger'>Пожалуйста войдите, чтобы получить доступ к домашней станице</div>");
  });
}

function showUpdateAccountForm() {

  // валидация JWT для проверки доступа 
  var jwt = getCookie('jwt');
  $.post("api/v1/auth/validate_token.php", JSON.stringify({ jwt:jwt })).done(function(result) {

    // статус пользователя
    user_role = result.data.userRole;

    // если валидация прошла успешно, покажем данные пользователя в форме 
    var html = `
            <div class="card pb-2 mt-4 mb-2">
                <div class="card-header">Добро пожаловать, ${result.data.firstname}!</div>
                <div class="card-body">
                    <h5 class="card-title">Вы вошли в систему как ${user_role_ru}.</h5>
                    <p class="card-text">Вы не сможете получить доступ к домашней странице и страницам учетной записи, если вы не вошли в систему.</p>
                </div>
            </div>
            
            <form id='update_account_form'>
                <div class="form-group">
                    <label for="firstname">Имя</label>
                    <input type="text" class="form-control" name="firstname" id="firstname" required value="` + result.data.firstname + `" />
                </div>

                <div class="form-group">
                    <label for="lastname">Фамилия</label>
                    <input type="text" class="form-control" name="lastname" id="lastname" required value="` + result.data.lastname + `" />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" name="email" id="email" required value="` + result.data.email + `" />
                </div>

                <div class="form-group">
                    <label for="password">Пароль</label>
                    <input type="password" class="form-control" name="password" id="password" />
                </div>

                <button type='submit' class='btn btn-primary'>
                    Сохранить
                </button>
            </form>
        `;

    // изменяем заголовок страницы 
    changePageTitle("Обновление аккаунта");

    clearResponse();
    $('#page-content').html(html);
  })
  // в случае ошибки / сбоя сообщите пользователю, что ему необходимо войти в систему, чтобы увидеть страницу учетной записи. 
  .fail(function(result) {
      showMainMenu()
      showLoginPage();
      $('#response').html("<div class='alert alert-danger'>Пожалуйста, войдите, чтобы получить доступ к странице учетной записи.</div>");
  });
}

// если пользователь залогинен 
function showLoggedInMenu() {
  showMainMenu();
  // скрыть кнопки вход и зарегистрироваться с панели навигации и показать кнопку выхода 
  $("#login, #sign_up").hide();
  $("#logout").show();
}

// показать меню
function showMainMenu() {
  var menu = `
  <a class="navbar-brand" href="#">Navbar</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
          <a class="nav-item nav-link" href="#" id='home'>Домашняя страница</a>
          <a class="nav-item nav-link" href="#" id='update_account'>Учетная запись</a>
          <a class="nav-item nav-link" href="#" id='logout'>Выход</a>
          <a class="nav-item nav-link" href="#" id='login'>Вход</a>
          <a class="nav-item nav-link" href="#" id='sign_up'>Регистрация</a>
      </div>
  </div>
  `;

  $('.main-menu').html(menu);

}