import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import { setFlyLine } from './setFlyLine'
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const length = 100;
  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        selectionIndicator: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      viewerRef.current = viewer;
      viewer.scene.postProcessStages.fxaa.enabled = true;

      // 取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      // 设置homebutton的位置
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        // Rectangle(west, south, east, north)
        110.15,
        34.54,
        110.25,
        34.56,
      );
      // 设置初始位置
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 3000000),
      });

      let controls = [];
      controls.push(
        Cesium.Cartesian3.fromDegrees(120.11551237582385, 35.97934910503657),
      );
      controls.push(Cesium.Cartesian3.fromDegrees(122.1367529, 36.9629172));
      controls.push(Cesium.Cartesian3.fromDegrees(124.1367529, 35.9629172));

      // drawLine1(viewer);
      // drawLine2(viewer);
      drawLine3(viewer);
      // drawLine4(viewer);

      setIsLoadedViewer(true);
    }
  }, []);

  const drawLine1 = (viewer: Cesium.Viewer) => {
    let positions = [];
    let colors = [];

    for (let i = 0; i < 40; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 6.0));
      colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
    }

    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.SimplePolylineGeometry({
            positions: positions,
            colors: colors,
          }),
        }),
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          renderState: {
            lineWidth: Math.min(4.0, viewer.scene.maximumAliasedLineWidth),
          },
        }),
      }),
    );
  };

  const drawLine2 = (viewer: Cesium.Viewer) => {
    let positions = [];
    let colors = [];
    const number1 = 60;
    const number2 = 30;
    const number3 = 60;
    const number4 = 30;
    const allNumber = 60 + 30 + 60 + 30;
    for (let i = 0; i < number1; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-110.0 + i, -15.0));
    }

    for (let i = 0; i < number2; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-110.0 + 60, -15.0 + i));
    }

    for (let i = 0; i < number3; ++i) {
      positions.push(
        Cesium.Cartesian3.fromDegrees(-110.0 + 60 - i, -15.0 + 30),
      );
    }

    for (let i = 0; i < number4; ++i) {
      positions.push(
        Cesium.Cartesian3.fromDegrees(-110.0 + 60 - 60, -15.0 + 30 - i),
      );
    }

    console.warn('positions.length', positions.length);
    console.warn('allNumber', allNumber);
    for (let i = 0; i < allNumber; ++i) {
      let alpha = 0;
      if (i < allNumber / 2) {
        alpha = (i / allNumber) * 2 * 0.6 + 0.2;
      } else {
        alpha = ((allNumber - i) / allNumber) * 2 * 0.6 + 0.2;
      }
      console.warn('alpha', alpha);
      colors.push(
        Cesium.Color.fromRandom({
          red: 0.0,
          green: 1.0,
          blue: 0.0,
          alpha: alpha,
        }),
      );
    }

    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: 8.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: colors,
            colorsPerVertex: true,
          }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
      }),
    );

    setFlyLine(viewer, positions)
  };

  const drawLine3 = (viewer: Cesium.Viewer) => {
    let positions = [];
    for (let i = 0; i < 40; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 10.0));
    }

    let image = require('./colors.png');
    let material = new Cesium.Material({
      fabric: {
        type: 'EmissionMap',
        uniforms: {
          image: image,
          repeat: {
            x: 1,
            y: 1,
          },
        },
        components: {
          diffuse: 'texture2D(image, materialInput.st).rgb',
          alpha: 'texture2D(image, materialInput.st).a',
        },
      },
      translucent: function () {
        return true;
      },
    });

    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: 8.0,
            vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: material,
        }),
      }),
    );
  };

  const drawLine4 = (viewer: Cesium.Viewer) => {
    let positions = [];
    let colors = [];
    for (let i = 0; i < 40; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 12.0));
      colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
    }

    for (let i = 0; i < 40; ++i) {
      positions.push(Cesium.Cartesian3.fromDegrees(-100 + 39, 12.0 + i));
      colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
    }

    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: positions,
            width: 4.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: colors,
          }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
      }),
    );
  };

  return <div className={styles.container} ref={cesiums}></div>;
}
