import { Cesium } from '@sl-theia/vis';
import Point from './Point';

class ManyouPoint extends Point {
  viewer: any;
  monitorEntitysParents: any[];
  monitorEntitysPopup: any[];
  monitorEntitys: any[];
  constructor(viewer: Cesium.Viewer) {
    super(viewer);
    this.viewer = viewer;
    this.monitorEntitysParents = [];
    this.monitorEntitysPopup = [];
    this.monitorEntitys = [];
  }

  addPointIcon(data: any[], tag: string, url: string): void {
    let parentId = `Manyou_Billboard_Parent_${tag}`;
    if (!this.viewer.entities.getById(parentId)) {
      this.monitorEntitysPopup.push({
        name: parentId,
        activeChildName: '',
        status: false,
      });
      let monitorEntitysParent = this.viewer.entities.add(
        new Cesium.Entity({
          id: parentId,
          show: true,
        }),
      );
      this.monitorEntitysParents.push({
        id: parentId,
        entities: monitorEntitysParent,
      });
      data.forEach((item: any, index: number) => {
        let id = `Manyou_Billboard_Icon_${tag}_${index}`;
        this.setPointIcon(
          this.viewer,
          monitorEntitysParent,
          id,
          item,
          url,
          tag,
        );
      });
    } else {
      console.warn('该Entity已经存在', parentId);
    }
  }

  private setPointIcon(
    viewer: Cesium.Viewer,
    monitorEntitysParent: any,
    id: string,
    position: any,
    url: string,
    tag: string,
  ) {
    if (!viewer.entities.getById(id)) {
      // console.warn('该Entity不存在', id);
      let monitorEntity = viewer.entities.add({
        parent: monitorEntitysParent,
        id: id,
        name: id,
        position: position,
        billboard: {
          // 图像地址，URI或Canvas的属性
          image: url,
          // 设置颜色和透明度
          color: Cesium.Color.WHITE.withAlpha(1),
          // 高度（以像素为单位）
          height: 72,
          // 宽度（以像素为单位）
          width: 41,
          scaleByDistance: new Cesium.NearFarScalar(0, 0.3, 3000, 1.0),
        },
        properties: {
          tag: tag,
        },
      });
      this.monitorEntitys.push(monitorEntity);
    } else {
      console.warn('该Entity已经存在', id);
    }
  }

  public setShow(tag: string) {
    this.monitorEntitysParents.forEach((monitorEntitysParent: any) => {
      if (monitorEntitysParent.id === `Manyou_Billboard_Parent_${tag}`) {
        monitorEntitysParent.entities.show = true;
      } else {
        monitorEntitysParent.entities.show = false;
      }
    });
  }

  public setHide() {
    this.monitorEntitysParents.forEach((monitorEntitysParent: any) => {
      monitorEntitysParent.entities.show = false;
    });
  }

  public onClickEvent(viewer: Cesium.Viewer, scale: any, cb: Function): void {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement: { position: any }) {
      if (scale) {
        movement.position.x = movement.position.x / scale.scaleX;
        movement.position.y = movement.position.y / scale.scaleY;
      }
      let pick = viewer.scene.pick(movement.position);
      console.warn('点击pick:', pick);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  public onHandlePopup(
    parentId: string,
    id: string,
    position: Cesium.Cartesian3,
    distance: number,
    cb: Function,
  ) {
    this.monitorEntitysPopup.forEach((popup: any) => {
      if (popup.name === parentId) {
        if (!popup.status && distance < 50) {
          console.warn('请打开....');
          popup.status = true;
          popup.activeChildName = id;
          cb(true, position);
        } else if (
          popup.status &&
          distance > 100 &&
          popup.activeChildName === id
        ) {
          console.warn('请关闭....');
          popup.status = false;
          cb(false, position);
        }
      }
    });
  }

  render(modelPosition: Cesium.Cartesian3, cb: Function) {
    if (this.monitorEntitys.length > 0) {
      this.monitorEntitys.forEach((targetEntity: Cesium.Entity) => {
        // @ts-ignore;
        let targetEntityPosition = targetEntity.position._value;
        let distance = Cesium.Cartesian3.distance(
          modelPosition,
          targetEntityPosition,
        );
        let parentId = targetEntity._parent._id;
        let id = targetEntity._id;
        if (parentId === 'Manyou_Billboard_Parent_摆摊') {
          this.onHandlePopup(parentId, id, targetEntityPosition, distance, cb);
        }
      });
    }
  }
}

export default ManyouPoint;
