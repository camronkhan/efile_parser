import * as multer from 'multer';
import { PDFJSStatic } from 'pdfjs-dist';

const target: string = "Endorsement #";

export default class Parser {
    
    public constructor(private uploadStorage: any, private pdfjsParser: PDFJSStatic) { }

    public getUpload = (): any => this.uploadStorage;

    public async getEndorsements(data: any): Promise<any> {
        let contentPerPage: Array<any> = await this.getContentPerPage(data);
        let endorsementContent: any = this.filterContentByTarget(contentPerPage, target);
        return endorsementContent;
    }

    private async getContentPerPage(data: any): Promise<Array<string>> {
        let contentPerPage: Array<string> = [];
        let pdf: any = await this.pdfjsParser.getDocument(data);
        let numPages: number = parseInt(pdf.numPages);
        for (let i = 1; i <= numPages; i++) {
            let currentPage = await pdf.getPage(i);
            let currentPageContent = await currentPage.getTextContent();
            let content: string = currentPageContent.items
                .filter((item: any) => item.str.trim() !== '')
                .map((item: any) => item.str)
                .reduce((acc: string, cur: string) => acc + ' ' + cur);
                contentPerPage.push(content);
        }
        return contentPerPage;
    }

    private filterContentByTarget = (content: Array<string>, target: string): Array<string> =>
        content.filter((pageContent: string) => pageContent.indexOf(target) !== -1);
}