import { CesiumHeatmap, HeatmapPoint } from './source';

export const defaultDataValue = [10, 500];
export const defaultOpacityValue = [0, 1];
export const defaultRadius = 20;

export const setHeatmap = (viewer: any, cb?: Function, radiusCb?: Function) => {
  const points: HeatmapPoint[] = [];
  fetch('./static/geojson/busstop2016.geojson', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    response.json().then((data) => {
      if (data)
        data.features.forEach((feature: any) => {
          const lon = feature.geometry.coordinates[0];
          const lat = feature.geometry.coordinates[1];
          points.push({
            x: lon - 0.05,
            y: lat - 0.04,
            value: 100 * Math.random(),
          });
        });
      const cesiumHeatmap = new CesiumHeatmap(viewer, {
        zoomToLayer: true,
        noLisenerCamera: true,
        points,
        heatmapDataOptions: {
          max: defaultDataValue[1],
          min: defaultDataValue[0],
        },
        heatmapOptions: {
          radius: 20,
          maxOpacity: defaultOpacityValue[1],
          minOpacity: defaultOpacityValue[0],
        },
        onRadiusChange: (radius: number) => {
          radiusCb?.(radius);
        },
      });
      cb?.(cesiumHeatmap);
    });
  });
};
