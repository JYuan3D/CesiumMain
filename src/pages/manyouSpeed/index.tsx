import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

/**
 * [-117.02289249743924, 34.88879317755725]
 * [-117.02294361202779, 34.89180055567654]
 * [-117.01963074805985, 34.89172942227679]
 */

function getWGS84FromDKR(cartesian: Cesium.Cartesian3) {
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  let x = Cesium.Math.toDegrees(cartographic.longitude);
  let y = Cesium.Math.toDegrees(cartographic.latitude);
  let h = Cesium.Math.toDegrees(cartographic.height);
  console.warn('h', h);
  return [x, y];
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const modelRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      let osm = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/',
      });

      const viewer = new Cesium.Viewer(cesiums.current, {
        imageryProvider: osm,
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        selectionIndicator: false,
        animation: true, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
        shouldAnimate: true,
      });
      viewerRef.current = viewer;

      // 取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      // 设置homebutton的位置
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        // Rectangle(west, south, east, north)
        110.15,
        34.54,
        110.25,
        34.56,
      );
      const startPosition = Cesium.Cartesian3.fromDegrees(
        -117.02289249743924,
        34.88879317755725,
        0,
      );
      const endPosition = Cesium.Cartesian3.fromDegrees(
        -117.02294361202779,
        34.89180055567654,
        0,
      );

      setReferenceFrame(viewer, startPosition);
      setPoint(viewer, startPosition);
      setPoint(viewer, endPosition);

      let totalSeconds = countSeconds(startPosition, endPosition);

      // 确保查看器处于所需时间
      const start = Cesium.JulianDate.fromDate(new Date(2018, 11, 12, 15));
      const stop = Cesium.JulianDate.addSeconds(
        start,
        totalSeconds,
        new Cesium.JulianDate(),
      );

      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

      // 通过在两个位置之间移动，为我们的模型创建路径
      // SampledPositionProperty:
      // SampledPositionProperty和SampledProperty原理都是一样的
      const position = new Cesium.SampledPositionProperty();
      // SampledProperty:
      // 用来通过给定多个不同时间点的Sample，然后在每两个时间点之间进行插值的一种Property，通常都会使用addSample方法添加不同时间点的值。
      const distance = new Cesium.SampledProperty(Number);

      // 速度矢量特性将给出实体在任何给定时间的速度和方向
      const velocityVectorProperty = new Cesium.VelocityVectorProperty(
        position,
        false,
      );
      const velocityVector = new Cesium.Cartesian3();

      const numberOfSamples = 100;
      let prevLocation = startPosition;
      let totalDistance = 0;
      for (let i = 0; i <= numberOfSamples; ++i) {
        const factor = i / numberOfSamples;
        const time = Cesium.JulianDate.addSeconds(
          start, // 日期
          factor * totalSeconds, // 添加或减去的秒数
          new Cesium.JulianDate(),
        );

        // 使用非线性因子，使模型加速。
        const locationFactor = Math.pow(factor, 1);
        // 使用提供的笛卡尔坐标计算locationFactor处的线性插值或外推。
        const location = Cesium.Cartesian3.lerp(
          startPosition,
          endPosition,
          locationFactor,
          new Cesium.Cartesian3(),
        );
        position.addSample(time, location);
        distance.addSample(
          time,
          (totalDistance += Cesium.Cartesian3.distance(location, prevLocation)),
        );
        prevLocation = location;
      }

      function updateSpeedLabel(time: Cesium.JulianDate) {
        // 在提供的时间time获取属性的值velocityVector
        velocityVectorProperty.getValue(time, velocityVector);
        const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector); // 计算笛卡尔的大小（长度）
        const kmPerHour = Math.round(metersPerSecond * 3.6);

        return `${kmPerHour * viewer.clock.multiplier} km/hour`;
      }

      // Add our model.
      const modelPrimitive: Cesium.Model = viewer.scene.primitives.add(
        Cesium.Model.fromGltf({
          url: './static/model/npc/SM_FBJD_Boy.glb',
          scale: 0.03,
        }),
      );
      const labelGraphics = new Cesium.LabelGraphics({
        text: new Cesium.CallbackProperty(updateSpeedLabel, false),
        font: '20px sans-serif',
        showBackground: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          100.0,
        ),
        eyeOffset: new Cesium.Cartesian3(0, 7.2, 0),
      });
      const modelLabel: Cesium.Entity = viewer.entities.add({
        position: position,
        // 自动将模型的方向设置为其面对的方向
        orientation: new Cesium.VelocityOrientationProperty(position),
        label: labelGraphics,
      });
      modelPrimitive.readyPromise.then(function (model: Cesium.Model) {
        model.activeAnimations.addAll({
          loop: Cesium.ModelAnimationLoop.REPEAT,
          animationTime: function (duration: number) {
            return distance.getValue(viewer.clock.currentTime) / duration;
          },
          multiplier: 0.25,
        });
        const rot = new Cesium.Matrix3();
        viewer.scene.preUpdate.addEventListener(function () {
          const time = viewer.clock.currentTime;
          const pos = position.getValue(time);
          const vel = velocityVectorProperty.getValue(time);
          if (pos) {
            Cesium.Cartesian3.normalize(vel, vel);
            Cesium.Transforms.rotationMatrixFromPositionVelocity(
              pos,
              vel,
              viewer.scene.globe.ellipsoid,
              rot,
            );
            Cesium.Matrix4.fromRotationTranslation(rot, pos, model.modelMatrix);
          }
        });
      });
      modelRef.current = modelPrimitive;
      viewer.trackedEntity = modelLabel;
      let viewFromPos = new Cesium.Cartesian3(10.0, 10.0, 10.0);
      modelLabel.viewFrom = new Cesium.ConstantPositionProperty(viewFromPos);
      setIsLoadedViewer(true);
    }
  }, []);

  const setReferenceFrame = (
    viewer: Cesium.Viewer,
    startPosition: Cesium.Cartesian3,
  ) => {
    const hprRollZero = new Cesium.HeadingPitchRoll();
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      startPosition,
      hprRollZero,
      Cesium.Ellipsoid.WGS84,
      /**
       * x （红色）轴指向当地的东部方向。
       * y （绿色）轴指向本地北方向。
       * z （蓝色）轴指向穿过该位置的椭球面法线方向。
       */
      Cesium.Transforms.eastNorthUpToFixedFrame,
    );
    viewer.scene.primitives.add(
      // 绘制由转换为世界坐标的矩阵定义的参考系的轴，即地球的 WGS84 坐标。最突出的例子是原语模型矩阵。
      // X 轴为红色； Y为绿色； Z是蓝色的。
      // 这仅用于调试；它没有针对生产使用进行优化。
      new Cesium.DebugModelMatrixPrimitive({
        modelMatrix: modelMatrix,
        length: 10000000.0,
        width: 10.0,
      }),
    );
  };

  const setPoint = (viewer: Cesium.Viewer, position: Cesium.Cartesian3) => {
    viewer.entities.add({
      name: '定位点',
      position: position,
      billboard: {
        image: require(`./point.png`),
        width: 29,
        height: 24,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, 12),
        scale: 1,
      },
    });
  };

  const countSeconds = (
    startPosition: Cesium.Cartesian3,
    endPosition: Cesium.Cartesian3,
  ): number => {
    let startPositionCartographic =
      Cesium.Cartographic.fromCartesian(startPosition);
    let endPositionCartographic =
      Cesium.Cartographic.fromCartesian(endPosition);
    let geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(startPositionCartographic, endPositionCartographic);
    let distance = geodesic.surfaceDistance;
    let speed = (5 * 1000) / 3600;
    let seconds = Math.round(distance / speed);
    return seconds;
  };

  const toStart = (viewer: Cesium.Viewer) => {
    viewer.clock.shouldAnimate = true;
  };

  const toStop = (viewer: Cesium.Viewer) => {
    viewer.clock.shouldAnimate = false;
  };

  const toChangeMan = (viewer: Cesium.Viewer, modelPrimitive: Cesium.Model) => {
    const center = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPoint(
      modelPrimitive.modelMatrix,
      modelPrimitive.boundingSphere.center,
      center,
    );
    const hpRange = new Cesium.HeadingPitchRange();
    hpRange.heading = Cesium.Math.toRadians(-180.0);
    hpRange.pitch = Cesium.Math.toRadians(-5.0);
    hpRange.range = 50.0;
    viewer.camera.lookAt(center, hpRange);
  };

  const toChangeUAV = (viewer: Cesium.Viewer, modelPrimitive: Cesium.Model) => {
    const center = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPoint(
      modelPrimitive.modelMatrix,
      modelPrimitive.boundingSphere.center,
      center,
    );
    const hpRange = new Cesium.HeadingPitchRange();
    hpRange.heading = Cesium.Math.toRadians(-200.0);
    hpRange.pitch = Cesium.Math.toRadians(-25.0);
    hpRange.range = 200.0;
    viewer.camera.lookAt(center, hpRange);
  };

  const toChangeSpeed = (viewer: Cesium.Viewer, value: number) => {
    viewer.clock.multiplier = 1 * value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.cesium} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => toStart(viewerRef.current)}>开始</button>
        <button onClick={() => toStop(viewerRef.current)}>暂停</button>
        <button
          onClick={() => toChangeMan(viewerRef.current, modelRef.current)}
        >
          默认视角
        </button>
        <button
          onClick={() => toChangeUAV(viewerRef.current, modelRef.current)}
        >
          无人机视角
        </button>
        <button onClick={() => toChangeSpeed(viewerRef.current, 1)}>1x</button>
        <button onClick={() => toChangeSpeed(viewerRef.current, 2)}>2x</button>
        <button onClick={() => toChangeSpeed(viewerRef.current, 3)}>3x</button>
        <button onClick={() => toChangeSpeed(viewerRef.current, 4)}>4x</button>
      </div>
    </div>
  );
}
