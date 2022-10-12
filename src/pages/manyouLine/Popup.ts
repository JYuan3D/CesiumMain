import { Cesium } from '@sl-theia/vis';
import { isArray } from '@sl-theia/theia-utils';

const EntityRemove = (viewer: any, entitArr: any[]) => {
  entitArr.forEach((item: any) =>
    isArray(item) ? EntityRemove(viewer, item) : viewer.entities.remove(item),
  );
};

const PrimitiveRemove = (primitive: any) => {
  primitive.removeAll();
};

const Popup = function (info: any) {
  this.constructor(info);
};

Popup.prototype.id = 0;
Popup.prototype.constructor = function (info: any) {
  const _this = this;
  _this.viewer = info.viewer; //弹窗创建的viewer
  _this.geometry = info.geometry; //弹窗挂载的位置
  _this.id = 'popup_' + _this.__proto__.id++;
  _this.ctn = document.createElement('div');
  _this.ctn.setAttribute('id', _this.id);
  _this.ctn.innerHTML = 'x';
  document.body.append(_this.ctn);
  document.getElementById(_this.id)?.addEventListener('click', () => {
    // console.warn('[info.entity]:', info.entity);
    EntityRemove(_this.viewer, info.entity);
    if (info.primitive) PrimitiveRemove(info.primitive);
    _this.ctn.remove();
  });

  _this.render(_this.geometry, info.scale);
  _this.eventListener = _this.viewer.clock.onTick.addEventListener(function () {
    _this.render(_this.geometry, info.scale);
  });
};
Popup.prototype.render = function (geometry: any, scale?: any) {
  const _this = this;
  if (!geometry || !_this.viewer?.scene) return;
  try {
    const position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      _this.viewer.scene,
      geometry,
    );
    if (position && Cesium.defined(position)) {
      _this.ctn.style.cssText = `
      position:absolute;
      left: ${scale ? position.x * scale.scaleX : position.x}px; 
      top: ${scale ? position.y * scale.scaleY : position.y}px; 
      font-size:25px;
      line-height:20px;
      height:20px;
      color:rgba(250, 200, 75, 1);
      cursor: pointer;
    `;
    }
  } catch (e) {
    console.warn('报错信息', e);
  }
};

Popup.prototype.close = function () {
  const _this = this;
  _this.ctn.remove();
  _this.viewer.clock.onTick.removeEventListener(_this.eventListener);
};

export default Popup;
