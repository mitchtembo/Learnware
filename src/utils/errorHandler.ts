export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any): AppError {
    // Handle API errors
    if (error.response) {
      return {
        code: 'API_ERROR',
        message: error.response.data?.message || 'An API error occurred',
        details: error.response.data
      };
    }

    // Handle network errors
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'A network error occurred. Please check your connection.',
        details: error.request
      };
    }

    // Handle Gemini API specific errors
    if (error.message?.includes('Gemini')) {
      return {
        code: 'GEMINI_API_ERROR',
        message: 'An error occurred with the Gemini API',
        details: error
      };
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.errors
      };
    }

    // Handle authentication errors
    if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication failed. Please check your API key.',
        details: error
      };
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error
    };
  }

  static isAuthError(error: AppError): boolean {
    return error.code === 'AUTH_ERROR';
  }

  static isNetworkError(error: AppError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  static isValidationError(error: AppError): boolean {
    return error.code === 'VALIDATION_ERROR';
  }

  static logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, error.details);
    
    // Here you could add additional logging logic like sending to a logging service
  }
} 