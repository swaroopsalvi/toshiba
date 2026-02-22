import request from 'supertest';
import app from '../src/app';
import { clearEmployees } from '../src/controllers/employees';

beforeEach(() => {
  clearEmployees();
});

describe('GET /api/employees', () => {
  it('returns an empty array when no employees exist', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns all employees', async () => {
    await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters employees by department', async () => {
    await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    await request(app).post('/api/employees').send({
      name: 'Bob',
      email: 'bob@example.com',
      department: 'Marketing',
      position: 'Manager',
      salary: 80000,
    });

    const res = await request(app).get('/api/employees?department=Engineering');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice');
  });

  it('returns empty array when no employees match the department filter', async () => {
    const res = await request(app).get('/api/employees?department=Finance');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/employees/:id', () => {
  it('returns the employee when found', async () => {
    const createRes = await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const id = createRes.body.data.id as string;

    const res = await request(app).get(`/api/employees/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.name).toBe('Alice');
  });

  it('returns 404 when employee is not found', async () => {
    const res = await request(app).get('/api/employees/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });
});

describe('POST /api/employees', () => {
  const validPayload = {
    name: 'Alice',
    email: 'alice@example.com',
    department: 'Engineering',
    position: 'Developer',
    salary: 90000,
  };

  it('creates an employee and returns 201', async () => {
    const res = await request(app).post('/api/employees').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const { name: _name, ...payload } = validPayload;
    const res = await request(app).post('/api/employees').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining('name')]));
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining('email')]));
  });

  it('returns 400 when salary is not positive', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, salary: -100 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining('salary')]));
  });

  it('returns 400 when email is duplicate', async () => {
    await request(app).post('/api/employees').send(validPayload);
    const res = await request(app).post('/api/employees').send(validPayload);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/employees').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(5);
  });
});

describe('PUT /api/employees/:id', () => {
  it('updates an employee and returns 200', async () => {
    const createRes = await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const id = createRes.body.data.id as string;

    const res = await request(app)
      .put(`/api/employees/${id}`)
      .send({ salary: 100000, position: 'Senior Developer' });

    expect(res.status).toBe(200);
    expect(res.body.data.salary).toBe(100000);
    expect(res.body.data.position).toBe('Senior Developer');
    expect(res.body.data.name).toBe('Alice'); // unchanged fields preserved
  });

  it('returns 404 when employee is not found', async () => {
    const res = await request(app)
      .put('/api/employees/nonexistent-id')
      .send({ salary: 100000 });
    expect(res.status).toBe(404);
  });

  it('returns 400 when body is empty', async () => {
    const createRes = await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const id = createRes.body.data.id as string;

    const res = await request(app).put(`/api/employees/${id}`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when updating with a duplicate email', async () => {
    await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const bobRes = await request(app).post('/api/employees').send({
      name: 'Bob',
      email: 'bob@example.com',
      department: 'Marketing',
      position: 'Manager',
      salary: 80000,
    });
    const bobId = bobRes.body.data.id as string;

    const res = await request(app)
      .put(`/api/employees/${bobId}`)
      .send({ email: 'alice@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });
});

describe('DELETE /api/employees/:id', () => {
  it('deletes an employee and returns 204', async () => {
    const createRes = await request(app).post('/api/employees').send({
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 90000,
    });
    const id = createRes.body.data.id as string;

    const res = await request(app).delete(`/api/employees/${id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/employees/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 when employee is not found', async () => {
    const res = await request(app).delete('/api/employees/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('Health check', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown routes', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
