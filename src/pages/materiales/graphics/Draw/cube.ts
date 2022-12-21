import { Cesium } from '@sl-theia/vis';

export const drawBoxCube = (viewer: Cesium.Viewer) => {
  const boxMaterial = Cesium.Color.fromRandom({ alpha: 0.5 });

  let boxGraphics = new Cesium.BoxGraphics({
    dimensions: new Cesium.Cartesian3(90000.0, 90000.0, 90000.0), // 方面
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    material: boxMaterial,
  });
  let boxEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-106.0, 45.0, 0),
    box: boxGraphics,
  });
  viewer.entities.add(boxEntity);
  viewer.zoomTo(boxEntity);
};

export const drawRectangleCube = (viewer: Cesium.Viewer) => {
  // {@link MaterialProperty}可以映射条纹到{@link Material}的uniforms上.
  const rectangleStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let rectangleCoordinates = Cesium.Rectangle.fromDegrees(
    -118.0,
    38.0,
    -116.0,
    40.0,
  );

  let rectangleGraphics = new Cesium.RectangleGraphics({
    coordinates: rectangleCoordinates,
    extrudedHeight: 500000.0,
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 10,
    stRotation: Cesium.Math.toRadians(0),
    // material: Cesium.Color.fromRandom({ alpha: 1.0 }),
    material: rectangleStripeMaterial,
  });

  let rectangleEntity = new Cesium.Entity({
    rectangle: rectangleGraphics,
  });

  viewer.entities.add(rectangleEntity);
  viewer.zoomTo(rectangleEntity);
};

export const drawEllipseCube = (viewer: Cesium.Viewer) => {
  const ellipseStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let ellipseGraphics = new Cesium.EllipseGraphics({
    semiMinorAxis: 100000.0, // 指定半短轴的数字属性。
    semiMajorAxis: 200000.0, // 指定半长轴的数值属性。
    height: 0,
    extrudedHeight: 200000.0,
    rotation: Cesium.Math.toRadians(-40.0), // 一个数字属性，指定椭圆从北方逆时针旋转。
    outline: true, // 一个布尔属性，指定是否勾勒出椭圆。
    outlineColor: Cesium.Color.WHITE, // 一个属性，指定轮廓的 颜色
    outlineWidth: 4, // 一个数字属性，指定轮廓的宽度。
    stRotation: Cesium.Math.toRadians(22), //  一个数字属性，指定椭圆纹理从北方逆时针旋转。
    material: ellipseStripeMaterial,
  });

  let ellipseEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-117.0, 35.0),
    ellipse: ellipseGraphics,
  });

  viewer.entities.add(ellipseEntity);
  viewer.zoomTo(ellipseEntity);
};

export const drawPolygonCube = (viewer: Cesium.Viewer) => {
  const polygonStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let polygonHierarchy = new Cesium.PolygonHierarchy( // 多边形层次结构
    Cesium.Cartesian3.fromDegreesArray([
      // 绘制多边形，经度和纬度值列表。值交替显示[经度，纬度，经度，纬度...]。
      -118.0, 30.0, -115.0, 30.0, -117.1, 31.1, -118.0, 33.0,
    ]),
  );

  let polygonGraphics = new Cesium.PolygonGraphics({
    hierarchy: polygonHierarchy,
    height: 0,
    extrudedHeight: 700000.0,
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

export const drawRoundCube = (viewer: Cesium.Viewer) => {
  const roundStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let roundCylinderGraphics = new Cesium.CylinderGraphics({
    length: 200000.0,
    topRadius: 150000.0, // 一个数字属性，指定圆柱顶部的半径。
    bottomRadius: 150000.0, // 一个数字属性，指定圆柱体底部的半径。
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 4,
    material: roundStripeMaterial,
  });

  let roundEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-70.0, 45.0, 100000.0),
    cylinder: roundCylinderGraphics
  });

  viewer.entities.add(roundEntity);
  viewer.zoomTo(roundEntity);
}

export const drawRadiiEllipseCub = (viewer: Cesium.Viewer) => {
  const radiiEllipseMaterial = Cesium.Color.fromRandom({ alpha: 0.5 });

  let radiiEllipsoidGraphics = new Cesium.EllipsoidGraphics({
    radii: new Cesium.Cartesian3(67500.0, 67500.0, 67500.0),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    material: radiiEllipseMaterial,
  });

  let radiiEllipsoidEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-98.0, 45.0, 0),
    ellipsoid: radiiEllipsoidGraphics,
  });

  viewer.entities.add(radiiEllipsoidEntity);
  viewer.zoomTo(radiiEllipsoidEntity);
};

export const drawCone = (viewer: Cesium.Viewer) => {
  const coneStripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor: Cesium.Color.WHITE.withAlpha(0.5), // 指定第一个Color的属性
    oddColor: Cesium.Color.BLUE.withAlpha(0.5), // 指定第二个Color的属性
    repeat: 5.0, // 一个数字属性，指定条纹重复的次数。
  });

  let coneGraphics = new Cesium.CylinderGraphics({
    length: 200000.0,
    topRadius: 0.0, // 一个数字属性，指定圆柱顶部的半径。
    bottomRadius: 150000.0, // 一个数字属性，指定圆柱体底部的半径。
    outline: true,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 4,
    material: coneStripeMaterial,
  });

  let coneEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-70.0, 40.0, 0.0),
    cylinder: coneGraphics,
  });

  viewer.entities.add(coneEntity);
  viewer.zoomTo(coneEntity);
};
