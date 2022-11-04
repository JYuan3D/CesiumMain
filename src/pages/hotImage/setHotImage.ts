import { CesiumHeatmap, HeatmapPoint } from 'cesium-heatmap-es6';

export const hotImage = (viewer: any, data: number[][]) => {
  const defaultDataValue = [10000, 5000000];
  const defaultOpacityValue = [0.5, 1];
  const points: HeatmapPoint[] = [];

  if (data)
    data.forEach(function (feature: any) {
      const lon = feature[0];
      const lat = feature[1];
      points.push({
        x: lon,
        y: lat,
        value: 10000 * Math.random(),
      });
    });
  let cesiumHeatmap = new CesiumHeatmap(viewer, {
    zoomToLayer: true,
    points,
    heatmapDataOptions: { max: defaultDataValue[1], min: defaultDataValue[0] },
    heatmapOptions: {
      maxOpacity: defaultOpacityValue[1],
      minOpacity: defaultOpacityValue[0],
    },
  });
};
