import { Cesium } from '@sl-theia/vis';

class RoamView {
  viewer: Cesium.Viewer;
  model: any;
  path: Cesium.PathGraphics;
  clock: Cesium.Clock | undefined;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.model = this.setModel();
    this.path = this.setPath();
  }

  setModel() {
    let model = new Cesium.PlaneGraphics({
      plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
      dimensions: new Cesium.Cartesian2(60.0, 34.0),
      fill: true,
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
    });
    // let model = new Cesium.ModelGraphics({
    //   uri: './static/model/CesiumAir/Cesium_Air.glb',
    //   scale: 1,
    // });
    return model;
  }

  setPath() {
    let path = new Cesium.PathGraphics({
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        taperPower: 1,
        color: Cesium.Color.PINK,
      }),
      width: 10,
    });
    return path;
  }

  setRoamSpeed(rate: number) {
    this.viewer.clock.multiplier = 1 * rate;
  }

  setRoamClock(TrackPositions: Array<number[]>) {
    let _self = this;
    // 设置模拟时间的界限
    let startJulianDate = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16)); // 从JavaScript日期创建一个新实例。
    let stopJulianDate = Cesium.JulianDate.addSeconds(
      startJulianDate,
      TrackPositions.length - 1,
      new Cesium.JulianDate(),
    ); // 将提供的秒数添加到提供的日期实例中。
    _self.viewer.clock.startTime = startJulianDate.clone(); // 用于跟踪模拟时间的简单时钟
    _self.viewer.clock.stopTime = stopJulianDate.clone(); // 时钟的停止时间
    _self.viewer.clock.currentTime = startJulianDate.clone();
    _self.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  }

  setRoamTrack(TrackPositions: Array<number[]>) {
    this.setRoamClock(TrackPositions);
    // 创建运动的物体，并把物体设置为镜头追踪的对象。
    let position = this.computePosition(
      this.viewer.clock.startTime,
      TrackPositions,
    );
    let orientation = new Cesium.VelocityOrientationProperty(position);
    let availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: this.viewer.clock.startTime,
        stop: this.viewer.clock.stopTime,
      }),
    ]);
    let entity = this.viewer.entities.add({
      availability: availability, // 与此对象关联的可用性
      position: position, // 指定实体位置的属性
      orientation: orientation, // 指定实体方向的属性
      plane: this.model,
      path: this.path, // 与该实体关联的路径
    });
  }

  // 根据坐标数组，计算插值点数据（计算环形飞行）
  computePosition(
    startJulianDate: Cesium.JulianDate,
    TrackPositions: Array<number[]>,
  ) {
    let positionProperty = new Cesium.SampledPositionProperty();
    // 设置插入选项
    positionProperty.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    for (let i = 0; i < TrackPositions.length; i++) {
      let time = Cesium.JulianDate.addSeconds(
        // 将提供的秒数添加到提供的日期实例中
        startJulianDate,
        i,
        new Cesium.JulianDate(),
      );
      let position = Cesium.Cartesian3.fromDegrees(
        TrackPositions[i][0],
        TrackPositions[i][1],
        5,
      );
      positionProperty.addSample(time, position); // 添加一个新样本（指定的时间和位置）
    }
    return positionProperty;
  }

  playRoam() {
    this.viewer.clock.shouldAnimate = true;
  }

  stopRoam() {
    this.viewer.clock.shouldAnimate = false;
  }

  cancelRoam() {
    this.viewer.clock.shouldAnimate = false;
  }
}

export default RoamView;
