import { Cesium } from '@sl-theia/vis';
import PolylineTrailLinkMaterialProperty from './PolylineTrailLinkMaterialProperty';

const PolylineTrailLinkType = 'PolylineTrailLink';
const PolylineTrailLinkImage = './static/img/link/colors.png';
const PolylineTrailLinkSource =
  'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
  {\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    vec2 st = materialInput.st;\n\
    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
    material.alpha = colorImage.a * color.a;\n\
    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
    return material;\n\
  }';
Cesium.Material._materialCache.addMaterial(PolylineTrailLinkType, {
  fabric: {
    type: PolylineTrailLinkType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
      image: PolylineTrailLinkImage,
      time: 0,
    },
    source: PolylineTrailLinkSource,
  },
  translucent: function () {
    return true;
  },
});

class PolylineTrailLinkMaterialEntity {
  viewer: Cesium.Viewer;
  instance: Cesium.Entity | undefined;
  constructor(viewer: Cesium.Viewer, positions: Cesium.Cartesian3[]) {
    this.viewer = viewer;
    this.initInstance(positions);
  }

  initInstance(positions: Cesium.Cartesian3[]) {
    this.instance = this.setInstance(positions);
  }

  setInstance(positions: Cesium.Cartesian3[]): Cesium.Entity {
    let entity = new Cesium.Entity({
      name: 'PolylineTrail',
      polyline: {
        positions: positions,
        width: 10,
        material: new PolylineTrailLinkMaterialProperty(
          Cesium.Color.GREEN,
          3000,
        ),
      },
    });

    return entity;
  }
}

export default PolylineTrailLinkMaterialEntity;
