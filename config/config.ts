import { defineConfig } from '@sl-theia/vis';

export default defineConfig({
  chainWebpack(config) {
    config.module.rule('asset-other').test(/.otf/).type('asset/resource');
  },
  npmClient: 'pnpm',
  plugins: ['@vises/vis-plugin-cesium'],
  cesium: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NTRhMmI1NS0yZmRmLTRhMGMtOTYxNi04OTM3OGVkYTRjYjYiLCJpZCI6OTczMDAsImlhdCI6MTY1NTEwNzI1NH0.LB89i36BMZMVOmOhTJ5DkVGGbEX4RSKaXUgbDTxQkoo',
  },
});
