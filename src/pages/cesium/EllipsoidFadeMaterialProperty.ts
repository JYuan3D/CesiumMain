import { Cesium } from '@sl-theia/vis';
import createPropertyDescriptor from './createPropertyDescriptor';
import getValueOrClonedDefault from './getValueOrClonedDefault';

/*
  流动纹理线
  color 颜色
  duration 持续时间 毫秒
*/
function EllipsoidFadeMaterialProperty(color, duration) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this.color = color;
  this.duration = duration;
  this._time = new Date().getTime();
}

// Object.defineProperties() 方法直接在一个对象上定义新的属性或修改现有属性，并返回该对象。
Object.defineProperties(EllipsoidFadeMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: createPropertyDescriptor('color'),
});
EllipsoidFadeMaterialProperty.prototype.getType = function (time) {
  return 'EllipsoidFade';
};
EllipsoidFadeMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = getValueOrClonedDefault(
    this._color,
    time,
    Cesium.Color.WHITE,
    result.color,
  );

  result.time =
    ((new Date().getTime() - this._time) % this.duration) / this.duration;
  return result;
};
EllipsoidFadeMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
    (other instanceof EllipsoidFadeMaterialProperty &&
      Cesium.Property.equals(this._color))
  );
};

export default EllipsoidFadeMaterialProperty;
