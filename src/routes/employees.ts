import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employees';
import { validateCreateEmployee, validateUpdateEmployee } from '../middleware/validation';

const router = Router();

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validateCreateEmployee, createEmployee);
router.put('/:id', validateUpdateEmployee, updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
