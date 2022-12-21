import { Cesium } from '@sl-theia/vis';
import getValueOrClonedDefault from './getValueOrClonedDefault';

// 创建ConstantProperty，该值不会随simulation事件而改变
function createConstantProperty(value: any): Cesium.ConstantProperty {
  return new Cesium.ConstantProperty(value);
}

class PolylineTrailLinkMaterialProperty {
  _time: number;
  _definitionChanged: Cesium.Event;
  _color: any;
  _colorSubscription: any;
  duration: number;

  constructor(color: Cesium.Color, duration: number) {
    this._time = new Date().getTime();
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = color;
    this.duration = duration;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  set color(value: any) {
    var oldValue = this['_color'];
    var subscription = this['_colorSubscription'];
    if (Cesium.defined(subscription)) {
      // 查询值是否有订阅事件，有的话就触发
      subscription();
      this['_colorSubscription'] = undefined;
    }

    var hasValue = value !== undefined;
    if (
      hasValue &&
      (!Cesium.defined(value) || !Cesium.defined(value.getValue)) &&
      Cesium.defined(createConstantProperty)
    ) {
      value = createConstantProperty(value);
    }
    if (oldValue !== value) {
      this['_color'] = value;
      // raiseEvent通过使用所有提供的参数，调用每个已注册的侦听器来引发事件
      this._definitionChanged.raiseEvent(this, 'color', value, oldValue);
    }
    if (Cesium.defined(value) && Cesium.defined(value.definitionChanged)) {
      // 注册一个回调函数以在事件引发时执行 - [subscriptionName]事件
      let _self = this;
      _self['_colorSubscription'] = value.definitionChanged.addEventListener(
        function () {
          _self._definitionChanged.raiseEvent(_self, 'color', value, value);
        },
        this,
      );
    }
  }

  get color() {
    return this._color;
  }

  getType() {
    return 'PolylineTrailLink';
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

export default PolylineTrailLinkMaterialProperty;
