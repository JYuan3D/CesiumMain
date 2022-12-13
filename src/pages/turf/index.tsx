import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { setOriginPoint } from './setOriginPoint';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

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
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewerRef.current = viewer;
      setPoint(viewer, [109.502991, 29.68718, 200]);
      setFlyToBoundingSphereOrigin(viewer, [109.502991, 29.68718, 200]);
      setIsLoadedViewer(true);
    }
  }, []);

  const setPoint = (viewer: Cesium.Viewer, position: number[]) => {
    let positionCartesian3 = Cesium.Cartesian3.fromDegrees(
      position[0],
      position[1],
      position[2],
    );
    setOriginPoint(viewer, positionCartesian3);
  };

  const setFlyToBoundingSphereOrigin = (
    viewer: Cesium.Viewer,
    position: number[],
  ) => {
    let positionCartesian3 = Cesium.Cartesian3.fromDegrees(
      position[0],
      position[1],
      position[2],
    );
    const boundingSphere = new Cesium.BoundingSphere(positionCartesian3, 30);
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: 1.5,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0.0),
        Cesium.Math.toRadians(-45.0),
        300,
      ),
      complete: () => {},
    });
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
    </>
  );
}
