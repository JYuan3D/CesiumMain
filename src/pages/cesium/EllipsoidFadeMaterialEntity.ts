import { Cesium } from '@sl-theia/vis';

import EllipsoidFadeMaterialProperty from './EllipsoidFadeMaterialProperty';

Cesium.EllipsoidFadeMaterialProperty = EllipsoidFadeMaterialProperty;

const EllipsoidFadeType = 'EllipsoidFade';

const EllipsoidFadeSource =
  'czm_material czm_getMaterial(czm_materialInput materialInput)\n' +
  '{\n' +
  'czm_material material = czm_getDefaultMaterial(materialInput);\n' +
  'material.diffuse = 1.5 * color.rgb;\n' +
  'vec2 st = materialInput.st;\n' +
  // 扩散中心
  'float dis = distance(st, vec2(0.5, 0.5));\n' +
  'float per = fract(time);\n' +
  'if(dis > per * 0.5){\n' +
  'material.alpha = 0.0;\n' +
  'discard;\n' +
  '} else {\n' +
  'material.alpha = color.a  * 0.5;\n' +
  '}\n' +
  'return material;\n' +
  '}';

Cesium.Material._materialCache.addMaterial(EllipsoidFadeType, {
  fabric: {
    type: EllipsoidFadeType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 1),
      time: 0,
    },
    source: EllipsoidFadeSource,
  },
  translucent: function () {
    return true;
  },
});

function ByDirectionAndLen(position: any, angle: any, len: any) {
  let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle || 0));
  let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  Cesium.Matrix4.multiply(matrix, rotationZ, matrix);
  let result = Cesium.Matrix4.multiplyByPoint(
    matrix,
    new Cesium.Cartesian3(0, len, 0),
    new Cesium.Cartesian3(),
  );
  return result;
}

class EllipsoidFadeMaterialEntity {
  viewer: Cesium.Viewer;
  position: Cesium.Cartesian3;
  instance: Cesium.Entity | undefined;
  subInstance: Cesium.Entity | undefined;
  frontIconEntity: Cesium.Entity | undefined;
  sideIconEntity: Cesium.Entity | undefined;
  constructor(viewer: Cesium.Viewer, position: Cesium.Cartesian3) {
    this.viewer = viewer;
    this.position = position;
    this.initInstance(viewer, [104.0, 30.0]);
    this.initIcon(viewer, [104.0, 30.0]);
  }

  initInstance(viewer: Cesium.Viewer, pos: number[]) {
    let posCartesian3 = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 0.0);
    this.instance = this.setInstance(posCartesian3, 300.0);
    this.subInstance = this.setInstance(posCartesian3, 300.0 * 0.6);
    viewer.entities.add(this.instance);
    viewer.entities.add(this.subInstance);
  }

  setInstance(
    posCartesian3: Cesium.Cartesian3,
    axisValue: number,
  ): Cesium.Entity {
    let rippleEllipseGraphics = new Cesium.EllipseGraphics({
      height: 0,
      semiMinorAxis: axisValue,
      semiMajorAxis: axisValue,
      material: new Cesium.EllipsoidFadeMaterialProperty(
        Cesium.Color.fromAlpha(Cesium.Color.ORANGE, 0.2),
        6000,
      ),
    });

    let entity = new Cesium.Entity({
      position: posCartesian3,
      ellipse: rippleEllipseGraphics,
    });

    return entity;
  }

  initIcon(viewer: Cesium.Viewer, pos: number[]) {
    let lonValue = pos[0];
    let latValue = pos[1];
    const point_1 = Cesium.Cartesian3.fromDegrees(lonValue, latValue); // 原点
    const point_2 = ByDirectionAndLen(point_1, 90, 206 / 2); // 右点（东边）
    let cartographic_2 = Cesium.Cartographic.fromCartesian(point_2);
    let longitude_2 = Cesium.Math.toDegrees(cartographic_2.longitude);

    const point_3 = ByDirectionAndLen(point_1, 270, 206 / 2); // 左点（西边）
    let cartographic_3 = Cesium.Cartographic.fromCartesian(point_3);
    let longitude_3 = Cesium.Math.toDegrees(cartographic_3.longitude);

    const point_4 = ByDirectionAndLen(point_1, 0, 206 / 2 - 2); // 上点（北边）
    let cartographic_4 = Cesium.Cartographic.fromCartesian(point_4);
    let latitude_4 = Cesium.Math.toDegrees(cartographic_4.latitude);

    const point_5 = ByDirectionAndLen(point_1, 180, 206 / 2 + 2); // 下点（南边）
    let cartographic_5 = Cesium.Cartographic.fromCartesian(point_5);
    let latitude_5 = Cesium.Math.toDegrees(cartographic_5.latitude);

    this.frontIconEntity = this.setIcon(
      Cesium.Cartesian3.fromDegreesArray([
        longitude_3,
        latValue,
        longitude_2,
        latValue,
      ]),
    );

    this.sideIconEntity = this.setIcon(
      Cesium.Cartesian3.fromDegreesArray([
        lonValue + 0.00004,
        latitude_4,
        lonValue + 0.00004,
        latitude_5,
      ]),
    );

    viewer.entities.add(this.frontIconEntity);
    viewer.entities.add(this.sideIconEntity);
  }

  setIcon(positions: Cesium.Cartesian3[]): Cesium.Entity {
    let image = new Image(206, 168);
    image.src = './static/img/bubble/body_light.png';

    let imageMaterialProperty = new Cesium.ImageMaterialProperty({
      image: image,
      repeat: new Cesium.Cartesian2(1, 1),
      transparent: true,
    });
    let iconGraphics = new Cesium.WallGraphics({
      positions: positions,
      maximumHeights: [168, 168],
      minimumHeights: [0, 0],
      outline: false,
      outlineColor: Cesium.Color.LIGHTGRAY,
      outlineWidth: 4,
      material: imageMaterialProperty,
    });
    let iconEntity = new Cesium.Entity({
      wall: iconGraphics,
    });
    return iconEntity;
  }

  setShow(status: boolean) {
    this.instance!.show = status;
    this.subInstance!.show = status;
    this.frontIconEntity!.show = status;
    this.sideIconEntity!.show = status;
  }

  setAxis(axisLength: number) {
    this.instance?.ellipse?.semiMinorAxis?.setValue(axisLength);
    this.instance?.ellipse?.semiMajorAxis?.setValue(axisLength);
    this.subInstance?.ellipse?.semiMinorAxis?.setValue(axisLength * 0.6);
    this.subInstance?.ellipse?.semiMajorAxis?.setValue(axisLength * 0.6);
  }

  setPosition(pos: number[]) {
    this.setInstancePosition(pos);
    this.setIconPosition(pos);
  }

  setInstancePosition(pos: number[]) {
    let posCartesian3 = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 0.0);
    this.instance!.position?.setValue(posCartesian3);
    this.subInstance!.position?.setValue(posCartesian3);
  }

  setIconPosition(pos: number[]) {
    let lonValue = pos[0];
    let latValue = pos[1];
    const point_1 = Cesium.Cartesian3.fromDegrees(lonValue, latValue); // 原点
    const point_2 = ByDirectionAndLen(point_1, 90, 206 / 2); // 右点（东边）
    let cartographic_2 = Cesium.Cartographic.fromCartesian(point_2);
    let longitude_2 = Cesium.Math.toDegrees(cartographic_2.longitude);

    const point_3 = ByDirectionAndLen(point_1, 270, 206 / 2); // 左点（西边）
    let cartographic_3 = Cesium.Cartographic.fromCartesian(point_3);
    let longitude_3 = Cesium.Math.toDegrees(cartographic_3.longitude);

    const point_4 = ByDirectionAndLen(point_1, 0, 206 / 2 - 2); // 上点（北边）
    let cartographic_4 = Cesium.Cartographic.fromCartesian(point_4);
    let latitude_4 = Cesium.Math.toDegrees(cartographic_4.latitude);

    const point_5 = ByDirectionAndLen(point_1, 180, 206 / 2 + 2); // 下点（南边）
    let cartographic_5 = Cesium.Cartographic.fromCartesian(point_5);
    let latitude_5 = Cesium.Math.toDegrees(cartographic_5.latitude);

    let frontIconEntityCartesian3Arr = Cesium.Cartesian3.fromDegreesArray([
      longitude_3,
      latValue,
      longitude_2,
      latValue,
    ]);

    let sideIconEntityCartesian3Arr = Cesium.Cartesian3.fromDegreesArray([
      lonValue + 0.00004,
      latitude_4,
      lonValue + 0.00004,
      latitude_5,
    ]);

    this.frontIconEntity?.wall?.positions?.setValue(
      frontIconEntityCartesian3Arr,
    );
    this.sideIconEntity?.wall?.positions?.setValue(sideIconEntityCartesian3Arr);
  }
}

export default EllipsoidFadeMaterialEntity;
