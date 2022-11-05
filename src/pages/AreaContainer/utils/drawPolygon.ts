import { Cesium } from '@sl-theia/vis';

export function drawPolygon({
  viewer,
  data,
  color,
  opts,
}: {
  viewer: Cesium.Viewer;
  data: number[];
  color: Cesium.Color;
  opts?: Cesium.Entity.ConstructorOptions;
}) {
  return viewer.entities.add({
    polygon: {
      // 获取指定属性（positions，holes（图形内需要挖空的区域））
      hierarchy: {
        positions: Cesium.Cartesian3.fromDegreesArray(data),
        holes: [],
      },
      // 边框
      outline: true,
      // 边框颜色
      outlineColor: Cesium.Color.WHITE,
      // 边框尺寸
      outlineWidth: 3,
      // 填充的颜色，withAlpha透明度
      material: color,
      // 是否被提供的材质填充
      fill: true,
      // 恒定高度
      height: 20,
      // 显示在距相机的距离处的属性，多少区间内是可以显示的
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        10000000,
      ),
      // 是否显示
      show: true,
      // 顺序,仅当`clampToGround`为true并且支持地形上的折线时才有效。
      zIndex: 10,
      ...opts,
    },
  });
}
