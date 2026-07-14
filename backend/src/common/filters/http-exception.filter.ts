import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
      if (Array.isArray(message)) {
        errors = message;
        message = 'Validation failed';
      }
    } else if (exception?.status) {
      status = exception.status;
      message = exception.message || message;
    } else if (exception?.message) {
      message = exception.message;
    }

    console.error(`[ERROR] ${exception?.message}`, exception?.stack);

    response.status(status).json({
      success: false,
      message,
      errors,
    });
  }
}
