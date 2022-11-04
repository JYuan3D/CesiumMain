import { defineConfig } from '@sl-theia/vis';

export default defineConfig({
  chainWebpack(config) {
    config.module.rule('asset-other').test(/.otf/).type('asset/resource');
  },
  npmClient: 'pnpm',
  plugins: ['@vises/vis-plugin-cesium'],
  cesium: {
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkOGU4N2NlMC1kNGIyLTQ1MTEtOGZhYS01ZTJkZTExYmM3NTIiLCJpZCI6OTk1ODMsImlhdCI6MTY1NjU3NTY4NH0.Zk4pIkgdhfRGyMhB1RB45RR04joFp3ERUtzVsOzq8iM
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NTkyNGVkMi04YTg1LTQ4YzktYTI3MS05NTNiZWM3MTg2ZGEiLCJpZCI6MjU5LCJpYXQiOjE2NjQ4MTQyODl9.mGZTN2DeKa-mQnQr6BInj8GzOK6wq3dZMwcyU0iwInA',
  },
  proxy: {
    '/tiles': {
      target: 'http://10.253.102.69',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/tiles': '',
      },
    },
    '/map': {
      target: 'http://10.253.102.70',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/map': '',
      },
    },
  },
});
