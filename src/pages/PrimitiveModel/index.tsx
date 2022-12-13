import { Cesium } from '@sl-theia/vis';
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
        setPoint(viewer, upPosCartesian3, Cesium.Color.BLUE);
        setPoint(viewer, downPosCartesian3, Cesium.Color.RED);
        flyModel(viewer, center);
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
        scale: 50,
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
    let cameraPosition = ByDirectionAndHeight(position, 90, 1000);
    cameraPosition = ByDirectionAndLen(cameraPosition, 180, 1000);
    setPoint(viewer, cameraPosition, Cesium.Color.GREEN);
    viewer.camera.flyTo({
      destination: cameraPosition,
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

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => flyModel(viewerRef.current, modelRef.current)}>
          飞行到目标
        </button>
      </div>
    </>
  );
}
