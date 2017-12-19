import * as multer from 'multer';
import { PDFJSStatic } from 'pdfjs-dist';

export default class Parser {
    
    public constructor(private uploadStorage: any, private pdfjsParser: PDFJSStatic) { }

    public getUploadStorage(): any {
        return this.uploadStorage;
    }

    public async getEndorsements(data: any): Promise<any> {
        let pdf: any = await this.parseBufferToPdf(data);
        let contentPerPage: Array<any> = await this.filterContentPerPage(pdf);
        let endorsementContent: Array<string> = this.filterAndAggregateEndorsements(contentPerPage);
        return endorsementContent;
    }

    private async parseBufferToPdf(buffer: any): Promise<any> {
        return await this.pdfjsParser.getDocument(buffer);
    }

    private async filterContentPerPage(pdf: any): Promise<Array<string>> {
        let contentPerPage: Array<string> = [];
        let numPages: number = parseInt(pdf.numPages);
        for (let i = 1; i <= numPages; i++) {  // numPages has 1-based index
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

    private filterAndAggregateEndorsements(fullTextContent: Array<string>): Array<string> {
        let endorsements: Array<string> = [];
        let target: string = 'Endorsement #';
        let fullTextContentIndex: number = 0;
        while (fullTextContentIndex < fullTextContent.length) {
            // traverse each page in document
            if (fullTextContent[fullTextContentIndex].indexOf(target) === -1) {
                // if no match is found on current page, move to next page
                fullTextContentIndex++;
            } else {
                // if match found on current page,
                // extract text and check subsequent pages to see if they are part of current endorsement
                let currentEndorsementText: string = fullTextContent[fullTextContentIndex];
                let currentEndorsementPageNumber: number = 1;
                while (((fullTextContentIndex + currentEndorsementPageNumber) < fullTextContent.length) &&
                        (fullTextContent[fullTextContentIndex + currentEndorsementPageNumber].indexOf(target) === -1)) {
                            // ASSUMPTIONS:
                            // (1) Endorsements always come at the end of the document; no other sections follow endorsements
                            // (2) The target string is only present in the first page of a multipage endorsement
                            currentEndorsementText = currentEndorsementText + ' ' + fullTextContent[fullTextContentIndex + currentEndorsementPageNumber];
                            currentEndorsementPageNumber++;
                }
                endorsements.push(currentEndorsementText);
                fullTextContentIndex += currentEndorsementPageNumber;
            }
        }
        return endorsements;
    }
}