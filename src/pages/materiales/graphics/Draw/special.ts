import { Cesium } from '@sl-theia/vis';

// 绘制墙
export const drawWall = (viewer: Cesium.Viewer) => {
  let wallMaterial = Cesium.Color.fromRandom({ alpha: 0.7 });
  let wallGraphics = new Cesium.WallGraphics({
    positions: Cesium.Cartesian3.fromDegreesArray([
      -95.0, 50.0, -85.0, 50.0, -75.0, 50.0,
    ]),
    maximumHeights: [500000, 1000000, 500000],
    minimumHeights: [0, 500000, 0],
    outline: true,
    outlineColor: Cesium.Color.LIGHTGRAY,
    outlineWidth: 4,
    material: wallMaterial,
  });
  let wallEntity = new Cesium.Entity({
    wall: wallGraphics,
  });
  viewer.entities.add(wallEntity);
  viewer.zoomTo(wallEntity);
};

// 绘制回字
export const drawHuiWord = (viewer: Cesium.Viewer) => {
  let huiWordMaterial = Cesium.Color.fromRandom({ alpha: 0.7 });
  let positions_1 = Cesium.Cartesian3.fromDegreesArray([
    -109.0, 30.0, -95.0, 30.0, -95.0, 40.0, -109.0, 40.0,
  ]);
  let positions_2 = Cesium.Cartesian3.fromDegreesArray([
    -107.0, 31.0, -107.0, 39.0, -97.0, 39.0, -97.0, 31.0,
  ]);
  let positions_3 = Cesium.Cartesian3.fromDegreesArray([
    -105.0, 33.0, -99.0, 33.0, -99.0, 37.0, -105.0, 37.0,
  ]);
  let positions_4 = Cesium.Cartesian3.fromDegreesArray([
    -103.0, 34.0, -101.0, 34.0, -101.0, 36.0, -103.0, 36.0,
  ]);
  let huiWordPolygonHierarchy = new Cesium.PolygonHierarchy(positions_1, [
    {
      positions: positions_2,
      holes: [
        {
          positions: positions_3,
          holes: [
            {
              positions: positions_4,
              holes: [],
            },
          ],
        },
      ],
    },
  ]);
  let huiWordPolygonGraphics = new Cesium.PolygonGraphics({
    hierarchy: huiWordPolygonHierarchy,
    material: huiWordMaterial,
  });
  let huiWordEntity = new Cesium.Entity({
    polygon: huiWordPolygonGraphics,
  });
  viewer.entities.add(huiWordEntity);
  viewer.zoomTo(huiWordEntity);
};

// 绘制立方体，扭转一定角度的
export const drawCubeWithRotation = (viewer: Cesium.Viewer) => {
  let cubeWithRotationMaterial = Cesium.Color.fromRandom({ alpha: 0.7 });
  let cubeWithRotationGraphics = new Cesium.RectangleGraphics({
    coordinates: Cesium.Rectangle.fromDegrees(-110.0, 38.0, -107.0, 40.0),
    height: 0, // 一个数字属性，用于指定多边形相对于椭球表面的高度
    extrudedHeight: 100000.0, // 一个数字属性，用于指定多边形的凸出面相对于椭球面的高度。
    rotation: Cesium.Math.toRadians(0),
    material: cubeWithRotationMaterial,
  });
  let cubeWithRotationEntity = new Cesium.Entity({
    rectangle: cubeWithRotationGraphics,
  });
  // 绘制立方体，带旋转的
  viewer.entities.add(cubeWithRotationEntity);
  viewer.zoomTo(cubeWithRotationEntity);
};

// 绘制椭圆柱体，漂浮空中
export const drawCubeWithFloatup = (viewer: Cesium.Viewer) => {
  let cubeWithFloatupMaterial = Cesium.Color.fromRandom({ alpha: 0.7 });
  let cubeWithFloatupGraphics = new Cesium.EllipseGraphics({
    semiMinorAxis: 100000.0,
    semiMajorAxis: 200000.0,
    height: 300000.0,
    extrudedHeight: 700000.0,
    rotation: Cesium.Math.toRadians(-40.0),
    material: cubeWithFloatupMaterial,
  });
  let cubeWithFloatupEntity = new Cesium.Entity({
    position: Cesium.Cartesian3.fromDegrees(-110.0, 35.0),
    ellipse: cubeWithFloatupGraphics,
  });
  viewer.entities.add(cubeWithFloatupEntity);
  viewer.zoomTo(cubeWithFloatupEntity);
};

export const drawFence = (viewer: Cesium.Viewer) => {
  var image = new Image(206, 168);
  image.src = './static/img/bubble/body_light.png';

  let fenceImageMaterialProperty = new Cesium.ImageMaterialProperty({
    image: image,
    repeat: new Cesium.Cartesian2(1, 1),
  });

  let fenceWallGraphics = new Cesium.WallGraphics({
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      -90.0, 43.0, 100000.0, -87.5, 45.0, 100000.0, -85.0, 43.0, 100000.0,
      -87.5, 41.0, 100000.0, -90.0, 43.0, 100000.0,
    ]),
    material: fenceImageMaterialProperty,
  });

  let fenceWallEntity = new Cesium.Entity({
    wall: fenceWallGraphics,
  });

  viewer.entities.add(fenceWallEntity);
  viewer.zoomTo(fenceWallEntity);
};
