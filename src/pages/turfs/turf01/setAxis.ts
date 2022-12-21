import { Cesium } from '@sl-theia/vis';

export const setAxis = (
  viewer: Cesium.Viewer,
  startPosition: Cesium.Cartesian3,
  width?: number,
) => {
  const ellipsoid = viewer.scene.globe.ellipsoid;
  let position = ellipsoid.cartesianToCartographic(startPosition);
  let newStartPosition = Cesium.Cartographic.toCartesian(position);
  const hprRollZero = new Cesium.HeadingPitchRoll();
  const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    newStartPosition,
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
      width: width || 10.0,
    }),
  );
};
