document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('create-article-form');
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const title = document.getElementById('title').value;
      const authors = document.getElementById('authors').value.split(',').map(author => author.trim());
      const tags = document.getElementById('tags').value ? document.getElementById('tags').value.split(',').map(tag => tag.trim()) : [];
      const content = document.getElementById('content').value;
      
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            authors,
            tags,
            content,
            date: new Date()
          })
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при создании статьи');
        }
        
        window.location.href = '/';
      } catch (error) {
        console.error('Ошибка при создании статьи:', error);
        alert('Не удалось создать статью. Пожалуйста, попробуйте еще раз.');
      }
    });
  });
  