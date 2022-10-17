import { Cesium } from '@sl-theia/vis';
import EventEmitter from './EventEmitter';

class Popup extends EventEmitter {
  offset: any;
  position: any;
  _panelContainer: HTMLElement | null | undefined;
  _viewer: Cesium.Viewer | null | undefined;
  _renderListener: Cesium.Event.RemoveCallback | null | undefined;

  constructor(options: any) {
    super();
    this.offset = options.offset || [0, 0];
  }

  setPosition(cartesian3: any) {
    this.position = cartesian3;
  }

  setHTML(html: HTMLElement) {
    this._panelContainer = html;
  }

  addTo(viewer: Cesium.Viewer) {
    if (this._viewer) this.remove();
    this._viewer = viewer;
    this.initPanle();
    if (this.position) {
      // postRender: 获取将在场景渲染后立即引发的事件。
      // 事件的订阅者接收场景实例作为第一个参数，当前时间作为第二个参数。
      this._renderListener = this._viewer.scene.postRender.addEventListener(
        this.render,
        this,
      );
    }
  }

  initPanle() {
    this._panelContainer!.style.display = 'block';
    // @ts-ignore
    this.trigger('open', ['打开']);
    // console.warn('打开弹窗');
  }

  render() {
    let geometry = this.position;
    if (!geometry) return;
    let position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this._viewer!.scene,
      geometry,
    );
    if (!position) {
      return;
    }
    if (this._panelContainer) {
      this._panelContainer.style.left =
        position.x -
        this._panelContainer.offsetWidth / 2 +
        this.offset[0] +
        'px';
      this._panelContainer.style.top =
        position.y -
        this._panelContainer.offsetHeight -
        10 +
        this.offset[1] +
        'px';
    }
  }

  setOffset(offset: any) {
    this.offset = offset;
  }

  closeHander() {
    this.remove();
  }

  remove() {
    if (this._panelContainer) {
      this._panelContainer!.style.display = 'none';
      this._panelContainer = null;
    }

    if (this._renderListener) {
      this._renderListener();
      this._renderListener = null;
    }

    if (this._viewer) {
      this._viewer = null;
    }
    // @ts-ignore
    this.trigger('close', ['关闭']);
  }
}

export default Popup;
