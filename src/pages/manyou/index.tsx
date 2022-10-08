import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const scratch = new Cesium.Matrix4();
  const matrix3Scratch = new Cesium.Matrix3();
  const TrackPositions = [
    [109.05832893717263, 37.441496598851096],
    [109.05855416786699, 37.44130123438769],
    [109.05870506545179, 37.44117238850958],
    [109.05846290755761, 37.441001906200626],
    [109.05874862898264, 37.440730473795476],
    [109.0591362027828, 37.4403901883947],
    [109.05955264270231, 37.4400282830198],
    [109.05976466627452, 37.43986533373868],
    [109.06019447304337, 37.43953151809137],
    [109.06050060518912, 37.439282109667204],
    [109.06073920090172, 37.43909640541291],
    [109.06102095626935, 37.43887990938909],
    [109.06126114614219, 37.43905268010351],
    [109.0615923854886, 37.43932891714282],
    [109.06114978051788, 37.43970657237644],
    [109.06078572833964, 37.44000168113979],
    [109.06027780474928, 37.44042583498669],
    [109.0598968978716, 37.440729305287476],
    [109.05936770987917, 37.441168572826626],
    [109.05904603542216, 37.44142781800953],
    [109.0587449465546, 37.44119249116668],
    [109.05845600554856, 37.441396645980845],
  ];

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        }),
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        selectionIndicator: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: true, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
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
      // 设置初始位置
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          109.05845600554856,
          37.441396645980845,
          2000.0,
        ),
      });

      viewer.scene.preRender.addEventListener(() => {
        // console.warn('渲染侦听处理...........');
        renderListenHandler(viewer, scratch);
      });

      setIsLoadedViewer(true);
    }
  }, []);

  const renderListenHandler = (
    viewer: Cesium.Viewer,
    scratch: Cesium.Matrix4,
  ) => {
    if (viewer.trackedEntity) {
      getModelMatrix(
        viewer.trackedEntity,
        viewer.clock.currentTime,
        scratch,
        matrix3Scratch,
      );

      let transformX = 10; // 距离运动点的距离（后方）
      let transformZ = 5; // 距离运动点的高度（上方）
      let transformY = 0; // 距离运动点的高度（侧方）
      viewer.scene.camera.lookAtTransform(
        scratch,
        new Cesium.Cartesian3(-transformX, transformY, transformZ),
      );
    }
  };

  // 每一帧根据物体的坐标和走向，设置相机的角度
  const getModelMatrix = (
    entity: Cesium.Entity,
    time: Cesium.JulianDate,
    result: Cesium.Matrix4,
    matrix3Scratch: Cesium.Matrix3,
  ) => {
    let position = Cesium.Property.getValueOrUndefined(
      entity.position,
      time,
      new Cesium.Cartesian3(),
    );
    if (!Cesium.defined(position)) {
      return undefined;
    }
    let orientation = Cesium.Property.getValueOrUndefined(
      entity.orientation,
      time,
      new Cesium.Quaternion(),
    );
    if (!Cesium.defined(orientation)) {
      result = Cesium.Transforms.eastNorthUpToFixedFrame(
        position,
        undefined,
        result,
      );
    } else {
      result = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
        position,
        result,
      );
    }
    return result;
  };

  const setTrackView = (viewer: Cesium.Viewer) => {
    // 设置模拟时间的界限
    let startJulianDate = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16)); // 从JavaScript日期创建一个新实例。
    let stopJulianDate = Cesium.JulianDate.addSeconds(
      startJulianDate,
      TrackPositions.length - 1,
      new Cesium.JulianDate(),
    ); // 将提供的秒数添加到提供的日期实例中。

    // 确保viewer在所需的时间之内
    viewer.clock.startTime = startJulianDate.clone();
    viewer.clock.stopTime = stopJulianDate.clone();
    viewer.clock.currentTime = startJulianDate.clone();
    // clockRange是播放模式, Cesium.ClockRange.LOOP_STOP自动循环播放
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    // multiplier是播放的速度
    viewer.clock.multiplier = 3;

    // 将时间线设置为模拟边界
    viewer.timeline.zoomTo(startJulianDate, stopJulianDate);

    // 创建运动的物体，并把物体设置为镜头追踪的对象。
    let position = computeCirclularFlight(startJulianDate);
    // console.warn('[position]:', position);

    // 实际创建实体
    let availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: startJulianDate,
        stop: stopJulianDate,
      }),
    ]);
    // console.warn("[availability]:", availability);
    let orientation = new Cesium.VelocityOrientationProperty(position);
    let model = new Cesium.ModelGraphics({
      uri: './static/model/npc/SM_FBJD_Boy.glb',
      scale: 0.01,
    });
    let path = new Cesium.PathGraphics({
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.PINK,
      }),
      width: 100,
    });
    let entity = viewer.entities.add({
      availability: availability,
      position: position,
      // 根据当前位置移动自动计算方位
      orientation: orientation,
      model: model,
      // Show the path as a pink line sampled in 1 second increments.
      // 将路径显示为以1秒为增量采样的粉色线。
      path: path,
    });
    // 追踪物体
    viewer.trackedEntity = entity;
  };

  // 根据坐标数组，计算插值点数据（计算环形飞行）
  function computeCirclularFlight(startJulianDate: Cesium.JulianDate) {
    let property = new Cesium.SampledPositionProperty();
    // 设置插入选项
    property.setInterpolationOptions({
      // 设置插值位置时要使用的算法和度数
      // interpolationDegree: 1,
      // interpolationAlgorithm: Cesium.LinearApproximation,

      // interpolationDegree: 5,
      // interpolationAlgorithm:
      //   Cesium.LagrangePolynomialApproximation,

      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    for (let i = 0; i < TrackPositions.length; i++) {
      let time = Cesium.JulianDate.addSeconds(
        startJulianDate,
        i,
        new Cesium.JulianDate(),
      );
      let position = Cesium.Cartesian3.fromDegrees(
        TrackPositions[i][0],
        TrackPositions[i][1],
        5,
      );
      property.addSample(time, position); // 添加一个新样本
    }
    return property;
  }

  const toStart = () => {
    // console.log("viewerRef.current", viewerRef.current)
    viewerRef.current.clock.shouldAnimate = true;
    setTrackView(viewerRef.current);
  };

  const toQuit = () => {
    viewerRef.current.trackedEntity = undefined;
    viewerRef.current.clock.shouldAnimate = false;
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => toStart()}>播放</button>
        <button onClick={() => toQuit()}>停止</button>
      </div>
    </>
  );
}
