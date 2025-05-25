import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        [key: string]: string | {
          [key: string]: string | {
            [key: string]: string;
          };
        };
      };
    };
  }
} 