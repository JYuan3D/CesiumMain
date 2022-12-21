import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const modelRef = useRef<any>();
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
      const modelPrimitive: Cesium.Model = setModel(viewer);
      modelPrimitive.readyPromise.then(function (model: Cesium.Model) {
        let center = Cesium.Matrix4.multiplyByPoint(
          model.modelMatrix,
          model.boundingSphere.center,
          new Cesium.Cartesian3(),
        );
        let upPosCartesian3 = ByDirectionAndHeight(center, 90, 1000);
        let downPosCartesian3 = ByDirectionAndHeight(center, -90, 300);
        let cameraPosCartesian3 = ByDirectionAndHeight(center, 90, 1000);
        cameraPosCartesian3 = ByDirectionAndLen(cameraPosCartesian3, 180, 1600);
        setPoint(viewer, upPosCartesian3, Cesium.Color.BLUE);
        setPoint(viewer, downPosCartesian3, Cesium.Color.RED);
        setPoint(viewer, cameraPosCartesian3, Cesium.Color.GREEN);
        setPolyline(viewer, [downPosCartesian3, upPosCartesian3]);
        setPolyline(viewer, [upPosCartesian3, cameraPosCartesian3]);
        flyModel(viewer, cameraPosCartesian3);
        modelRef.current = model;
        setIsLoadedViewer(true);
      });
    }
  }, []);

  const setModel = (viewer: Cesium.Viewer): Cesium.Model => {
    let origin = Cesium.Cartesian3.fromDegrees(114.0535, 22.557904, 300);
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
    const modelPrimitive: Cesium.Model = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url: './static/model/npc/SM_XMH_EM_WRJ_01_GLB.glb',
        show: true,
        modelMatrix: modelMatrix,
        scale: 128,
        allowPicking: false,
        debugShowBoundingVolume: false,
        debugWireframe: false,
      }),
    );
    return modelPrimitive;
  };

  const flyModel = (
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
    cb?: Function,
  ) => {
    viewer.camera.flyTo({
      destination: position,
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
        roll: Cesium.Math.toRadians(0.0),
      },
      complete: () => {
        cb?.();
      },
    });
  };

  const setPoint = (
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
    color: Cesium.Color,
  ) => {
    viewer.entities.add({
      position: position,
      point: {
        color: color,
        pixelSize: 20,
      },
    });
  };

  const setPolyline = (
    viewer: Cesium.Viewer,
    positions: Cesium.Cartesian3[],
  ) => {
    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: 2.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: [Cesium.Color.YELLOW, Cesium.Color.YELLOW],
            colorsPerVertex: true,
          }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
      }),
    );
  };

  const ByDirectionAndHeight = (
    position: Cesium.Cartesian3,
    angle: number,
    height: number,
  ) => {
    // 从具有东北向上轴的参考帧计算4x4变换矩阵以提供的原点为中心，以提供的椭球的固定参考系为中心。
    let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    // 创建围绕z轴的旋转矩阵
    let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(angle || 0));
    // 从Matrix3计算代表旋转的Matrix4实例和代表翻译的Cartesian3
    let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
    // 计算两个矩阵(matrix * rotationX)的乘积
    Cesium.Matrix4.multiply(matrix, rotationX, matrix);
    let result = Cesium.Matrix4.multiplyByPoint(
      matrix,
      new Cesium.Cartesian3(0, height, 0),
      new Cesium.Cartesian3(),
    );
    return result;
  };

  const ByDirectionAndLen = (
    position: Cesium.Cartesian3,
    angle: number,
    len: number,
  ) => {
    // 从具有东北向上轴的参考帧计算4x4变换矩阵以提供的原点为中心，以提供的椭球的固定参考系为中心。
    let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    // 创建围绕z轴的旋转矩阵
    let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle || 0));
    // 从Matrix3计算代表旋转的Matrix4实例和代表翻译的Cartesian3
    let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
    // 计算两个矩阵(matrix * rotationZ)的乘积
    Cesium.Matrix4.multiply(matrix, rotationZ, matrix);
    let result = Cesium.Matrix4.multiplyByPoint(
      matrix,
      new Cesium.Cartesian3(0, len, 0),
      new Cesium.Cartesian3(),
    );
    return result;
  };

  const adjustRotate = (model: Cesium.Model, rotateX: number) => {
    let m = model.modelMatrix;
    let rotationM = Cesium.Matrix3.fromRotationZ(
      Cesium.Math.toRadians(rotateX),
    ); // rtaleX表示水平方向旋转的度数
    let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(
      m,
      rotationM,
      new Cesium.Matrix4(),
    ); // 计算矩阵4的变换矩阵（在原变换中，累加变换）
    model.modelMatrix = newMatrix4;
  };

  const adjustTranslation = (viewer: Cesium.Viewer, model: Cesium.Model) => {
    let center = Cesium.Matrix4.multiplyByPoint(
      model.modelMatrix,
      model.boundingSphere.center,
      new Cesium.Cartesian3(),
    );
    const position = ByDirectionAndLen(center, 0, 300);
    setPoint(viewer, position, Cesium.Color.CORNSILK);
    const m1 = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Matrix4.getTranslation(model.modelMatrix, new Cesium.Cartesian3()),
      Cesium.Ellipsoid.WGS84,
      new Cesium.Matrix4(),
    );
    const m3 = Cesium.Matrix4.multiply(
      Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()),
      model.modelMatrix,
      new Cesium.Matrix4(),
    );
    const mat3 = Cesium.Matrix4.getRotation(m3, new Cesium.Matrix3());
    const q = Cesium.Quaternion.fromRotationMatrix(mat3);
    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);
    const headingPitchRoll = new Cesium.HeadingPitchRoll(
      hpr.heading,
      hpr.pitch,
      hpr.roll,
    ); // 获取当前模型heading，pitch，roll
    const m = Cesium.Transforms.headingPitchRollToFixedFrame(
      position,
      headingPitchRoll,
      Cesium.Ellipsoid.WGS84,
      Cesium.Transforms.eastNorthUpToFixedFrame,
      new Cesium.Matrix4(),
    );
    model.modelMatrix = m;
  };

  const adjustHeight = (
    viewer: Cesium.Viewer,
    model: Cesium.Model,
    height: number,
  ) => {
    let oldMatrix = model.modelMatrix; // 模型的矩阵
    let oldCenter = new Cesium.Cartesian3(
      oldMatrix[12],
      oldMatrix[13],
      oldMatrix[14],
    ); // 模型高度调整前中心点笛卡尔坐标
    let oldCartographic = Cesium.Cartographic.fromCartesian(oldCenter); // 高度调整前的弧度坐标
    let newHeight = oldCartographic.height + height;
    let newCartographic = new Cesium.Cartographic(
      oldCartographic.longitude,
      oldCartographic.latitude,
      newHeight,
    ); // 高度调整后的弧度坐标
    let newCartesian =
      viewer.scene.globe.ellipsoid.cartographicToCartesian(newCartographic);
    setPoint(viewer, newCartesian, Cesium.Color.CORNSILK);
    let headingPitchRoll = new Cesium.HeadingPitchRoll(0, 0, 0);
    let m = Cesium.Transforms.headingPitchRollToFixedFrame(
      newCartesian,
      headingPitchRoll,
      Cesium.Ellipsoid.WGS84,
      Cesium.Transforms.eastNorthUpToFixedFrame,
      new Cesium.Matrix4(),
    );
    model.modelMatrix = m; // 平移变换
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => adjustRotate(modelRef.current, 45)}
          >
            旋转模型
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              adjustHeight(viewerRef.current, modelRef.current, 300)
            }
          >
            升高模型
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              adjustTranslation(viewerRef.current, modelRef.current)
            }
          >
            平移模型
          </Button>
        </div>
      </div>
    </>
  );
}
