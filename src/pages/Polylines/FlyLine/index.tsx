import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import { computeFlyline } from './computeFlyline';
import styles from './index.less';
import { setFlylineMaterial } from './setFlylineMaterial';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
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
        destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 4000000),
      });

      addFlyline(viewer);
      setIsLoadedViewer(true);
    }
  }, []);

  const addFlyline = (viewer: Cesium.Viewer) => {
    // 创建长方体对象
    const PolylineGeometry = new Cesium.PolylineGeometry({
      positions: computeFlyline(),
      width: 2,
    });
    const instance = new Cesium.GeometryInstance({
      geometry: PolylineGeometry,
      id: 'flyline',
    });
    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance: setFlylineMaterial(),
        releaseGeometryInstances: false,
        compressVertices: false,
      }),
    );
  };

  return <div className={styles.container} ref={cesiums}></div>;
}
