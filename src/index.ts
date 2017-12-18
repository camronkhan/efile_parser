import app from './app';

const port: string = process.env.PORT || '3000';

app.listen(port, (err: any) => err ? console.log(err) : console.log(`Server listening on port ${port}`));