import { Cesium } from '@sl-theia/vis';

// 每一帧根据物体的坐标和走向，设置相机的角度
const getModelMatrix = (
  entity: Cesium.Entity,
  time: Cesium.JulianDate,
  result: Cesium.Matrix4,
  matrix3Scratch: Cesium.Matrix3,
): Cesium.Matrix4 | undefined => {
  let transformMatrix4: Cesium.Matrix4;
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
    transformMatrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(
      position,
      undefined,
      result,
    );
  } else {
    transformMatrix4 = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
      position,
      result,
    );
  }
  return transformMatrix4;
};

class RoamView {
  viewer: Cesium.Viewer;
  model: Cesium.ModelGraphics;
  path: Cesium.PathGraphics;
  clock: Cesium.Clock | undefined;
  cameraOffset: Cesium.Cartesian3 | undefined;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.model = this.setModel();
    this.path = this.setPath();
  }

  setModel() {
    let model = new Cesium.ModelGraphics({
      // NPC
      // uri: './static/model/npc/SM_FBJD_Boy.glb',
      // 飞机
      uri: './static/model/CesiumAir/Cesium_Air.glb',
      scale: 10,
    });
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

  setRoamCameraOffset(x: number, y: number, z: number) {
    let offsetX = x; // 距离运动点的距离（后方）10
    let offsetY = y; // 距离运动点的高度（侧方）0
    let offsetZ = z; // 距离运动点的高度（上方）5
    this.cameraOffset = new Cesium.Cartesian3(-offsetX, offsetY, offsetZ);
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
    // 确保viewer在所需的时间之内
    // let clock = new Cesium.Clock();
    _self.viewer.clock.startTime = startJulianDate.clone(); // 用于跟踪模拟时间的简单时钟
    _self.viewer.clock.stopTime = stopJulianDate.clone(); // 时钟的停止时间
    _self.viewer.clock.currentTime = startJulianDate.clone();
    // clockRange是播放模式, Cesium.ClockRange.LOOP_STOP自动循环播放
    _self.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    // multiplier是播放的速度
    // this.viewer.clock.multiplier = 0.5;
    // 将时间线设置为模拟边界
    // this.viewer.timeline.zoomTo(startJulianDate, stopJulianDate);
    _self.viewer.clock.onStop.addEventListener(() => {
      console.warn('结束巡航...........');
      _self.cancelRoam();
    });
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
      model: this.model, // 与该实体关联的模型
      path: this.path, // 与该实体关联的路径
    });
    // 追踪物体
    this.viewer.trackedEntity = entity;
  }

  // 根据坐标数组，计算插值点数据（计算环形飞行）
  computePosition(
    startJulianDate: Cesium.JulianDate,
    TrackPositions: Array<number[]>,
  ) {
    let positionProperty = new Cesium.SampledPositionProperty();
    // 设置插入选项
    positionProperty.setInterpolationOptions({
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
    this.viewer.trackedEntity = undefined;
  }

  render(scratch: Cesium.Matrix4, matrix3Scratch: Cesium.Matrix3) {
    if (this.viewer.trackedEntity) {
      console.warn(
        'this.viewer.trackedEntity',
        this.viewer.trackedEntity.position?._value,
      );
      let cameraTransform = getModelMatrix(
        this.viewer.trackedEntity,
        this.viewer.clock.currentTime,
        scratch,
        matrix3Scratch,
      );

      if (!cameraTransform || !this.cameraOffset) return;
      this.viewer.scene.camera.lookAtTransform(
        cameraTransform,
        this.cameraOffset,
      );
    }
  }
}

export default RoamView;
