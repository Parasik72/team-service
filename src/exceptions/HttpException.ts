export class HttpException {
    constructor(public statusCode: number, public message: string){}
}