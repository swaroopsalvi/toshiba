import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee';
import { HttpError } from '../middleware/errorHandler';

// In-memory data store
const employees: Map<string, Employee> = new Map();

export function getAllEmployees(req: Request, res: Response): void {
  const { department } = req.query;
  let result = Array.from(employees.values());

  if (department && typeof department === 'string') {
    result = result.filter(
      (emp) => emp.department.toLowerCase() === department.toLowerCase()
    );
  }

  res.status(200).json({ data: result });
}

export function getEmployeeById(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  const employee = employees.get(id);

  if (!employee) {
    return next(new HttpError(`Employee with id '${id}' not found`, 404));
  }

  res.status(200).json({ data: employee });
}

export function createEmployee(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as CreateEmployeeDto;

  // Enforce unique email
  const emailExists = Array.from(employees.values()).some(
    (emp) => emp.email.toLowerCase() === body.email.toLowerCase()
  );
  if (emailExists) {
    return next(new HttpError(`An employee with email '${body.email}' already exists`, 400));
  }

  const newEmployee: Employee = {
    id: uuidv4(),
    name: body.name.trim(),
    email: body.email.toLowerCase().trim(),
    department: body.department.trim(),
    position: body.position.trim(),
    salary: body.salary,
    createdAt: new Date().toISOString(),
  };

  employees.set(newEmployee.id, newEmployee);
  res.status(201).json({ data: newEmployee });
}

export function updateEmployee(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  const existing = employees.get(id);

  if (!existing) {
    return next(new HttpError(`Employee with id '${id}' not found`, 404));
  }

  const body = req.body as UpdateEmployeeDto;

  // Enforce unique email if email is being updated
  if (body.email) {
    const emailExists = Array.from(employees.values()).some(
      (emp) => emp.id !== id && emp.email.toLowerCase() === body.email!.toLowerCase()
    );
    if (emailExists) {
      return next(new HttpError(`An employee with email '${body.email}' already exists`, 400));
    }
  }

  const updated: Employee = {
    ...existing,
    ...(body.name !== undefined && { name: body.name.trim() }),
    ...(body.email !== undefined && { email: body.email.toLowerCase().trim() }),
    ...(body.department !== undefined && { department: body.department.trim() }),
    ...(body.position !== undefined && { position: body.position.trim() }),
    ...(body.salary !== undefined && { salary: body.salary }),
  };

  employees.set(id, updated);
  res.status(200).json({ data: updated });
}

export function deleteEmployee(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!employees.has(id)) {
    return next(new HttpError(`Employee with id '${id}' not found`, 404));
  }

  employees.delete(id);
  res.status(204).send();
}

// Exposed for testing — allows resetting the in-memory store between tests
export function clearEmployees(): void {
  employees.clear();
}
