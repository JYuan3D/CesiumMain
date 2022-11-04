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

      setLinearSpline(viewer, controls);
      setCatmullRomSpline(viewer, controls);
      setHermiteSpline(viewer, controls);

      setIsLoadedViewer(true);
    }
  }, []);

  const setLinearSpline = (viewer: Cesium.Viewer, controls: any[]) => {
    for (var i = 0; i < controls.length; i++) {
      viewer.entities.add({
        position: controls[i],
        point: {
          color: Cesium.Color.RED,
          pixelSize: 10,
        },
      });
    }
    viewer.zoomTo(viewer.entities);

    var spline = new Cesium.LinearSpline({
      times: [0.0, 0.5, 1],
      points: controls,
    });

    var positions = [];
    for (var i = 0; i <= length; i++) {
      var cartesian3 = spline.evaluate(i / length);
      positions.push(cartesian3);
      viewer.entities.add({
        position: cartesian3,
        point: {
          color: Cesium.Color.YELLOW,
          pixelSize: 6,
        },
      });
    }

    viewer.entities.add({
      name: 'LinearSpline',
      polyline: {
        positions: positions,
        width: 3,
        material: Cesium.Color.GREEN,
      },
    });
  };

  const setCatmullRomSpline = (viewer: Cesium.Viewer, controls: any[]) => {
    var spline = new Cesium.CatmullRomSpline({
      points: controls,
      times: [0.0, 0.5, 1],
    });

    var positions = [];
    for (var i = 0; i <= length; i++) {
      var cartesian3 = spline.evaluate(i / length);
      positions.push(cartesian3);
      viewer.entities.add({
        position: cartesian3,
        point: {
          color: Cesium.Color.BLUE,
          pixelSize: 6,
        },
      });
    }

    viewer.entities.add({
      name: 'CatmullRomSpline',
      polyline: {
        positions: positions,
        width: 3,
        material: Cesium.Color.WHITE,
      },
    });
  };

  const setHermiteSpline = (viewer: Cesium.Viewer, controls: any[]) => {
    // HermiteSpline
    var spline = Cesium.HermiteSpline.createNaturalCubic({
      times: [0.0, 0.5, 1],
      points: controls,
    });

    var positions = [];
    for (var i = 0; i <= length; i++) {
      var cartesian3 = spline.evaluate(i / length);
      positions.push(cartesian3);
      viewer.entities.add({
        position: cartesian3,
        point: {
          color: Cesium.Color.WHITE,
          pixelSize: 6,
        },
      });
    }

    viewer.entities.add({
      name: 'HermiteSpline',
      polyline: {
        positions: positions,
        width: 3,
        material: Cesium.Color.RED,
      },
    });
  };

  return <div className={styles.container} ref={cesiums}></div>;
}
