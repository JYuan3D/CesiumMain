import { Cesium } from '@sl-theia/vis';
import createPropertyDescriptor from './createPropertyDescriptor';
import getValueOrClonedDefault from './getValueOrClonedDefault';

function PolylineTrailLinkMaterialProperty(color, duration) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = color;
  this.duration = duration;
  this._time = new Date().getTime();
}

Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
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

PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
  return 'PolylineTrailLink';
};

PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
  console.warn("更新")
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = getValueOrClonedDefault(
    this._color,
    time,
    Cesium.Color.WHITE,
    result.color,
  );
  result.image = './colors.png';
  result.time =
    ((new Date().getTime() - this._time) % this.duration) / this.duration;
  return result;
};

PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
    (other instanceof PolylineTrailLinkMaterialProperty &&
      Cesium.Property.equals(this._color, other._color))
  );
};

export default PolylineTrailLinkMaterialProperty;
