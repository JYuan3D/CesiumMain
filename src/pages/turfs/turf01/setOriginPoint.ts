import { Cesium } from '@sl-theia/vis';
import { setAxis } from './setAxis';

// 参数为什么类型,可根据函数API去传参
// len(单位:m)
// 返回的类型可根据API转换坐标即可
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

// 参数为什么类型,可根据函数API去传参
// Height(单位:m)
// 返回的类型可根据API转换坐标即可
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

const setPoint = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
  color: Cesium.Color,
) => {
  viewer.entities.add({
    position: position,
    point: {
      color: color,
      pixelSize: 50,
    },
  });
};

export const setOriginPoint = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
) => {
  let nextPosCartesian3 = ByDirectionAndLen(position, 0, 100);
  let prevPosCartesian3 = ByDirectionAndLen(position, 180, 100);
  let leftPosCartesian3 = ByDirectionAndLen(position, 90, 100);
  let rightPosCartesian3 = ByDirectionAndLen(position, -90, 100);
  let upPosCartesian3 = ByDirectionAndHeight(position, 90, 100);
  let downPosCartesian3 = ByDirectionAndHeight(position, -90, 100);
  setPoint(viewer, position, Cesium.Color.PALETURQUOISE);
  setPoint(viewer, nextPosCartesian3, Cesium.Color.RED);
  setPoint(viewer, prevPosCartesian3, Cesium.Color.BLUE);
  setPoint(viewer, leftPosCartesian3, Cesium.Color.GREEN);
  setPoint(viewer, rightPosCartesian3, Cesium.Color.YELLOW);
  setPoint(viewer, upPosCartesian3, Cesium.Color.WHITE);
  setPoint(viewer, downPosCartesian3, Cesium.Color.BLACK);
  setAxis(viewer, position, 5);
};
