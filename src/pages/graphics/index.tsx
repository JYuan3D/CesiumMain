import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
// import { drawRectangle } from './Draw/surface';
import styles from './index.less';

//参数为什么类型,可根据函数API去传参
//len(单位:m)
//返回的类型可根据API转换坐标即可
function ByDirectionAndLen(position: any, angle: any, len: any) {
  let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle || 0));
  let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  Cesium.Matrix4.multiply(matrix, rotationZ, matrix);
  let result = Cesium.Matrix4.multiplyByPoint(
    matrix,
    new Cesium.Cartesian3(0, len, 0),
    new Cesium.Cartesian3(),
  );
  return result;
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        selectionIndicator: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      viewerRef.current = viewer;
      setIsLoadedViewer(true);

      // drawRectangle(viewer); // 绘制矩形
      // drawPolygon(viewer); // 绘制多边形
      // drawEllipse(viewer); // 绘制椭圆形
      // drawRound(viewer); // 绘制圆形
      // drawBoxCube(viewer); // 绘制盒形立方体
      // drawRectangleCube(viewer); // 绘制矩形立方体
      // drawRoundCube(viewer); // 绘制多边形立方体
      // drawEllipseCube(viewer); // 绘制椭圆形立方体
      // drawRoundCube(viewer); // 绘制圆形立方体
      // drawRadiiEllipseCub(viewer); // 绘制球体
      // drawWall(viewer, [-95.0, 50.0], 206, 168);
      // drawHuiWord(viewer);
      drawFence(viewer);
    }
  }, []);

  const drawRectangle = (viewer: Cesium.Viewer) => {
    let image = new Image(206, 168);
    image.src = './static/img/bubble/body_light.png';

    let fenceImageMaterialProperty = new Cesium.ImageMaterialProperty({
      image: image,
      repeat: new Cesium.Cartesian2(1, 1),
    });

    let rectangleGraphics = new Cesium.RectangleGraphics({
      coordinates: Cesium.Rectangle.fromDegrees(116.8, 36.1, 116.9, 36.2), // 最西、最南、最东、最北
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
      stRotation: Cesium.Math.toRadians(0), // 一个数值属性，指定矩形纹理从北逆时针旋转
      material: fenceImageMaterialProperty,
    });

    let rectangleEntity = new Cesium.Entity({
      rectangle: rectangleGraphics,
    });

    viewer.entities.add(rectangleEntity);
    viewer.zoomTo(rectangleEntity);
  };

  const drawWall = (
    viewer: Cesium.Viewer,
    origin: number[],
    imageWidth: number,
    imageHeight: number,
  ) => {
    let image = new Image(imageWidth, imageHeight);
    image.src = './static/img/bubble/body_light.png';

    let fenceImageMaterialProperty = new Cesium.ImageMaterialProperty({
      image: image,
      repeat: new Cesium.Cartesian2(1, 1),
      transparent: true,
    });

    const point_1 = Cesium.Cartesian3.fromDegrees(origin[0], origin[1]); // 原点
    const point_2 = ByDirectionAndLen(point_1, 90, imageWidth / 2); // 右点（东边）
    let cartographic_2 = Cesium.Cartographic.fromCartesian(point_2);
    let longitude_2 = Cesium.Math.toDegrees(cartographic_2.longitude);

    const point_3 = ByDirectionAndLen(point_1, 270, imageWidth / 2); // 左点（西边）
    let cartographic_3 = Cesium.Cartographic.fromCartesian(point_3);
    let longitude_3 = Cesium.Math.toDegrees(cartographic_3.longitude);

    const point_4 = ByDirectionAndLen(point_1, 0, imageWidth / 2); // 上点（北边）
    let cartographic_4 = Cesium.Cartographic.fromCartesian(point_4);
    let latitude_4 = Cesium.Math.toDegrees(cartographic_4.latitude);

    const point_5 = ByDirectionAndLen(point_1, 180, imageWidth / 2); // 下点（南边）
    let cartographic_5 = Cesium.Cartographic.fromCartesian(point_5);
    let latitude_5 = Cesium.Math.toDegrees(cartographic_5.latitude);

    let wallGraphics_front = new Cesium.WallGraphics({
      positions: Cesium.Cartesian3.fromDegreesArray([
        longitude_3,
        origin[1],
        longitude_2,
        origin[1],
      ]),
      maximumHeights: [imageHeight, imageHeight],
      minimumHeights: [0, 0],
      outline: false,
      outlineColor: Cesium.Color.LIGHTGRAY,
      outlineWidth: 4,
      material: fenceImageMaterialProperty,
    });
    let wallGraphics_side = new Cesium.WallGraphics({
      positions: Cesium.Cartesian3.fromDegreesArray([
        origin[0],
        latitude_4,
        origin[0],
        latitude_5,
      ]),
      maximumHeights: [imageHeight, imageHeight],
      minimumHeights: [0, 0],
      outline: false,
      material: fenceImageMaterialProperty,
    });
    let wallEntity_front = new Cesium.Entity({
      wall: wallGraphics_front,
    });
    let wallEntity_side = new Cesium.Entity({
      wall: wallGraphics_side,
    });
    viewer.entities.add(wallEntity_front);
    viewer.entities.add(wallEntity_side);
    viewer.zoomTo(wallEntity_front);
  };

  const drawFence = (viewer: Cesium.Viewer) => {
    let image = new Image(512, 512);
    image.src = require('./wall.png');

    let fenceImageMaterialProperty = new Cesium.ImageMaterialProperty({
      image: image,
      repeat: new Cesium.Cartesian2(2000, 1),
      transparent: true,
    });

    let fenceWallGraphics = new Cesium.WallGraphics({
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        -90.0, 43.0, 512, -87.5, 45.0, 512, -85.0, 43.0, 512, -87.5, 41.0, 512,
        -90.0, 43.0, 512,
      ]),
      material: fenceImageMaterialProperty,
    });

    let fenceWallEntity = new Cesium.Entity({
      wall: fenceWallGraphics,
    });

    viewer.entities.add(fenceWallEntity);
    viewer.zoomTo(fenceWallEntity);
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button>参数</button>
      </div>
    </>
  );
}
