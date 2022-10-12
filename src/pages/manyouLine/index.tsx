import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import RoamLine from './RoamLine';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const roamLineRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        }),
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
        destination: Cesium.Cartesian3.fromDegrees(
          109.05845600554856,
          37.441396645980845,
          5000.0,
        ),
      });

      roamLineRef.current = new RoamLine(viewer);
      setIsLoadedViewer(true);
    }
  }, []);

  const startDrawLine = () => {
    roamLineRef.current.openDrawLine();
  };

  const gainDrawLine = () => {
    roamLineRef.current.getPath();
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => startDrawLine()}>绘制路径</button>
        <button onClick={() => gainDrawLine()}>获取路径</button>
        <div
          style={{
            // position: 'absolute',
            padding: '0 20px',
            height: 41,
            color: '#fff',
            fontSize: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateX(${0 !== 0 ? '-110%' : '15px'})`,
            background: `url(${require(`./${
              0 > 0 ? 'bgs1' : 'bgs'
            }.png`)}) no-repeat`,
            backgroundSize: '100% 100%',
          }}
        >
          起点
        </div>
      </div>
    </>
  );
}
