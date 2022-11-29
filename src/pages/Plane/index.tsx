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

      drawWall(viewer, [-95.0, 50.0], 510, 920);
    }
  }, []);

  const drawWall = (
    viewer: Cesium.Viewer,
    origin: number[],
    imageWidth: number,
    imageHeight: number,
  ) => {
    let image = new Image(imageWidth, imageHeight);
    image.src = require('./lineLight.png');

    let material = new Cesium.Material({
      fabric: {
        type: 'EmissionMap',
        uniforms: {
          image: image,
          repeat: {
            x: 1,
            y: 1,
          },
        },
        components: {
          diffuse: 'texture2D(image, materialInput.st).rgb',
          alpha: 'texture2D(image, materialInput.st).a',
        },
      },
      translucent: function () {
        return true;
      },
    });

    const point_1 = Cesium.Cartesian3.fromDegrees(origin[0], origin[1]); // 原点
    const point_4 = ByDirectionAndLen(point_1, 0, imageWidth / 2); // 上点（北边）
    let cartographic_4 = Cesium.Cartographic.fromCartesian(point_4);
    let latitude_4 = Cesium.Math.toDegrees(cartographic_4.latitude);

    const point_5 = ByDirectionAndLen(point_1, 180, imageWidth / 2); // 下点（南边）
    let cartographic_5 = Cesium.Cartographic.fromCartesian(point_5);
    let latitude_5 = Cesium.Math.toDegrees(cartographic_5.latitude);

    let wallInstance2 = new Cesium.GeometryInstance({
      geometry: Cesium.WallGeometry.fromConstantHeights({
        positions: Cesium.Cartesian3.fromDegreesArray([
          origin[0],
          latitude_4,
          origin[0],
          latitude_5,
        ]),
        maximumHeight: imageHeight,
        minimumHeight: 0.0,
      }),
    });

    const Primitive = new Cesium.Primitive({
      show: true,
      geometryInstances: [wallInstance2],
      appearance: new Cesium.MaterialAppearance({
        material: material,
      }),
    });
    viewer.scene.primitives.add(Primitive);
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
