import { Cesium } from '@sl-theia/vis';

export const drawRectangle = (viewer: Cesium.Viewer) => {
  // {@link MaterialProperty}可以映射条纹到{@link Material}的uniforms上.
  const rectangleStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let rectangleGraphics = new Cesium.RectangleGraphics({
    coordinates: Cesium.Rectangle.fromDegrees(116.8, 36.1, 116.9, 36.2), // 最西、最南、最东、最北
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 4,
    stRotation: Cesium.Math.toRadians(45), // 一个数值属性，指定矩形纹理从北逆时针旋转
    material: rectangleStripeMaterial,
  });

  let rectangleEntity = new Cesium.Entity({
    rectangle: rectangleGraphics,
  });

  viewer.entities.add(rectangleEntity);
  viewer.zoomTo(rectangleEntity);
};

export const drawPolygon = (viewer: Cesium.Viewer) => {
  const polygonStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let polygonHierarchy = new Cesium.PolygonHierarchy( // 多边形层次结构
    Cesium.Cartesian3.fromDegreesArray([
      // 绘制多边形，经度和纬度值列表。值交替显示[经度，纬度，经度，纬度...]。
      -107.0, 27.0, -107.0, 22.0, -102.0, 23.0, -97.0, 21.0, -97.0, 25.0,
    ]),
  );

  let polygonGraphics = new Cesium.PolygonGraphics({
    hierarchy: polygonHierarchy,
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 4,
    stRotation: Cesium.Math.toRadians(45), // 一个数值属性，指定矩形纹理从北逆时针旋转
    material: polygonStripeMaterial,
  });

  let polygonEntity = new Cesium.Entity({
    polygon: polygonGraphics,
  });

  viewer.entities.add(polygonEntity);
  viewer.zoomTo(polygonEntity);
};

export const drawEllipse = (viewer: Cesium.Viewer) => {
  const ellipseStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let ellipseGraphics = new Cesium.EllipseGraphics({
    semiMinorAxis: 300000.0, // 指定半短轴的数字属性。
    semiMajorAxis: 500000.0, // 指定半长轴的数值属性。
    rotation: Cesium.Math.toRadians(-40.0), // 一个数字属性，指定椭圆从北方逆时针旋转。
    outline: true, // 一个布尔属性，指定是否勾勒出椭圆。
    outlineColor: Cesium.Color.WHITE, // 一个属性，指定轮廓的 颜色
    outlineWidth: 4, // 一个数字属性，指定轮廓的宽度。
    stRotation: Cesium.Math.toRadians(22), //  一个数字属性，指定椭圆纹理从北方逆时针旋转。
    material: ellipseStripeMaterial,
  });

  let ellipseEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(116.8, 36.1),
    ellipse: ellipseGraphics,
  });

  viewer.entities.add(ellipseEntity);
  viewer.zoomTo(ellipseEntity);
};

export const drawRound = (viewer: Cesium.Viewer) => {
  const roundStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let roundGraphics = new Cesium.EllipseGraphics({
    semiMinorAxis: 250000.0,
    semiMajorAxis: 250000.0,
    rotation: Cesium.Math.toRadians(-40.0),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 4,
    stRotation: Cesium.Math.toRadians(90),
    material: roundStripeMaterial,
  });

  let roundEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-72.0, 25.0),
    ellipse: roundGraphics,
  });

  viewer.entities.add(roundEntity);
  viewer.zoomTo(roundEntity);
};
