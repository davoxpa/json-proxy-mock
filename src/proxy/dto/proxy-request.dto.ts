export class ProxyRequestDto {
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: any;
  method: string;
}
