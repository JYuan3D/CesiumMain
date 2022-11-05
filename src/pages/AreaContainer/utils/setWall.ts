import { Cesium } from '@sl-theia/vis';

type optionType = {
  color: Cesium.Color;
  show: boolean;
  positions: number[];
  wallHeight: number;
  hasHeight: true;
  maxHeight?: number;
  minHeight?: number;
};

export const drawWall = ({
  viewer,
  option,
}: {
  viewer: Cesium.Viewer;
  option: optionType;
}) => {
  option.positions = [
    ...option.positions,
    option.positions[0],
    option.positions[1],
  ];

  let image = require('./t1.png'), //选择自己的动态材质图片
    color = option.color,
    speed = 0,
    source =
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
         czm_material material = czm_getDefaultMaterial(materialInput);\n\
         vec2 st = materialInput.st;\n\
         vec4 colorImage = texture2D(image, vec2(fract((st.t - 1.0*czm_frameNumber*0.005)), fract(st.t)));\n\
         material.alpha = colorImage.a;\n\
         material.diffuse = (colorImage.rgb)/1.0;\n\
         return material;\n\
     }';

  var wallInstance = new Cesium.GeometryInstance({
    geometry: Cesium.WallGeometry.fromConstantHeights({
      positions: Cesium.Cartesian3.fromDegreesArray(option.positions),
      maximumHeight: 100.0,
      minimumHeight: 20.0,
      // vertexFormat: Cesium.MaterialAppearance.VERTEX_FORMAT,
    }),
  });

  let material = new Cesium.Material({
    fabric: {
      type: 'PolylinePulseLink',
      uniforms: {
        color: color,
        image: image,
        speed: speed,
      },
      source: source,
    },
    translucent: function () {
      return true;
    },
  });

  const Primitive = new Cesium.Primitive({
    geometryInstances: [wallInstance],
    appearance: new Cesium.MaterialAppearance({
      material: material,
    }),
  });
  viewer.scene.primitives.add(Primitive);

  return Primitive;
};
