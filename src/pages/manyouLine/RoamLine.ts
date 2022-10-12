import { Cesium } from '@sl-theia/vis';
import Popup from './Popup';
import Tooltip from './Tooltip';

// 绘制线渐变色
const getColorRamp = (elevationRamp: number[], isVertical: boolean) => {
  let ramp = document.createElement('canvas');
  ramp.width = isVertical ? 1 : 100;
  ramp.height = isVertical ? 100 : 1;
  let ctx: any = ramp.getContext('2d');

  let values = elevationRamp;
  let grd = isVertical
    ? ctx.createLinearGradient(0, 0, 0, 100)
    : ctx.createLinearGradient(0, 0, 100, 0);
  grd.addColorStop(values[0], '#1D78FF');
  grd.addColorStop(values[1], '#98ECFD');
  grd.addColorStop(values[2], '#1D78FF');

  ctx.fillStyle = grd;
  if (isVertical) ctx.fillRect(0, 0, 1, 100);
  else ctx.fillRect(0, 0, 100, 1);
  return ramp;
};

class RoamPath {
  viewer: Cesium.Viewer;
  scene: Cesium.Scene;
  handler: Cesium.ScreenSpaceEventHandler;
  isOpenHandler: boolean;
  curPointIndex: number;
  pointArr: Cesium.Entity[];
  pointStart: Cesium.Entity | null;
  pointEnd: Cesium.Entity | null;
  pointEndCartesian: Cesium.Cartesian3 | undefined;
  lineArr: Cesium.Entity[];
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    this.isOpenHandler = false;
    this.curPointIndex = 1;
    this.pointArr = [];
    this.pointStart = null;
    this.pointEnd = null;
    this.lineArr = [];
  }

  private drawPoint(position: any): Cesium.Entity {
    let point = this.viewer.entities.add({
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
    return point;
  }

  private drawLine(
    point1GeoPosition: Cesium.Cartographic,
    point2GeoPosition: Cesium.Cartographic,
  ): Cesium.Entity {
    let { pl1Positions } = this.createPositionsFromCartesian3(
      point1GeoPosition,
      point2GeoPosition,
    );
    let line = this.viewer.entities.add({
      name: '距离线',
      polyline: {
        positions: pl1Positions,
        width: 5,
        // material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
        // @ts-ignore;
        material: getColorRamp([0.0, 0.5, 1], false),
        clampToGround: false,
      },
    });
    return line;
  }

  private createPositionsFromCartesian3(
    point1GeoPosition: Cesium.Cartographic,
    point2GeoPosition: Cesium.Cartographic,
  ): {
    [propName: string]: Cesium.Cartesian3[];
  } {
    let pl1Positions = [
      this.createCartesian3FromRadians(
        point1GeoPosition.longitude,
        point1GeoPosition.latitude,
        point1GeoPosition.height,
      ),
      this.createCartesian3FromRadians(
        point2GeoPosition.longitude,
        point2GeoPosition.latitude,
        point2GeoPosition.height,
      ),
    ];
    return { pl1Positions };
  }

  private createCartesian3FromRadians(
    longitude: number,
    latitude: number,
    height: number,
  ): Cesium.Cartesian3 {
    return Cesium.Cartesian3.fromRadians(longitude, latitude, height);
  }

  private createPointToGeoPosition(
    point1: Cesium.Entity,
    point2: Cesium.Entity,
  ): { [propName: string]: Cesium.Cartographic } {
    let point1GeoPosition = this.createCartographicFromCartesian(
      point1.position._value,
    );
    let point2GeoPosition = this.createCartographicFromCartesian(
      point2.position._value,
    );
    return { point1GeoPosition, point2GeoPosition };
  }

  private createCartographicFromCartesian(
    cartesian: Cesium.Cartesian3,
  ): Cesium.Cartographic {
    // Cartographic由经度、纬度和高度定义的位置
    // 从笛卡尔位置创建一个新的Cartographic实例，返回Cartographic
    return Cesium.Cartographic.fromCartesian(cartesian);
  }

  private getWGS84FromDKR(cartesian: Cesium.Cartesian3) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let x = Cesium.Math.toDegrees(cartographic.longitude);
    let y = Cesium.Math.toDegrees(cartographic.latitude);
    return [x, y];
  }

  public getPath() {
    let path: Array<number[]> = [];
    this.pointArr.forEach((point: Cesium.Entity) => {
      let position = this.getWGS84FromDKR(point.position._value);
      path.push(position);
    });
    console.warn('[path]:', path);
  }

  public handleDrawLine(scale?: any) {
    let _self = this;
    _self.isOpenHandler = true;
    if (_self.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    }
    _self.handler?.setInputAction(function (movement: any) {
      if (movement.position && Cesium.defined(movement)) {
        // 处理缩放问题
        if (scale) {
          movement.position.x = movement.position.x / scale.scaleX;
          movement.position.y = movement.position.y / scale.scaleY;
        }
        // Cesium.SceneMode.MORPHING 模式之间的变形，例如: 3D到2D
        if (_self.scene.mode !== Cesium.SceneMode.MORPHING) {
          let pickedObject = _self.scene.pick(movement.position); // 执行拾取的窗口坐标
          let cartesian: Cesium.Cartesian3;
          if (Cesium.defined(pickedObject)) {
            cartesian = _self.viewer.scene.pickPosition(movement.position);
          } else {
            let ray = _self.viewer.camera.getPickRay(movement.position);
            if (!ray) return;
            cartesian = _self.viewer.scene.globe.pick(
              ray,
              _self.viewer.scene,
            ) as Cesium.Cartesian3;
          }
          if (Cesium.defined(cartesian)) {
            _self.pointEndCartesian = cartesian;
            _self.pointEnd = _self.drawPoint(cartesian);
            _self.pointArr.push(_self.pointEnd);
            if (_self.pointStart) {
              let { point1GeoPosition, point2GeoPosition } =
                _self.createPointToGeoPosition(
                  _self.pointStart as Cesium.Entity,
                  _self.pointEnd as Cesium.Entity,
                );
              let line = _self.drawLine(point1GeoPosition, point2GeoPosition);
              _self.lineArr.push(line);
            }
            _self.pointStart = _self.pointEnd;
          }
        }
      } else {
        console.warn('不能定位点...................');
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    _self.handler?.setInputAction(
      (movement: { endPosition: { x: number; y: number } }) => {
        if (!movement.endPosition) {
          return false;
        }
        let ray = this.viewer.camera.getPickRay(
          movement.endPosition as Cesium.Cartesian2,
        ) as Cesium.Ray;
        const cartesian = this.viewer.scene.globe.pick?.(
          ray,
          this.viewer.scene,
        ) as Cesium.Cartesian3;
        let changedEntity2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          this.viewer.scene,
          cartesian,
        );
        Tooltip({ position: changedEntity2, show: true });
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );

    _self.handler?.setInputAction(() => {
      _self.closeDrawLine();
      // @ts-ignore;
      new Popup({
        viewer: _self.viewer,
        geometry: _self.pointEndCartesian,
        entity: [..._self.pointArr, ..._self.lineArr],
      });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  public openDrawLine() {
    let _self = this;
    if (!_self.isOpenHandler) {
      _self.clearDrawLine();
      _self.handleDrawLine();
    }
  }

  public clearDrawLine() {
    this.pointArr = [];
    this.lineArr = [];
    this.pointStart = null;
    this.pointEnd = null;
    this.pointEndCartesian = undefined;
  }

  public closeDrawLine() {
    Tooltip({ show: false });
    if (this.isOpenHandler) {
      this.isOpenHandler = false;
      this.handler.destroy();
    }
  }
}

export default RoamPath;
