import { Request, Response } from "express";
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
declare const _default: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export default _default;
//# sourceMappingURL=uploadController.d.ts.map