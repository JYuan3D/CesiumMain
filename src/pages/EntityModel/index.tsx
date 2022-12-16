import { Cesium } from '@sl-theia/vis';
import { Button, Slider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

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

const rotatingByMatrix4 = (mat: Cesium.Matrix4, options: any) => {
  let _rotateX = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(options.x));
  let _rotateY = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(options.y));
  let _rotateZ = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(options.z));
  mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateX, mat);
  mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateY, mat);
  mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateZ, mat);
  return mat;
};

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const modelRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [rotateZ, setRotateZ] = useState(0);

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
      let position = Cesium.Cartesian3.fromDegrees(114.0535, 22.557904, 300);
      const entityModel = setModel(viewer, position);
      modelRef.current = entityModel;
      const center = entityModel.position?.getValue(new Cesium.JulianDate());
      let upPosCartesian3 = ByDirectionAndHeight(center!, 90, 1000);
      let downPosCartesian3 = ByDirectionAndHeight(center!, -90, 300);
      let cameraPosCartesian3 = ByDirectionAndHeight(center!, 90, 1000);
      cameraPosCartesian3 = ByDirectionAndLen(cameraPosCartesian3, 180, 1600);
      setPoint(viewer, upPosCartesian3, Cesium.Color.BLUE);
      setPoint(viewer, downPosCartesian3, Cesium.Color.RED);
      setPoint(viewer, cameraPosCartesian3, Cesium.Color.GREEN);
      setPolyline(viewer, [downPosCartesian3, upPosCartesian3]);
      setPolyline(viewer, [upPosCartesian3, cameraPosCartesian3]);
      flyModel(viewer, cameraPosCartesian3);
      setIsLoadedViewer(true);
    }
  }, []);

  const setModel = (
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
  ): Cesium.Entity => {
    const modelEntity = viewer.entities.add({
      position: position,
      model: {
        uri: './static/model/npc/SM_XMH_EM_WRJ_01_GLB.glb',
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scale: 128,
        maximumScale: 256,
      },
    });
    return modelEntity;
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
        pitch: Cesium.Math.toRadians(-35.0),
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

  const setScale = (entity: Cesium.Entity, scale: number): void => {
    // @ts-ignore;
    entity.model.scale = scale;
  };

  const setAlpha = (entity: Cesium.Entity, alpha: number): void => {
    // @ts-ignore;
    entity.model.color = Cesium.Color.WHITE.withAlpha(alpha);
  };

  const setRotate = (
    entity: Cesium.Entity,
    rotateX: number,
    rotateY: number,
    rotateZ: number,
  ) => {
    const origin = entity.position?.getValue(new Cesium.JulianDate());
    const heading = Cesium.Math.toRadians(rotateX);
    const pitch = Cesium.Math.toRadians(rotateY);
    const roll = Cesium.Math.toRadians(rotateZ);

    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      origin!,
      hpr,
    );
    // @ts-ignore;
    entity.orientation = orientation;
  };

  const adjustHeight = (
    viewer: Cesium.Viewer,
    entity: Cesium.Entity,
    height: number,
  ) => {
    const origin = entity.position?.getValue(new Cesium.JulianDate());
    const position = ByDirectionAndHeight(origin!, 90, height);
    // const positionProperty = new Cesium.ConstantPositionProperty(position);
    setPoint(viewer, position, Cesium.Color.CORNSILK);
    entity.position?.setValue(position);
  };

  const adjustTranslation = (
    viewer: Cesium.Viewer,
    entity: Cesium.Entity,
    length: number,
  ) => {
    const origin = entity.position?.getValue(new Cesium.JulianDate());
    const position = ByDirectionAndLen(origin!, 0, length);
    // const positionProperty = new Cesium.ConstantPositionProperty(position);
    setPoint(viewer, position, Cesium.Color.CORNSILK);
    entity.position?.setValue(position);
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>缩放:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={256}
              defaultValue={128}
              onChange={(value: number) => {
                setScale(modelRef.current, value);
                return value;
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>透明度:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={1.0}
              step={0.01}
              defaultValue={1.0}
              onChange={(value: number) => {
                setAlpha(modelRef.current, value);
                return value;
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>X轴旋转:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={360}
              defaultValue={rotateX}
              onChange={(value: number) => {
                setRotateX(() => {
                  setRotate(modelRef.current, value, rotateY, rotateZ);
                  return value;
                });
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>Y轴旋转:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={360}
              defaultValue={rotateY}
              onChange={(value: number) => {
                setRotateY(() => {
                  setRotate(modelRef.current, rotateX, value, rotateZ);
                  return value;
                });
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 8,
            }}
          >
            <span>Z轴旋转:</span>
          </div>
          <div style={{ paddingLeft: 12, paddingRight: 8 }}>
            <Slider
              style={{ width: 200 }}
              min={0}
              max={360}
              defaultValue={rotateZ}
              onChange={(value: number) => {
                setRotateZ(() => {
                  setRotate(modelRef.current, rotateX, rotateY, value);
                  return value;
                });
              }}
            />
          </div>
        </div>
        <div className={styles.btnItem} style={{ marginTop: 8, marginBottom: 8 }}>
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
              adjustTranslation(viewerRef.current, modelRef.current, 300)
            }
          >
            平移模型
          </Button>
        </div>
      </div>
    </>
  );
}
