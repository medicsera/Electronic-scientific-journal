const table = document.getElementById('articles_table')
const tbody = table.querySelector("tbody")

async function fetchJ(url) {
    try {
        const result = await fetch(url)
        if (!result.ok) throw new Error(`Error ${result.status}`);
        return await result.json();
    } catch (error){
        console.error(error)
        return[]
    }
}


function reload(list){
    tbody.innerHTML = ""
    list.forEach((art,ind) => {
        const tr = document.createElement("tr")
        tr.innerHTML = 
        `<td>${ind + 1}</td>
        <td>${art.title}</td>
        <td>${art.authors.join(", ")}</td>
        <td>${new Date(art.date).toLocaleDateString()}</td>
        <td>
            <a href="article/${art._id}"}
                <button title="Просмотр">
                    <img src="lupe.jpg" alt="Просмотр" width="20" height="20">
                </button>
            </a>
        </td>
        <td>
            <button class="delete-btn" data-id="${art._id}" title="Удалить статью">
                <img src="del.png" alt="Удалить" width="20" height="20">
            </button>
        </td>`
        tbody.appendChild(tr)
        tr.querySelector('.delete-btn').addEventListener('click', function() {
            deleteArticle(art._id);
        });

        
    })
    table.hidden = list.length === 0;
}


document.getElementById("list_button").addEventListener('click', async () => {
    const articles = await fetchJ('/api/articles');
    reload(articles);
  });

document.getElementById("name_search_button").addEventListener('click', async () => {
    const title = document.getElementById("name_search_input").value.trim();
    const articles = await fetchJ(`/api/articles/search/title?title=${encodeURIComponent(title)}`)
    reload(articles)
})


async function loadAuthors() {
    const authors = await fetchJ('/api/authors')
    document.getElementById("author_search_select").innerHTML = '<option value="">Выберите автора</option>';
    authors.forEach(authors => {
        const option = document.createElement('option');
        option.value = authors
        option.textContent = authors
        document.getElementById("author_search_select").appendChild(option)
    })
}


document.getElementById("author_search_button").addEventListener('click', async ()=> {
    const selectedAuthor = document.getElementById("author_search_select").value
    if (!selectedAuthor){
        alert("Выберите автора")
    }
    const articles = await fetchJ(`/api/articles/search/author?author=${encodeURIComponent(selectedAuthor)}`)
    reload (articles)
})

document.addEventListener('DOMContentLoaded', () => {
    loadAuthors();
})

async function deleteArticle(id) {
  if (confirm('Вы уверены, что хотите удалить эту статью?')) {
    const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
    });
      
    if (!response.ok) {
        throw new Error('Ошибка при удалении статьи');
    }
    reload()
  }
}

document.getElementById('create_article_button').addEventListener('click', function() {
    window.location.href = '/create_article.html';

});

document.getElementById('top_articles_button').addEventListener('click', function() {
    showTopArticles();
  });
  
document.getElementById('close_top_modal').addEventListener('click', function() {
    document.getElementById('top_articles_modal').style.display = 'none';
});
  
window.addEventListener('click', function(event) {
    const modal = document.getElementById('top_articles_modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
});
  
async function showTopArticles() {
    
    const topArticles = await fetchJ('/api/articles/top');
    const container = document.getElementById('top_articles_container');
      
    container.innerHTML = '';
      
    if (topArticles.length === 0) {
        container.innerHTML = '<p>Нет статей для отображения</p>';
        return;
    }
      
    topArticles.forEach((article, index) => {
        const articleElement = document.createElement('div');
        articleElement.className = 'top-article';
        
        articleElement.innerHTML = `
          <div class="top-article-header">
            <h3 class="top-article-title">${index + 1}. ${article.title}</h3>
            <div class="top-article-stats">
              <div class="top-article-stat">
                <p>Средний рейтинг: ${article.avgRating.toFixed(1)}</p>
              </div>
              <div class="top-article-stat">
                <p>Количество рецений: ${article.commentsCount}</p>
              </div>
            </div>
          </div>
          <p>Авторы: ${article.authors.join(', ')}</p>
          <p>Дата: ${new Date(article.date).toLocaleDateString()}</p>
          <a href="/article/${article._id}" class="article-link">Перейти к статье</a>
        `;
        
        container.appendChild(articleElement);
    });
      
    document.getElementById('top_articles_modal').style.display = 'block';
}


document.addEventListener('DOMContentLoaded', function() {
    $.datepicker.regional['ru'] = {
        closeText: 'Закрыть',
        prevText: 'Предыдущий',
        nextText: 'Следующий',
        currentText: 'Сегодня',
        monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
        'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
        'Июл','Авг','Сен','Окт','Ноя','Дек'],
        dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
        dayNamesShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        weekHeader: 'Не',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['ru']);
      
    $("#start-date").datepicker();
    $("#end-date").datepicker();
      
    $("#date-search-btn").on('click', function() {
        searchArticlesByDate();
    });
});


async function searchArticlesByDate() {
    const startDate = $("#start-date").val();
    const endDate = $("#end-date").val();
    
    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите дату начала и дату окончания');
      return;
    }
    
    
    //ISO 
    const startDateObj = $.datepicker.parseDate('dd.mm.yy', startDate);
    const endDateObj = $.datepicker.parseDate('dd.mm.yy', endDate);
      
    endDateObj.setHours(23, 59, 59, 999);
      
    const startISO = startDateObj.toISOString();
    const endISO = endDateObj.toISOString();
      
    const response = await fetch(`/api/articles/by-date?start=${startISO}&end=${endISO}`);
      
    if (!response.ok) {
        throw new Error('Ошибка при поиске статей');
    }
      
    const articles = await response.json();
      
    reload(articles);
      
    const countInfo = document.createElement('div');
    countInfo.className = 'search-results-info';
    countInfo.textContent = `Найдено статей: ${articles.length}`;
      
    const existingInfo = document.querySelector('.search-results-info');
    if (existingInfo) {
        existingInfo.remove();
    }
      
    const table = document.getElementById('articles-table');
    table.parentNode.insertBefore(countInfo, table);
      
  }