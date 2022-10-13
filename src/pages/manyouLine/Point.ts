import { Cesium } from '@sl-theia/vis';

export interface PointInterface {
  viewer: Cesium.Viewer;
}

class Point implements PointInterface {
  viewer: Cesium.Viewer;
  monitorEntitys: any[];
  monitorHtmls: any[];
  monitorHtmlsOffset: any[];
  scratch3dPosition: Cesium.Cartesian3;
  scratch2dPosition: Cesium.Cartesian2;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.monitorEntitys = [];
    this.monitorHtmls = [];
    this.monitorHtmlsOffset = [];
    this.scratch3dPosition = new Cesium.Cartesian3();
    this.scratch2dPosition = new Cesium.Cartesian2();
  }

  public addPointIcon(
    viewer: any,
    position: number[],
    createNameElementCb: Function,
    domOffset: number[],
  ): void {
    this.setPointIcon(viewer, position, createNameElementCb, domOffset);
  }

  private setPointIcon(
    viewer: Cesium.Viewer,
    position: number[],
    createNameElementCb: Function,
    domOffset: number[],
  ) {
    let monitorEntity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(position[0], position[1], 0),
    });
    this.monitorEntitys.push(monitorEntity);
    this.addPointHtml(viewer, createNameElementCb, domOffset);
  }

  private addPointHtml(
    viewer: any,
    createNameElementCb: Function,
    domOffset: number[],
  ) {
    let _self = this;
    let containerDom = document.createElement('div');
    containerDom.style.position = 'absolute';

    let labelDom = document.createElement('div');
    labelDom.innerHTML = createNameElementCb();
    containerDom.appendChild(labelDom);
    _self.setPointHtml(viewer, containerDom, domOffset);
  }

  private setPointHtml(viewer: any, element: HTMLElement, offset: number[]) {
    viewer.container.appendChild(element);
    this.monitorHtmls.push(element);
    this.monitorHtmlsOffset.push(offset);
  }

  public render(viewer: any, clock: any) {
    let position3d;
    let position2d;

    for (let i = 0; i < this.monitorEntitys.length; i++) {
      let entity = this.monitorEntitys[i];
      let element = this.monitorHtmls[i];
      let offset = this.monitorHtmlsOffset[i];

      // 并非所有实体都有位置，需要检查!
      if (entity.position) {
        position3d = entity.position.getValue(
          clock.currentTime,
          this.scratch3dPosition,
        );
      }

      // 移动实体并非每时每刻都有一个位置，需要检查！
      if (position3d) {
        position2d = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          viewer.scene,
          position3d,
          this.scratch2dPosition,
        );
      }

      // 有一个位置并不能保证它在屏幕上，需要检查!
      if (position2d) {
        // 设置 HTML 位置以匹配实体的位置！
        element.style.left =
          position2d.x - element.offsetWidth / 2 + offset[0] + 'px';
        element.style.top =
          position2d.y - element.offsetHeight + offset[1] + 'px';
      }
    }
  }

  public destroy() {
    if (this.monitorEntitys.length > 0) {
      this.monitorEntitys.forEach((entity: Cesium.Entity) => {
        this.viewer.entities.remove(entity);
      });
      this.monitorHtmls.forEach((html: HTMLElement) => {
        this.viewer.container.removeChild(html);
      });
      this.monitorEntitys = [];
      this.monitorHtmls = [];
      this.monitorHtmlsOffset = [];
    }
  }
}

export default Point;
