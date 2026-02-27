import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (schema: ValidationChain[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const rule of schema) {
      await rule.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array().map((err) => ({
          field: err.type === 'field' ? err.path : err.type,
          message: err.msg,
        })),
      });
      return;
    }
    next();
  };
};
