const express = require('express');
const app = express();
app.use(express.json());

const books = [
    { id: 1, isbn: 9781119490708, title: 'AWS Certified Cloud Practitioner Study',publisher: "Wiley",date: "07/02/2019" },
    { id: 2, isbn: 9781788293723, title: 'Mastering AWS Security',publisher: "Packt Publishing",date: "10/30/2017" },
    { id: 3, isbn: 9781789806199, title: 'Machine Learning with AWS',publisher: "Packt Publishing",date: "11/02/2018" },
    { id: 4, isbn: 9781782171102, title: 'Learning Aws Opsworks',publisher: "Packt Publishing",date: "09/10/2013" },
    { id: 5, isbn: 9781789340198, title: 'AWS Lambda Quick Start Guide',publisher: "Packt Publishing",date: "06/29/2018" },
    { id: 6, isbn: 9781542885751, title: 'AWS Basics',publisher: "CreateSpace Publishing",date: "02/09/2017" },
]

//READ Request Handlers

app.get('/api/books/health', (req, res) => {
    console.log('=== GET request  at /api/books/healthcheck ===');
    res.sendFile('./healthcheck.html', { root: __dirname });
});

app.get('/api/books', (req, res) => {
    console.log('=== GET request  at /api/books ===');
    res.send(books);
});

app.get('/api/books/:id', (req, res) => {
    const book = books.find(c => c.id === parseInt(req.params.id));
    console.log('=== GET request  at /api/books/{id} ===');
    if (!book) res.status(404).send('<h2 style="font-family: Malgun Gothic; color: darkred;">Ooops... Cant find what you are looking for!</h2>');
    res.send(book);
});


//PORT ENVIRONMENT VARIABLE
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}..`));