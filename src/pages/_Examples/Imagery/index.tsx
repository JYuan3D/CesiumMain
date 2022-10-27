import { Cesium } from '@sl-theia/vis';
import { Slider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesium = useRef<any>(null);
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [inputValue, setInputValue] = useState(0);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesium.current, {
        timeline: false,
        animation: false,
      });

      const layers = viewer.scene.imageryLayers;

      // Set oceans on Bing base layer to transparent
      const baseLayer = layers.get(0);
      baseLayer.colorToAlpha = new Cesium.Color(0.0, 0.016, 0.059);
      baseLayer.colorToAlphaThreshold = 0.2;

      // Add a bump layer with adjustable threshold
      const singleTileLayer = layers.addImageryProvider(
        new Cesium.SingleTileImageryProvider({
          url: require('../images/earthbump1k.jpg'),
          rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
        }),
      );

      singleTileLayer.colorToAlpha = new Cesium.Color(0.0, 0.0, 0.0, 1.0);
      singleTileLayer.colorToAlphaThreshold = 0.1;

      viewerRef.current = viewer;
      // viewer.scene.globe.enableLighting = true;
      setIsLoadedViewer(true);
    }
  }, []);

  const onChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }

    setInputValue(value);
  };

  return (
    <>
      <div className={styles.container} ref={cesium}></div>
      <div className={styles.btnWrap}>
        <Slider
          min={0}
          max={1}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={0.01}
        />
        <button>按钮</button>
      </div>
    </>
  );
}
