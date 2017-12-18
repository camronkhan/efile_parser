import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, (err) => err ? console.log(err) : console.log(`Server listening on port ${port}`));