const express = require('express');
const app = express();
app.use(express.json());

const authors = [
    { id: 1, name: 'Mark Wilkins', book: "Learning Amazon Web Services (AWS)"},
    { id: 2, name: 'Steve Morad', book: "AWS Certified Advanced Networking"},
    { id: 3, name: 'Gojko Adzic', book: "Running Serverless"},
    { id: 4, name: 'Giuseppe Borgese', book: "Effective DevOps with AWS"},
    { id: 5, name: 'Vikas Aggarwal', book: "Ansible 2 Cloud Automation Cookbook"},
    { id: 6, name: 'Ajit Pratap Kundan', book: "VMware Cross-Cloud Architecture"},
]

//READ Request Handlers

app.get('/', (req, res) => {
    console.log('=== GET request  at / ===');
    res.sendFile('./healthcheck.html', { root: __dirname });
});

app.get('/api/authors/health', (req, res) => {
    console.log('=== GET request  at /api/authors/healthcheck ===');
    res.sendFile('./healthcheck.html', { root: __dirname });
});

app.get('/api/authors', (req, res) => {
    console.log('=== GET request  at /api/authors ===');
    res.send(authors);
});

app.get('/api/authors/:id', (req, res) => {
    const author = authors.find(c => c.id === parseInt(req.params.id));
    console.log('=== GET request  at /api/authors/{id} ===');
    if (!author) res.status(404).send('<h2 style="font-family: Malgun Gothic; color: darkred;">Ooops... Cant find what you are looking for!</h2>');
    res.send(author);
});


//PORT ENVIRONMENT VARIABLE
// const port = process.env.PORT || 80;
const port = 80;
app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}..`));