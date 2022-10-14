import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

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

      let curCanvas = 'a';
      let i = 0;
      function drawCanvasImage(time, result) {
        let canvas = document.getElementById('canvas-' + curCanvas);
        let cwidth = 700;
        let cheight = 100;
        let ctx = canvas.getContext('2d');
        let img = new Image();
        img.src = './static/img/link/arrow.png';
        ctx.clearRect(0, 0, cwidth, cheight);
        img.onload = function () {
          if (i <= cwidth) {
            ctx.drawImage(img, i, 0);
          } else i = 0;
          i += 3;
        };
        curCanvas = curCanvas === 'a' ? 'b' : 'a';
        return canvas;
      }

      viewer.entities.add({
        name: 'Rotating rectangle with rotating texture coordinate',
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(-90.0, 30.0, -70.0, 35.0),
          height: 100000,
          material: new Cesium.ImageMaterialProperty({
            image: new Cesium.CallbackProperty(drawCanvasImage, false),
            transparent: true,
          }),
        },
      });

      viewer.zoomTo(viewer.entities);

      setIsLoadedViewer(true);
    }
  }, []);

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <canvas
        id="canvas-a"
        className={styles.canvas}
        width="700"
        height="100"
      ></canvas>
      <canvas
        id="canvas-b"
        className={styles.canvas}
        width="700"
        height="100"
      ></canvas>
    </>
  );
}
