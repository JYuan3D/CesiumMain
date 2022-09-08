import { Cesium } from '@sl-theia/vis';
import createPropertyDescriptor from './createPropertyDescriptor';
import getValueOrClonedDefault from './getValueOrClonedDefault';
/*
  流动纹理线
  color 颜色
  duration 持续时间 毫秒
*/

class EllipsoidFadeMaterialProperty {
  _time: number;
  _color: any;
  _colorSubscription: any;
  color: Cesium.Color;
  duration: number;

  constructor(color: Cesium.Color, duration: number) {
    this._time = new Date().getTime();
    this.color = color;
    this.duration = duration;
    this.setInit();
  }

  setInit() {
    console.log("EllipsoidFadeMaterialProperty", this)
    Object.defineProperties(EllipsoidFadeMaterialProperty, {
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
  }

  getType() {
    return 'EllipsoidFade';
  }

  getValue(time: any, result: any) {
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
  }

  equals(other: any) {
    return (
      this === other ||
      (other instanceof EllipsoidFadeMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    );
  }
}

export default EllipsoidFadeMaterialProperty;
