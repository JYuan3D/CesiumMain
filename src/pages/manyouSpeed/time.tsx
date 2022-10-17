import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import PopupShijianXiangqing from './dom/PopupShijianXiangqing';
import styles from './index.less';
import ManyouPoint from './ManyouPoint';
import Popup from './Popup/Popup';

/**
 * [-117.02289249743924, 34.88879317755725]
 * [-117.02294361202779, 34.89180055567654]
 * [-117.01963074805985, 34.89172942227679]
 */

// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3) {
  //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  //向量AB
  const positionvector = Cesium.Cartesian3.subtract(
    pointB,
    pointA,
    new Cesium.Cartesian3(),
  );
  //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
  //AB为世界坐标中的向量
  //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
  const vector = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
    positionvector,
    new Cesium.Cartesian3(),
  );
  //归一化
  const direction = Cesium.Cartesian3.normalize(
    vector,
    new Cesium.Cartesian3(),
  );
  //heading
  const heading =
    Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const clockRef = useRef<any>();
  const modelRef = useRef<any>();
  const modelLabelRef = useRef<any>();
  const modelListenerRef = useRef<any>();
  const modelHeadingRef = useRef<any>();
  const manyouPointRef = useRef<any>();
  const popupRef = useRef<any>();
  popupRef.current = new Popup({});
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  const allPosition = [
    {
      lon: -117.02289249743924,
      lat: 34.88879317755725,
    },
    {
      lon: -117.02294361202779,
      lat: 34.89180055567654,
    },
    {
      lon: -117.01963074805985,
      lat: 34.89172942227679,
    },
  ];

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
      manyouPointRef.current = new ManyouPoint(viewer);
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

  const setClock = (
    startTime: Cesium.JulianDate,
    stopTime: Cesium.JulianDate,
  ): Cesium.Clock => {
    let clock = new Cesium.Clock({
      startTime: startTime.clone(),
      currentTime: startTime.clone(),
      stopTime: stopTime.clone(),
      clockRange: Cesium.ClockRange.CLAMPED,
      clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    });
    function tick() {
      clock.tick();

      Cesium.requestAnimationFrame(tick);
    }

    Cesium.requestAnimationFrame(tick);
    return clock;
  };

  const setPoint = (viewer: Cesium.Viewer, position: Cesium.Cartesian3) => {
    viewer.entities.add({
      name: '定位点',
      position: position,
      billboard: {
        image: require(`./img/point.png`),
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
    let speed = (5 * 1000) / 3600; // 5km/hour
    let seconds = Math.round(distance / speed);
    return seconds;
  };

  const countTrip = (
    startPosition: Cesium.Cartesian3,
    endPosition: Cesium.Cartesian3,
    startTime: Cesium.JulianDate,
    totalSeconds: number,
    position: Cesium.SampledPositionProperty,
    distance: Cesium.SampledProperty,
  ) => {
    let prevLocation = startPosition;
    let totalDistance = 0;
    for (let i = 0; i <= totalSeconds; ++i) {
      const factor = i / totalSeconds;
      const time = Cesium.JulianDate.addSeconds(
        startTime, // 日期
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
      // console.warn('totalDistance', totalDistance);
      distance.addSample(
        time,
        (totalDistance += Cesium.Cartesian3.distance(location, prevLocation)),
      );
      prevLocation = location;
    }
  };

  const setLabel = (
    viewer: Cesium.Viewer,
    clock: Cesium.Clock,
    velocityVectorProperty: Cesium.VelocityVectorProperty,
    position: Cesium.SampledPositionProperty,
  ): Cesium.Entity => {
    const velocityVector = new Cesium.Cartesian3();
    const labelGraphics = new Cesium.LabelGraphics({
      text: new Cesium.CallbackProperty(
        (time: Cesium.JulianDate) =>
          updateSpeedLabel(clock, velocityVectorProperty, velocityVector, time),
        false,
      ),
      font: '20px sans-serif',
      showBackground: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
      eyeOffset: new Cesium.Cartesian3(0, 7.2, 0),
    });
    const modelLabel: Cesium.Entity = viewer.entities.add({
      position: position,
      // 自动将模型的方向设置为其面对的方向
      orientation: new Cesium.VelocityOrientationProperty(position),
      label: labelGraphics,
    });
    return modelLabel;
  };

  const setPopup = (
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
    createHtmlCb: Function,
    openCb?: Function,
    closeCb?: Function,
  ) => {
    popupRef.current.on('open', function () {
      openCb && openCb();
    });
    popupRef.current.on('close', function () {
      closeCb && closeCb();
    });
    popupRef.current.setPosition(position);
    popupRef.current.setHTML(() => {
      return createHtmlCb();
    });
    popupRef.current.addTo(viewer);
    popupRef.current.setOffset([-200, 0]);
  };

  const setModel = (viewer: Cesium.Viewer): Cesium.Model => {
    const modelPrimitive: Cesium.Model = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url: './static/model/npc/SM_FBJD_Boy.glb',
        scale: 0.03,
      }),
    );
    return modelPrimitive;
  };

  const setModelAnimation = (
    clock: Cesium.Clock,
    model: Cesium.Model,
    distance: Cesium.SampledProperty,
  ) => {
    model.activeAnimations.addAll({
      loop: Cesium.ModelAnimationLoop.REPEAT,
      animationTime: function (duration: number) {
        return distance.getValue(clock.currentTime) / duration;
      },
      multiplier: 0.25,
    });
  };

  const setModelListener = (
    viewer: Cesium.Viewer,
    clock: Cesium.Clock,
    model: Cesium.Model,
    velocityVectorProperty: Cesium.VelocityVectorProperty,
    position: Cesium.SampledPositionProperty,
    manyouPoint: any,
  ): any => {
    const rot = new Cesium.Matrix3();
    let eventListener = () => {
      const time = clock.currentTime;
      const pos = position.getValue(time);
      const vel = velocityVectorProperty.getValue(time);
      if (pos) {
        if (clock.shouldAnimate) {
          manyouPoint.render(
            pos,
            (order: boolean, position: Cesium.Cartesian3) => {
              console.warn('order', order);
              if (order) {
                setPopup(
                  viewer,
                  position,
                  () => {
                    return ReactDOMServer.renderToStaticMarkup(
                      <PopupShijianXiangqing />,
                    );
                  },
                  () => {
                    console.warn('打开');
                  },
                  () => {
                    console.warn('关闭');
                  },
                );
              } else {
                popupRef.current.closeHander();
              }
            },
          );
        }
        Cesium.Cartesian3.normalize(vel, vel);
        Cesium.Transforms.rotationMatrixFromPositionVelocity(
          pos,
          vel,
          viewer.scene.globe.ellipsoid,
          rot,
        );
        Cesium.Matrix4.fromRotationTranslation(rot, pos, model.modelMatrix);
      }
    };
    viewer.scene.preUpdate.addEventListener(eventListener);
    return eventListener;
  };

  const updateSpeedLabel = (
    clock: Cesium.Clock,
    velocityVectorProperty: Cesium.VelocityVectorProperty,
    velocityVector: Cesium.Cartesian3,
    time: Cesium.JulianDate,
  ) => {
    // 在提供的时间time获取属性的值velocityVector
    velocityVectorProperty.getValue(time, velocityVector);
    const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector); // 计算笛卡尔的大小（长度）
    const kmPerHour = Math.round(metersPerSecond * 3.6);
    return `${kmPerHour * clock.multiplier} km/hour`;
  };

  const toStart = (viewer: Cesium.Viewer, allPosition: any[]) => {
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

    const allPositionCartesian3: Cesium.Cartesian3[] = [];
    allPosition.forEach((item: any, index: number) => {
      const positionCartesian3 = Cesium.Cartesian3.fromDegrees(
        item.lon,
        item.lat,
        0,
      );
      allPositionCartesian3.push(positionCartesian3);
    });
    const baitanPositionCartesian3Arr: Cesium.Cartesian3[] = [];
    const yanjiePositionCartesian3Arr: Cesium.Cartesian3[] = [];
    const lajiPositionCartesian3Arr: Cesium.Cartesian3[] = [];
    for (let i = 0; i < allPosition.length; i++) {
      if (i + 1 < allPosition.length) {
        let startPosition = allPosition[i];
        let nextPosition = allPosition[i + 1];
        let newPosition = [
          (startPosition.lon + nextPosition.lon) / 2 - 0.0001,
          (startPosition.lat + nextPosition.lat) / 2,
        ];
        let baitanPositionCartesian3 = Cesium.Cartesian3.fromDegrees(
          newPosition[0] - 0.0001,
          newPosition[1] + 0.0001,
          5,
        );
        baitanPositionCartesian3Arr.push(baitanPositionCartesian3);
        let yanjiePositionCartesian3 = Cesium.Cartesian3.fromDegrees(
          newPosition[0] + 0.0002,
          newPosition[1] - 0.001,
          5,
        );
        yanjiePositionCartesian3Arr.push(yanjiePositionCartesian3);
        let lajiPositionCartesian3 = Cesium.Cartesian3.fromDegrees(
          newPosition[0] + 0.0002,
          newPosition[1] + 0.0001,
          5,
        );
        lajiPositionCartesian3Arr.push(lajiPositionCartesian3);
      }
    }
    manyouPointRef.current.addPointIcon(
      baitanPositionCartesian3Arr,
      '摆摊',
      require(`./img/摆摊.png`),
    );
    manyouPointRef.current.addPointIcon(
      yanjiePositionCartesian3Arr,
      '沿街',
      require(`./img/沿街.png`),
    );
    // manyouPointRef.current.addPointIcon(
    //   lajiPositionCartesian3Arr,
    //   '垃圾',
    //   require(`./img/垃圾.png`),
    // );

    setReferenceFrame(viewer, allPositionCartesian3[0]);
    allPositionCartesian3.forEach((item: Cesium.Cartesian3) => {
      setPoint(viewer, item);
    });
    modelHeadingRef.current = getHeading(
      allPositionCartesian3[0],
      allPositionCartesian3[1],
    );

    let startTime = Cesium.JulianDate.fromDate(new Date(2018, 11, 12, 15));
    let nextTime = startTime.clone();
    let stopTime = startTime.clone();
    for (let i = 0; i < allPositionCartesian3.length; i++) {
      if (i + 1 < allPositionCartesian3.length) {
        let totalSeconds = countSeconds(
          allPositionCartesian3[i],
          allPositionCartesian3[i + 1],
        );
        countTrip(
          allPositionCartesian3[i],
          allPositionCartesian3[i + 1],
          nextTime,
          totalSeconds,
          position,
          distance,
        );
        nextTime = Cesium.JulianDate.addSeconds(
          nextTime,
          totalSeconds,
          new Cesium.JulianDate(),
        );
        stopTime = nextTime.clone();
      }
    }

    // console.warn(
    //   '[velocityVectorProperty]:',
    //   velocityVectorProperty._position._property._times,
    // );
    // console.warn('[position]:', position._property._times);
    // console.warn('[distance]:', distance._times);

    clockRef.current = setClock(startTime, stopTime);

    const modelPrimitive: Cesium.Model = setModel(viewer);
    modelPrimitive.readyPromise.then(function (model: Cesium.Model) {
      setModelAnimation(clockRef.current, model, distance);
      const modelListener = setModelListener(
        viewer,
        clockRef.current,
        model,
        velocityVectorProperty,
        position,
        manyouPointRef.current,
      );
      modelRef.current = model;
      modelListenerRef.current = modelListener;

      toChangeUAV(viewer, model, modelHeadingRef.current);
    });
    const modelLabel: Cesium.Entity = setLabel(
      viewer,
      clockRef.current,
      velocityVectorProperty,
      position,
    );
    modelLabelRef.current = modelLabel;
    viewer.trackedEntity = modelLabel;
    clockRef.current.shouldAnimate = true;

    // 5.057010116276572  4.342459780324267
    // 1.0159780860953358 5.320513304285946
    console.warn(
      'Cesium.Math.toRadians(-5.0)',
      Cesium.Math.toRadians(0.0),
      Cesium.Math.toRadians(90.0),
    );
    console.warn(
      'Cesium.Math.toRadians(-5.0)',
      Cesium.Math.toRadians(180),
      Cesium.Math.toRadians(360),
    );
    clockRef.current.onStop.addEventListener(() => {
      console.warn('结束巡航...........');
    });
  };

  const toGoon = (clock: Cesium.Clock) => {
    clock.shouldAnimate = true;
  };

  const toStop = (clock: Cesium.Clock) => {
    clock.shouldAnimate = false;
  };

  const toCancel = (
    viewer: Cesium.Viewer,
    clock: Cesium.Clock,
    model: Cesium.Model,
    modelLabel: Cesium.Entity,
    modelListener: any,
  ) => {
    viewer.trackedEntity = undefined;
    clock.shouldAnimate = false;
    toChangeSpeed(clock, 1);
    viewer.scene.primitives.remove(model);
    viewer.entities.remove(modelLabel);
    viewer.scene.preUpdate.removeEventListener(modelListener);
  };

  const toChangeMan = (
    viewer: Cesium.Viewer,
    modelPrimitive: Cesium.Model,
    heading: number,
  ) => {
    const center = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPoint(
      modelPrimitive.modelMatrix,
      modelPrimitive.boundingSphere.center,
      center,
    );
    const hpRange = new Cesium.HeadingPitchRange();
    hpRange.heading = heading;
    hpRange.pitch = Cesium.Math.toRadians(-5.0);
    hpRange.range = 50.0;
    viewer.camera.lookAt(center, hpRange);
  };

  const toChangeUAV = (
    viewer: Cesium.Viewer,
    modelPrimitive: Cesium.Model,
    heading: number,
  ) => {
    const center = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPoint(
      modelPrimitive.modelMatrix,
      modelPrimitive.boundingSphere.center,
      center,
    );
    const hpRange = new Cesium.HeadingPitchRange();
    hpRange.heading = Cesium.Math.toRadians(30) + heading;
    hpRange.pitch = Cesium.Math.toRadians(-25.0);
    hpRange.range = 200.0;
    viewer.camera.lookAt(center, hpRange);
  };

  const toChangeSpeed = (clock: Cesium.Clock, value: number) => {
    clock.multiplier = 1 * value;
  };

  const toClosePopup = (popup: any) => {
    console.warn('[Popup]:', popup);
    popup.closeHander();
  };

  return (
    <div className={styles.container}>
      <div className={styles.cesium} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => toStart(viewerRef.current, allPosition)}>
          启动
        </button>
        <button onClick={() => toGoon(clockRef.current)}>继续</button>
        <button onClick={() => toStop(clockRef.current)}>暂停</button>
        <button
          onClick={() =>
            toCancel(
              viewerRef.current,
              clockRef.current,
              modelRef.current,
              modelLabelRef.current,
              modelListenerRef.current,
            )
          }
        >
          取消
        </button>
        <button
          onClick={() =>
            toChangeMan(
              viewerRef.current,
              modelRef.current,
              modelHeadingRef.current,
            )
          }
        >
          默认视角
        </button>
        <button
          onClick={() =>
            toChangeUAV(
              viewerRef.current,
              modelRef.current,
              modelHeadingRef.current,
            )
          }
        >
          无人机视角
        </button>
        <button onClick={() => toChangeSpeed(clockRef.current, 1)}>1x</button>
        <button onClick={() => toChangeSpeed(clockRef.current, 2)}>2x</button>
        <button onClick={() => toChangeSpeed(clockRef.current, 3)}>3x</button>
        <button onClick={() => toChangeSpeed(clockRef.current, 15)}>15x</button>
        <button onClick={() => toClosePopup(popupRef.current)}>关闭弹窗</button>
      </div>
    </div>
  );
}
