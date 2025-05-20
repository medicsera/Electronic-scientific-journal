require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/articles");
const app = express();
const port = process.env.port

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.mongo_url).then(() => console.log("Connected"));

app.get('/api/articles', async (req, res) => {
    const articles = await Article.find();
    res.json(articles);
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

app.get('/api/authors', async (req, res) => {
      const articles = await Article.find();
      const authorsSet = new Set();
      articles.forEach(article => {
        if (article.authors && Array.isArray(article.authors)) {
          article.authors.forEach(author => {
            if (author) authorsSet.add(author);
          });
        }
      });
      const authors = Array.from(authorsSet).sort();
      res.json(authors);
  });
  

app.get('/api/articles/search/title', async (req, res) => {
    const title = req.query.title || '';
    const articles = await Article.find({ title: { $regex: title, $options: 'i' } });
    res.json(articles);
});

app.get('/api/articles/search/author', async (req, res) => {
      const author = req.query.author || '';
      const articles = await Article.find({ authors: author });
      res.json(articles);
  });

app.get('/api/article/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.json(article);
});

app.get('/article/:id', (req,res) => {
    res.sendFile(__dirname + '/public/article.html');
});

app.delete('/api/articles/:id', async (req, res) => {
    
    const result = await Article.findByIdAndDelete(req.params.id);
      
    if (!result) {
        return res.status(404).json({ error: 'Статья не найдена' });
    }
    res.json({ message: 'Статья успешно удалена' });
});

app.post('/api/articles', async (req, res) => {
    try {
      const { title, authors, tags, content, date } = req.body;
      
      if (!title || !authors || !content) {
        return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
      }
      
      const newArticle = new Article({
        title,
        authors,
        tags: tags || [],
        content,
        date: date || new Date(),
        reviews: []
      });
      
      const savedArticle = await newArticle.save();
      res.status(201).json(savedArticle);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
});
  
app.get('/api/articles/top', async (req, res) => {
    const articles = await Article.find();
      
    const articlesWithRating = articles.map(article => {
        if (!article.reviews || article.reviews.length === 0) {
          return {
            _id: article._id,
            title: article.title,
            authors: article.authors,
            date: article.date,
            commentsCount: 0,
            avgRating: 0
          };
        }
        
        const totalRating = article.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const avgRating = totalRating / article.reviews.length;
        
        return {
          _id: article._id,
          title: article.title,
          authors: article.authors,
          date: article.date,
          commentsCount: article.reviews.length,
          avgRating: avgRating
        };
      });
      
    articlesWithRating.sort((a, b) => {
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        return b.commentsCount - a.commentsCount;
    });
      
    res.json(articlesWithRating.slice(0, 5));
});


app.get('/api/articles/by-date', async (req, res) => {
    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);
      
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Неверный формат даты' });
    }
      
    const articles = await Article.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
    }).sort({ date: -1 });
      
    res.json(articles);
});