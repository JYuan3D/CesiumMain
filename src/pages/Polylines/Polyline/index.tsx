import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { setFlyLine } from './setFlyLine';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [hasLine1, setHasLine1] = useState<any>(null);
  const [hasLine2, setHasLine2] = useState<any>(null);
  const [hasLine3, setHasLine3] = useState<any>(null);
  const [hasLine4, setHasLine4] = useState<any>(null);

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

      setIsLoadedViewer(true);
    }
  }, []);

  const flytoPrimitive = (viewer: Cesium.Viewer, primitive: any) => {
    const boundingSphere = primitive._boundingSpheres[0];
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: 1.5,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0.0),
        Cesium.Math.toRadians(-80.0),
        8000000,
      ),
      complete: () => {},
    });
  };

  const drawLine1 = (viewer: Cesium.Viewer) => {
    if (!hasLine1) {
      let positions = [];
      let colors = [];

      for (let i = 0; i < 40; ++i) {
        positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 6.0));
        colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
      }

      const primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          // 几何实例
          geometry: new Cesium.SimplePolylineGeometry({
            positions: positions,
            colors: colors,
          }),
        }),
        appearance: new Cesium.PerInstanceColorAppearance({
          // 几何外观
          flat: true,
          renderState: {
            lineWidth: Math.min(40.0, viewer.scene.maximumAliasedLineWidth),
          },
        }),
      });
      viewer.scene.primitives.add(primitive);
      primitive.readyPromise.then(() => {
        flytoPrimitive(viewer, primitive);
      });
      setHasLine1(primitive);
    } else {
      flytoPrimitive(viewer, hasLine1);
      console.warn('路线已创建');
    }
  };

  const drawLine2 = (viewer: Cesium.Viewer) => {
    if (!hasLine2) {
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

      for (let i = 0; i < allNumber; ++i) {
        let alpha = 0;
        if (i < allNumber / 2) {
          alpha = (i / allNumber) * 2 * 0.6 + 0.2;
        } else {
          alpha = ((allNumber - i) / allNumber) * 2 * 0.6 + 0.2;
        }
        colors.push(
          Cesium.Color.fromRandom({
            red: 0.0,
            green: 1.0,
            blue: 0.0,
            alpha: alpha,
          }),
        );
      }

      const primitive = viewer.scene.primitives.add(
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
      setFlyLine(viewer, positions);
      primitive.readyPromise.then(() => {
        flytoPrimitive(viewer, primitive);
      });
      setHasLine2(primitive);
    } else {
      flytoPrimitive(viewer, hasLine2);
      console.warn('路线已创建');
    }
  };

  const drawLine3 = (viewer: Cesium.Viewer) => {
    if (!hasLine3) {
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

      const primitive = viewer.scene.primitives.add(
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
      primitive.readyPromise.then(() => {
        flytoPrimitive(viewer, primitive);
      });
      setHasLine3(primitive);
    } else {
      flytoPrimitive(viewer, hasLine3);
      console.warn('路线已创建');
    }
  };

  const drawLine4 = (viewer: Cesium.Viewer) => {
    if (!hasLine4) {
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

      const primitive = viewer.scene.primitives.add(
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
      primitive.readyPromise.then(() => {
        flytoPrimitive(viewer, primitive);
      });
      setHasLine4(primitive);
    } else {
      flytoPrimitive(viewer, hasLine4);
      console.warn('路线已创建');
    }
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => drawLine1(viewerRef.current)}>
            Draw Line1
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => drawLine2(viewerRef.current)}>
            Draw Line2
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => drawLine3(viewerRef.current)}>
            Draw Line3
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => drawLine4(viewerRef.current)}>
            Draw Line4
          </Button>
        </div>
      </div>
    </>
  );
}
