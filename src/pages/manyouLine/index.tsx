import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Popup from './dom/Popup';
import Tab from './dom/Tab';
import styles from './index.less';
import Point from './Point';
import RoamLine from './RoamLine';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const roamLineRef = useRef<any>();
  const pointRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [lineNamePos, setLineNamePos] = useState<number[]>([]);

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
      pointRef.current = new Point(viewer);

      viewer.clock.onTick.addEventListener((clock: any) => {
        pointRef.current.render(viewer, clock);
      });
      setIsLoadedViewer(true);
    }
  }, []);

  const startDrawLine = () => {
    roamLineRef.current.openDrawLine();
  };

  const deleteDrawLine = () => {
    roamLineRef.current.destroy();
    pointRef.current.destroy();
  };

  const createLineTab = () => {
    let positions = roamLineRef.current.getPath();
    let startPos = positions[0];
    let endPos = positions[positions.length - 1];
    let lineNamePos;
    if (positions.length >= 3) {
      if (positions.length % 2 === 0) {
        let index = positions.length / 2;
        lineNamePos = [
          (positions[index - 1][0] + positions[index][0]) / 2,
          (positions[index - 1][1] + positions[index][1]) / 2,
        ];
      } else {
        let index = (positions.length - 1) / 2;
        lineNamePos = [positions[index][0], positions[index][1]];
      }
    } else {
      lineNamePos = [
        (startPos[0] + endPos[0]) / 2,
        (startPos[1] + endPos[1]) / 2,
      ];
    }
    console.warn('[lineNamePos]', lineNamePos);
    pointRef.current.addPointIcon(
      viewerRef.current,
      startPos,
      () => {
        return ReactDOMServer.renderToStaticMarkup(
          <Tab
            warpStyle={{
              width: 119,
              height: 41,
              paddingBottom: 3,
            }}
            name={'起点'}
            bg={'起点bg.png'}
          />,
        );
      },
      [-80, 20],
    );
    pointRef.current.addPointIcon(
      viewerRef.current,
      endPos,
      () => {
        return ReactDOMServer.renderToStaticMarkup(
          <Tab
            warpStyle={{
              width: 119,
              height: 41,
              paddingBottom: 3,
            }}
            name={'终点'}
            bg={'终点bg.png'}
          />,
        );
      },
      [80, 20],
    );
    setLineNamePos(lineNamePos);
    setIsShowPopup(true);
  };

  const createLineNameTab = (position: number[], name: string) => {
    pointRef.current.addPointIcon(
      viewerRef.current,
      position,
      () => {
        return ReactDOMServer.renderToStaticMarkup(
          <Tab
            warpStyle={{
              width: 203,
              height: 75,
              paddingBottom: 15,
            }}
            contentStyle={{
              fontWeight: 400,
              fontFamily: 'SourceHanSansCN-Regular',
              letterSpacing: 0,
            }}
            name={name}
            bg={'路标bg.png'}
          />,
        );
      },
      [0, 0],
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.cesium} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => startDrawLine()}>绘制路径</button>
        <button onClick={() => deleteDrawLine()}>删除路径</button>
        <button onClick={() => createLineTab()}>创建路标</button>
      </div>
      {isShowPopup && (
        <Popup
          wrapClassName={styles.popup}
          onConfirm={(name: string) => {
            createLineNameTab(lineNamePos, name ? name : '未命名');
            setIsShowPopup(false);
          }}
          onClose={() => {
            setIsShowPopup(false);
          }}
        />
      )}
    </div>
  );
}
