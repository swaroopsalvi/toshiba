export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  statusCode: number;
}
