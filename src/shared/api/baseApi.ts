import axios, { CreateAxiosDefaults } from 'axios';

const defaultOptions: CreateAxiosDefaults = {};

const generateAxiosInstance = () => {
  const instance = axios.create(defaultOptions);
  return instance;
};

/**
 * @description 토큰 X
 */
const api = generateAxiosInstance();

export { api, generateAxiosInstance };
