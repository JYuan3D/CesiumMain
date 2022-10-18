import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const clock = new Cesium.Clock({
        startTime: Cesium.JulianDate.fromIso8601('2013-12-25'),
        currentTime: Cesium.JulianDate.fromIso8601('2013-12-25'),
        stopTime: Cesium.JulianDate.fromIso8601('2013-12-26'),
        clockRange: Cesium.ClockRange.LOOP_STOP, // loop when we hit the end time
        clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
        multiplier: 4000, // how much time to advance each tick
        shouldAnimate: true, // Animation on by default
      });

      const viewer = new Cesium.Viewer(cesiums.current, {
        clockViewModel: new Cesium.ClockViewModel(clock),
        terrainProvider: Cesium.createWorldTerrain(),
      });

      viewerRef.current = viewer;

      viewer.scene.globe.enableLighting = true;

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
