import { Cesium } from '@sl-theia/vis';
import EventEmitter from './EventEmitter';

class Popup extends EventEmitter {
  _panelContainer: any;
  _contentContainer: any;
  _contentContainerHtml: any;

  offset: any;
  position: any;

  _renderListener: any;
  _viewer: any;

  constructor(options: any) {
    super();
    this.offset = options.offset || [0, 0];
    this.closeHander = this.closeHander.bind(this);
  }

  setPosition(cartesian3: any) {
    this.position = cartesian3;
  }

  setHTML(createHtmlFunc: Function) {
    this._contentContainerHtml = createHtmlFunc();
  }

  addTo(viewer: any) {
    if (this._viewer) this.remove();
    this._viewer = viewer;
    this.initPanle();
    //关闭按钮
    this._panelContainer.addEventListener('click', this.closeHander, false);
    if (this.position) {
      this._panelContainer.style.display = 'block';
      // postRender: 获取将在场景渲染后立即引发的事件。
      // 事件的订阅者接收场景实例作为第一个参数，当前时间作为第二个参数。
      this._renderListener = this._viewer.scene.postRender.addEventListener(this.render, this);
    }
  }

  initPanle() {
    this._panelContainer = document.createElement('div');
    this._panelContainer.style.position = 'absolute';
    this._panelContainer.style.display = 'none';

    // popup容器的内容
    this._contentContainer = document.createElement('div');
    this._contentContainer.innerHTML = this._contentContainerHtml;
    this._panelContainer.appendChild(this._contentContainer);

    this._viewer.cesiumWidget.container.appendChild(this._panelContainer);
    // @ts-ignore
    this.trigger('open', ['打开']);
    // console.warn('打开弹窗');
  }

  render() {
    var geometry = this.position;
    if (!geometry) return;
    var position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this._viewer.scene, geometry);
    if (!position) {
      return;
    }
    if (this._panelContainer) {
      this._panelContainer.style.left =
        position.x - this._panelContainer.offsetWidth / 2 + this.offset[0] + 'px';
      this._panelContainer.style.top =
        position.y - this._panelContainer.offsetHeight - 10 + this.offset[1] + 'px';
    }
  }

  setOffset(offset: any) {
    this.offset = offset;
  }

  closeHander() {
    this.remove();
  }

  remove() {
    this._panelContainer.removeEventListener('click', this.closeHander, false);

    if (this._contentContainer) {
      this._contentContainer.parentNode.removeChild(this._contentContainer);
      this._contentContainer = null;
    }

    if (this._panelContainer) {
      this._panelContainer.parentNode.removeChild(this._panelContainer);
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
    // console.warn('关闭弹窗');
  }
}

export default Popup;
