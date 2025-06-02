import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        about: {
          title: string;
          subtitle: string;
          founded: string;
          global_community: string;
          what_is_pinpointd: string;
          how_it_works: string;
          how_it_works_desc: string;
          how_it_works_desc2: string;
          technology: string;
          technology_desc: string;
          key_benefits: string;
          benefit1: string;
          benefit2: string;
          benefit3: string;
          benefit4: string;
          benefit5: string;
          getting_started: string;
          getting_started_desc: string;
          key_features: string;
          features: {
            chat: {
              title: string;
              desc: string;
            };
            friends: {
              title: string;
              desc: string;
            };
            security: {
              title: string;
              desc: string;
            };
            easy_use: {
              title: string;
              desc: string;
            };
            geolocation: {
              title: string;
              desc: string;
            };
            map: {
              title: string;
              desc: string;
            };
          };
          our_story: {
            title: string;
            paragraph1: string;
            paragraph2: string;
            paragraph3: string;
          };
          team: {
            title: string;
            member1: {
              name: string;
              role: string;
              bio: string;
            };
          };
        };
        navigation: {
          map: string;
          chat: string;
          friends: string;
          about: string;
          tokens: string;
          login: string;
          register: string;
          username: string;
          change_account_settings: string;
          logout: string;
          language: string;
          change_language: string;
          navigation: string;
          saved_pinpoints: string;
        };
      };
    };
  }
} 