declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

interface ImportMetaEnv {
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
  readonly VITE_TELEGRAM_CHAT_ID: string;
  readonly VITE_SERVER_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
