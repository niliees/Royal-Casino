export {};

declare global {
  interface Window {
    admin?: () => void;
  }
}
