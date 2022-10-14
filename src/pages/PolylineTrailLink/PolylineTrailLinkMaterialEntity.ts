import { Cesium } from '@sl-theia/vis';

import PolylineTrailLinkMaterialProperty from './PolylineTrailLinkMaterialProperty';

Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;

const PolylineTrailLinkType = 'PolylineTrailLink';

const PolylineTrailLinkImage = './colors.png';

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
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initInstance();
  }

  initInstance() {
    this.instance = this.setInstance();
  }

  setInstance(): Cesium.Entity {
    let entity = new Cesium.Entity({
      name: 'PolylineTrail',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          78.14473433271054, 39.519094301687126, 1000, 108.29490332070186,
          24.28096440338249, 1000, 134.08730679410138, 49.149581652474076, 1000,
        ]),
        width: 15,
        material: new Cesium.PolylineTrailLinkMaterialProperty(
          Cesium.Color.ORANGE,
          3000,
        ),
      },
    });

    return entity;
  }
}

export default PolylineTrailLinkMaterialEntity;
