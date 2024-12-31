import request from 'supertest';
import app from '../../app';

describe('Hello route API Test', () => {
  it('should return an 400 error if no name', async () => {
    const response = await request(app).get('/hello');
    expect(response.status).toBe(400);
  });
  it('should return 400 an if invalid name', () => {
    const name = '123';
    return request(app)
      .get(`/hello?name=${name}`)
      .expect(400);
  });
  it('should return 405 if method is not get ', () => {
    return request(app)
      .post('/hello')
      .expect(405);
  });
  it('should return "Hello John !"', async () => {
    const name = 'John';
    const response = await request(app)
      .get(`/hello?name=${name}`)
      .expect(200)
      .type('json');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Hello John !');
  });
})
