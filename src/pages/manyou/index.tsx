import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import RoamView from './RoamView';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const roamViewRef = useRef<any>(null);
  const TrackPositions = [
    [109.05832893717263, 37.441496598851096],
    [109.05855416786699, 37.44130123438769],
    [109.05870506545179, 37.44117238850958],
    [109.05846290755761, 37.441001906200626],
    [109.05874862898264, 37.440730473795476],
    [109.0591362027828, 37.4403901883947],
    [109.05955264270231, 37.4400282830198],
    [109.05976466627452, 37.43986533373868],
    [109.06019447304337, 37.43953151809137],
    [109.06050060518912, 37.439282109667204],
    [109.06073920090172, 37.43909640541291],
    [109.06102095626935, 37.43887990938909],
    [109.06126114614219, 37.43905268010351],
    [109.0615923854886, 37.43932891714282],
    [109.06114978051788, 37.43970657237644],
    [109.06078572833964, 37.44000168113979],
    [109.06027780474928, 37.44042583498669],
    [109.0598968978716, 37.440729305287476],
    [109.05936770987917, 37.441168572826626],
    [109.05904603542216, 37.44142781800953],
    [109.0587449465546, 37.44119249116668],
    [109.05845600554856, 37.441396645980845],
  ];

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
          2000.0,
        ),
      });

      roamViewRef.current = new RoamView(viewer);
      const scratch = new Cesium.Matrix4();
      const matrix3Scratch = new Cesium.Matrix3();
      viewer.scene.preRender.addEventListener(() => {
        // console.warn('渲染侦听处理...........');
        roamViewRef.current.render(scratch, matrix3Scratch);
      });

      setIsLoadedViewer(true);
    }
  }, []);

  const toStart = () => {
    roamViewRef.current.setRoamCameraOffset(90, 0, 50);
    roamViewRef.current.setRoamSpeed(3);
    roamViewRef.current.setRoamTrack(TrackPositions);
    roamViewRef.current.playRoam();
  };

  const toQuit = () => {
    roamViewRef.current.stopRoam();
  };

  const toGoon = () => {
    roamViewRef.current.playRoam();
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button onClick={() => toStart()}>播放</button>
        <button onClick={() => toQuit()}>停止</button>
        <button onClick={() => toGoon()}>继续</button>
      </div>
    </>
  );
}
