// html список товаров 
function readProductsTemplate(data, keywords, user_role) {

  var read_products_html = `
    <!-- форма поиска товаров -->
    <form class='pb-2 mt-4 mb-2' id='search-product-form' action='#' method='post'>
        <div class='input-group pull-left w-30-pct'>

            <input type='text' value='` + keywords + `' name='keywords' class='form-control product-search-keywords' placeholder='Поиск товаров...' />

            <span class='input-group-btn'>
                <button type='submit' class='btn btn-default' type='button'>
                  <i class="bi bi-search"></i>
                </button>
            </span>

        </div>
    </form>`

    // создавать товары могут только менеджеры и админ
    if (user_role == 'manager' || user_role == 'admin') {
      read_products_html += `
      <!-- при нажатии загружается форма создания продукта -->
      <div id='create-product' class='btn btn-primary float-end m-b-15px create-product-button'>
        <i class="bi bi-plus"></i> Создание товара
      </div>`
    }

    read_products_html += `
      <!-- начало таблицы -->
      <table class='table table-bordered table-hover'>

      <!-- создание заголовков таблицы -->
      <tr>
          <th class='w-15 p-3'>Название</th>
          <th class='w-10'>Цена</th>
          <th class='w-15'>Категория</th>
          <th class='w-auto text-align-center'>Действие</th>
      </tr>`;

    // перебор списка возвращаемых данных 
    $.each(data.records, function(key, val) {

      // создание новой строки таблицы для каждой записи 
      read_products_html += `
          <tr>

              <td>` + val.name + `</td>
              <td>` + val.price + `</td>
              <td>` + val.category_name + `</td>

              <!-- кнопки 'действий' -->
              <td>
                  <!-- кнопка чтения товара -->
                  <button class='btn btn-primary m-r-10px read-one-product-button' data-id='` + val.id + `'>
                    <i class="bi bi-eye"></i> Просмотр
                  </button>`;
      if (user_role == 'manager' || user_role == 'admin') {
        read_products_html += `
              <!-- кнопка редактирования -->
              <button class='btn btn-info m-r-10px update-product-button' data-id='` + val.id + `'>
                <i class="bi bi-pencil-square"></i> Редактировать
              </button>`
      }

      if (user_role == 'admin') {
        read_products_html += `
              <!-- кнопка удаления товара -->
              <button class='btn btn-danger delete-product-button' data-id='` + val.id + `'>
                <i class="bi bi-trash"></i> Удалить
              </button>`
      }
      read_products_html += `
              </td>

          </tr>`;
  });

  // конец таблицы 
  read_products_html += `</table>`;

  // pagination 
  if (data.paging) {
    read_products_html += "<nav aria-label='Page navigation'>";
    read_products_html += "<ul class='pagination pull-left margin-zero padding-bottom-2em'>";

        // первая 
        if(data.paging.first!="") {
            read_products_html += "<li class='page-item'><a class='page-link' data-page='" + data.paging.first + "' aria-label='Первая страница'><span aria-hidden='true'>&laquo;</span></a></li>";
        }

        // перебор страниц 
        $.each(data.paging.pages, function(key, val) {
            var active_page = val.current_page == "yes" ? "class='page-item active'" : "class='page-item'";
            read_products_html += "<li " + active_page + "><a class='page-link' data-page='" + val.url + "'>" + val.page + "</a></li>";
        });

        // последняя 
        if (data.paging.last != "") {
            read_products_html += "<li  class='page-item'><a class='page-link' data-page='" + data.paging.last + "' aria-label='Последняя страница'><span aria-hidden='true'>&raquo;</span></a></li>";
        }
    read_products_html += "</ul>";
    read_products_html += "</nav>";
  }

  // добавим в «page-content» нашего приложения 
  $("#page-content").html(read_products_html);
}