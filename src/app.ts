import * as express from 'express';
import * as multer from 'multer';
import Parser from './parser';
import { PDFJSStatic } from 'pdfjs-dist';

const pdfjs: PDFJSStatic = require('pdfjs-dist');

class App {
    public express: any;

    public constructor(private parser: Parser) {
        this.express = express();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        const router = express.Router();
        
        router.get('/', (req: any, res: any) => res.json({ message: 'Hello world!' }));
        this.express.use('/', router);

        router.post('/upload', this.parser.getUpload(), async (req: any, res: any) => {
            try {
                let content = await this.parser.getEndorsements(req.file.buffer);
                res.json({ length: content.length, content: content });
            } catch(err) {
                console.log(err);
            }
        });
    }
}

export default new App(new Parser(multer({ storage: multer.memoryStorage() }).single('pdf'), pdfjs)).express;
