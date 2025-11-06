import { sign } from 'jsonwebtoken';
import request from 'supertest';
import app from '../index';

export const getAuthToken = (userId: string): string => {
  return sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '15m'
  });
};

export const testRequest = () => request(app);

export const authRequest = (token: string) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};