jQuery(function($) {

  // показать список товаров при первой загрузке 
  //showProductsFirstPage();

  // когда была нажата кнопка «Все товары» 
  $(document).on('click', '.read-products-button', function() {
      showProductsFirstPage(user_role);
  });

  // когда была нажата кнопка «страница» 
  $(document).on('click', '.pagination li', function() {
      // получаем json url 
      var json_url = $(this).find('a').attr('data-page');

      // покажем список товаров 
      showProducts(json_url, user_role);
  });

});

function showProductsFirstPage(user_role) {
  var json_url="http://localhost/prg/authentication-jwt/api/v1/product/read_paging.php";
  showProducts(json_url, user_role);
}

// функция для отображения списка товаров 
function showProducts(json_url, user_role) {

  // получаем список товаров из API 
  $.getJSON(json_url, function(data) {

      // HTML для перечисления товаров 
      readProductsTemplate(data, "", user_role);

      // изменим заголовок страницы 
      //changePageTitle("Все товары");

  });
}