import { Cesium } from '@sl-theia/vis';

export const drawLine = (viewer: Cesium.Viewer) => {
  // 绘制一道发光的线
  let positions = [];
  for (let i = 0; i < 40; ++i) {
    positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 15.0));
  }
  let materialProperty = new Cesium.PolylineGlowMaterialProperty({
    color: Cesium.Color.DEEPSKYBLUE,
    glowPower: 0.25,
  });
  let linePolylineGraphics = new Cesium.PolylineGraphics({
    positions: positions,
    width: 10.0,
    material: materialProperty,
  });
  let linePolylineEntity = new Cesium.Entity({polyline: linePolylineGraphics})

  viewer.entities.add(linePolylineEntity);
  viewer.zoomTo(linePolylineEntity)
};