import { VisApi } from '@sl-theia/vis';

export default (api: VisApi) => {
  api.onDevCompileDone((opts) => {
    // console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.onBuildComplete((opts) => {
    // console.log('> onBuildComplete', opts.isFirstCompile);
  });
};
