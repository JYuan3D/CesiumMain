import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import { hotImage } from './setHotImage';
import styles from './index.less';

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

      hotImage(viewer, [
        [114.04791000075653, 22.555729630860288],
        [114.05473601091819, 22.555649869894058],
        [114.05917204427469, 22.553909000077024],
        [114.05071809301175, 22.55873561787898],
        [114.05746908068056, 22.558735579245266],
        [114.04949802444767, 22.553133436895692],
        [114.05653401698744, 22.55336745042134],
        [114.0542110371694, 22.546570866514674]
      ]);

      setIsLoadedViewer(true);
    }
  }, []);


  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <button>参数</button>
      </div>
    </>
  );
}
