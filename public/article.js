document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID статьи из URL
    const articleId = window.location.pathname.split('/').pop();
    
    try {
      // Запрашиваем данные статьи
      const response = await fetch(`/api/article/${articleId}`);
      
      if (!response.ok) {
        throw new Error('Статья не найдена');
      }
      
      const article = await response.json();
      
      // Заполняем страницу данными
      document.getElementById('article-title').textContent = article.title;
      document.getElementById('article-authors').textContent = article.authors.join(', ');
      document.getElementById('article-date').textContent = new Date(article.date).toLocaleDateString();
      document.getElementById('article-tags').textContent = article.tags.join(', ');
      document.getElementById('article-content').textContent = article.content;
      
      // Отображаем рецензии
      const reviewsContainer = document.getElementById('reviews-container');
      
      if (article.reviews && article.reviews.length > 0) {
        article.reviews.forEach(review => {
          const reviewElement = document.createElement('div');
          reviewElement.className = 'review';
          reviewElement.innerHTML = `
            <h3>${review.name}</h3>
            <p>${review.text}</p>
            <p class="rating">Оценка: ${review.rating}/10</p>
          `;
          reviewsContainer.appendChild(reviewElement);
        });
      } else {
        reviewsContainer.innerHTML = '<p>Рецензий пока нет</p>';
      }
    } catch (error) {
      console.error('Ошибка при загрузке статьи:', error);
      document.getElementById('article-title').textContent = 'Ошибка при загрузке статьи';
    }
  });
  