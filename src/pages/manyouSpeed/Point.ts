import { Cesium } from '@sl-theia/vis';

export interface PointInterface {
  viewer: Cesium.Viewer;
}

class Point implements PointInterface {
  viewer: Cesium.Viewer;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  getPointInfo(windowsPosition: Cesium.Cartesian2) {
    // 定义一个屏幕点击的事件，pickPosition封装的是获取点击的位置的坐标
    // 输出之后我们发现如前言所说的坐标都是笛卡尔坐标，所以我们需要转换笛卡尔坐标
    let position = this.viewer.scene.pickPosition(windowsPosition);
    console.warn('[windowsPosition]:', windowsPosition, position);
    if (!position || !(position instanceof Cesium.Cartesian3)) {
      return false;
    }
    // 将笛卡尔坐标转化为弧度坐标
    let cartographic = Cesium.Cartographic.fromCartesian(position);
    // 将弧度坐标转换为经纬度坐标
    let longitudeWorld = Cesium.Math.toDegrees(cartographic.longitude); // 经度
    let latitudeWorld = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
    let heightWorld = cartographic.height; //高度
    console.warn('经度: ', longitudeWorld);
    console.warn('纬度: ' + latitudeWorld);
    console.warn('高度: ' + heightWorld);
    // 同时也可以将经度度转回为笛卡尔
    let ellipsoid = this.viewer.scene.globe.ellipsoid;
    // 定义84坐标为一个Cartesian值
    let wgs84 = Cesium.Cartographic.fromDegrees(
      longitudeWorld,
      latitudeWorld,
      heightWorld,
    );
    // 将84坐标转换为笛卡尔
    let dikaer = ellipsoid.cartographicToCartesian(wgs84);
    // 赋值
    let longitudeDescartes = dikaer.x;
    let latitudeDescartes = dikaer.y;
    let heightDescartes = dikaer.z;
    console.warn('笛卡尔x: ', longitudeDescartes);
    console.warn('笛卡尔y: ', latitudeDescartes);
    console.warn('笛卡尔z: ', heightDescartes);
  }

  // 根据两个坐标点,获取Heading(朝向)
  getHeading(pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3) {
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

  flytoPointIcon(viewer: Cesium.Viewer, targetEntity: any) {
    let headingPitchRange = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(-10),
      Cesium.Math.toRadians(-30),
      360,
    );
    // 视角定位
    viewer.flyTo(targetEntity, {
      duration: 1,
      offset: headingPitchRange,
    });
  }

  flyBackOrigin() {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        114.013494,
        22.52697,
        784.4412259321042,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(-10),
        pitch: Cesium.Math.toRadians(-24),
        roll: Cesium.Math.toRadians(0.0),
      },
    });
  }
}

export default Point;
