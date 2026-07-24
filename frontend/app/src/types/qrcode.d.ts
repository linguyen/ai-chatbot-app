declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>;
  const _default: {
    toDataURL: (text: string, options?: any) => Promise<string>;
  };
  export default _default;
}
