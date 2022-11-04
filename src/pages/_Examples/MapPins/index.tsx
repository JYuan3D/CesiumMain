import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesium = useRef<any>(null);
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesium.current, {
        timeline: false,
        animation: false,
      });

      // PinBuilder: 一个实用程序类，用于将自定义地图图钉生成为画布元素。
      const pinBuilder = new Cesium.PinBuilder();

      const bluePin = viewer.entities.add({
        name: 'Blank blue pin', // 空白蓝色PIN
        position: Cesium.Cartesian3.fromDegrees(-75.170726, 39.9208667),
        billboard: {
          image: pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });

      const questionPin = viewer.entities.add({
        name: 'Question mark', // 问题标识
        position: Cesium.Cartesian3.fromDegrees(-75.1698529, 39.9220071),
        billboard: {
          image: pinBuilder.fromText('?', Cesium.Color.BLACK, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });

      const url = Cesium.buildModuleUrl(require('./img/grocery.png'));
      const groceryPin = Promise.resolve(
        pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48),
      ).then(function (canvas) {
        return viewer.entities.add({
          name: 'Grocery store', // 杂货店
          position: Cesium.Cartesian3.fromDegrees(-75.1705217, 39.921786),
          billboard: {
            image: canvas.toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
        });
      });

      // 从maki图标集创建一个代表医院的红色PIN
      const hospitalPin = Promise.resolve(
        pinBuilder.fromMakiIconId('hospital', Cesium.Color.RED, 48),
      ).then(function (canvas) {
        return viewer.entities.add({
          name: 'Hospital',
          position: Cesium.Cartesian3.fromDegrees(-75.1698606, 39.9211275),
          billboard: {
            image: canvas.toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
        });
      });

      // 由于某些管脚是异步创建的，请在缩放之前等待它们全部加载
      Promise.all([bluePin, questionPin, groceryPin, hospitalPin]).then(
        function (pins) {
          viewer.zoomTo(pins);
        },
      );

      viewerRef.current = viewer;
      // viewer.scene.globe.enableLighting = true;
      setIsLoadedViewer(true);
    }
  }, []);

  return (
    <>
      <div className={styles.container} ref={cesium}></div>
      <div className={styles.btnWrap}>
        <button>按钮</button>
      </div>
    </>
  );
}
