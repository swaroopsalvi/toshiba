import { Request, Response, NextFunction } from 'express';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateCreateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Partial<CreateEmployeeDto>;
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }
  if (!body.email || typeof body.email !== 'string' || !isValidEmail(body.email)) {
    errors.push('email is required and must be a valid email address');
  }
  if (!body.department || typeof body.department !== 'string' || body.department.trim() === '') {
    errors.push('department is required and must be a non-empty string');
  }
  if (!body.position || typeof body.position !== 'string' || body.position.trim() === '') {
    errors.push('position is required and must be a non-empty string');
  }
  if (body.salary === undefined || body.salary === null) {
    errors.push('salary is required');
  } else if (typeof body.salary !== 'number' || isNaN(body.salary) || body.salary <= 0) {
    errors.push('salary must be a positive number');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}

export function validateUpdateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Partial<UpdateEmployeeDto>;
  const errors: string[] = [];

  if (Object.keys(body).length === 0) {
    res.status(400).json({ errors: ['Request body must contain at least one field to update'] });
    return;
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
    errors.push('name must be a non-empty string');
  }
  if (body.email !== undefined && (typeof body.email !== 'string' || !isValidEmail(body.email))) {
    errors.push('email must be a valid email address');
  }
  if (body.department !== undefined && (typeof body.department !== 'string' || body.department.trim() === '')) {
    errors.push('department must be a non-empty string');
  }
  if (body.position !== undefined && (typeof body.position !== 'string' || body.position.trim() === '')) {
    errors.push('position must be a non-empty string');
  }
  if (body.salary !== undefined && (typeof body.salary !== 'number' || isNaN(body.salary) || body.salary <= 0)) {
    errors.push('salary must be a positive number');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}
