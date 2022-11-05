import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
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

      var controls = [];
      controls.push(
        Cesium.Cartesian3.fromDegrees(120.11551237582385, 35.97934910503657),
      );
      controls.push(Cesium.Cartesian3.fromDegrees(122.1367529, 36.9629172));
      controls.push(Cesium.Cartesian3.fromDegrees(124.1367529, 35.9629172));

      setHermiteSpline(viewer, controls);

      setIsLoadedViewer(true);
    }
  }, []);

  const setHermiteSpline = (viewer: Cesium.Viewer, controls: any[]) => {
    //创建多段线和每段颜色
    const positions = [];
    const colors = [];
    for (let j = 0; j <= 50; j += 5) {
      positions.push(
        Cesium.Cartesian3.fromDegrees(-124.0 + j, 40, 50000.0 * (j % 10)),
      );
      colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
    }
    //设置线段的位置和颜色，一一对应，arcType为ArcType.NONE
    const perSegmentPolyline = new Cesium.GeometryInstance({
      geometry: new Cesium.SimplePolylineGeometry({
        positions: positions,
        colors: colors,
        arcType: Cesium.ArcType.NONE,
      }),
    });
    //使用逐顶点着色绘制多段线
    //对于逐顶点着色，将colorsPerVertex选项设置为true，并为colors选项提供长度等于位置数的颜色数组
    const perVertexPolyline = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray([-100, 40, -80, 30]),
        colors: [Cesium.Color.RED, Cesium.Color.BLUE],
        colorsPerVertex: true,
      }),
    });
    //添加多段线instances到primitives
    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [perSegmentPolyline, perVertexPolyline],
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          renderState: {
            lineWidth: Math.min(2.0, viewer.scene.maximumAliasedLineWidth),
          },
        }),
      }),
    );
  };

  return <div className={styles.container} ref={cesiums}></div>;
}
