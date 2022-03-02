jQuery(function($) {

  // когда была нажата кнопка «Поиск товаров» 
  $(document).on('submit', '#search-product-form', function() {
    // очистим панель сообщений
    clearResponse();
    
    // получаем ключевые слова для поиска 
    var keywords = $(this).find(":input[name='keywords']").val();

    // получаем данные из API на основе поисковых ключевых слов 
    $.getJSON("http://localhost/prg/authentication-jwt/api/v1/product/search.php?s=" + keywords, function(data) {

        // шаблон в products.js 
        readProductsTemplate(data, keywords, user_role);

        // изменяем title 
        changePageTitle("Поиск товаров: " + keywords);

    });

    // предотвращаем перезагрузку всей страницы 
    return false;
  });

});