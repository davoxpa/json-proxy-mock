export interface IMemoryJsonInput {
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: any;
  method: string;
}

export interface IMemoryJsonOutput {
  headers: Record<string, string>;
  body: any;
  statusCode: number;
}

export interface IMemoryJson {
  id: string;
  input: IMemoryJsonInput;
  output: IMemoryJsonOutput;
  bypass: boolean;
  delay: number;
  createdAt: Date;
  updatedAt: Date;
}
