import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.toffee.livetv',
  appName: 'SM TV',
  webDir: 'dist',
  server: {
    allowNavigation: ['*']
  }
};

export default config;
