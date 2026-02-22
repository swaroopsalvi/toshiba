export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  createdAt: string;
}

export type CreateEmployeeDto = Omit<Employee, 'id' | 'createdAt'>;

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
