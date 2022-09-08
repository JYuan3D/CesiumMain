import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

import EllipsoidFadeMaterialEntity from './EllipsoidFadeMaterialEntity';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const ellipsoidFadeRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [isShow, setIsShow] = useState(true);
  const [axis, setAxis] = useState(300);

  useEffect(() => {
    if (!isLoadedViewer) {
      let osm = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/',
      });

      const viewer = new Cesium.Viewer(cesiums.current, {
        imageryProvider: osm,
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

      ellipsoidFadeRef.current = new EllipsoidFadeMaterialEntity(
        viewer,
        Cesium.Cartesian3.fromDegrees(104.0, 30.0, 100.0),
      );

      viewer.zoomTo(ellipsoidFadeRef.current.instance);

      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (movement: any) {
        // 通过camera的getPickRay，将当前的屏幕坐标转为ray（射线）
        let ray = viewer.camera.getPickRay(movement.position) as Cesium.Ray;
        const cartesian = viewer.scene.globe.pick?.(
          ray,
          viewer.scene,
        ) as Cesium.Cartesian3;
        // 将笛卡尔坐标转化为弧度坐标
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        // 将弧度坐标转换为经纬度坐标
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        ellipsoidFadeRef.current?.setPosition([longitude, latitude]);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      setIsLoadedViewer(true);
    }
  }, []);

  useEffect(() => {
    ellipsoidFadeRef.current.setShow(isShow);
  }, [isShow]);

  useEffect(() => {
    ellipsoidFadeRef.current.setAxis(axis);
  }, [axis]);

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => setIsShow(!isShow)}>
          {isShow ? '显示' : '隐藏'}
        </button>
        <button onClick={() => setAxis(300)}>范围（300米）</button>
        <button onClick={() => setAxis(600)}>范围（600米）</button>
        <button onClick={() => setAxis(900)}>范围（900米）</button>
      </div>
    </>
  );
}
