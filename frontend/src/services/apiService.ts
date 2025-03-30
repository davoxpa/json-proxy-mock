import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000/memory-json';

export interface IMemoryJson {
  id?: string;
  input: {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string[]>;
    body: Record<string, unknown>;
  };
  output: {
    headers: Record<string, string>;
    body: Record<string, unknown>;
    statusCode: number;
  };
  bypass: boolean;
  delay: number;
  createdAt?: string;
  updatedAt?: string;
}

const handleError = (error: AxiosError) => {
  if (error.code === 'ECONNREFUSED') {
    throw new Error('Impossibile connettersi al server. Assicurati che il backend sia in esecuzione.');
  }
  throw error;
};

export const apiService = {
  async getAll(): Promise<IMemoryJson[]> {
    try {
      const response = await axios.get<IMemoryJson[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      return [];
    }
  },

  async getById(id: string): Promise<IMemoryJson | null> {
    try {
      const response = await axios.get<IMemoryJson>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      return null;
    }
  },

  async create(data: Omit<IMemoryJson, 'id' | 'createdAt' | 'updatedAt'>): Promise<IMemoryJson> {
    try {
      const response = await axios.post<IMemoryJson>(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  async update(hash: string, data: Partial<IMemoryJson>): Promise<IMemoryJson> {
    try {
      const response = await axios.put<IMemoryJson>(`${API_BASE_URL}/${hash}`, data);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  async delete(hash: string): Promise<string> {
    try {
      await axios.delete(`${API_BASE_URL}/${hash}`);
      return hash;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  }
}; 