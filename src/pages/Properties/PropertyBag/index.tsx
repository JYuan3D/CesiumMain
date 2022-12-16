import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const blueBoxRef = useRef<any>();
  const redBoxRef = useRef<any>();
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
        timeline: true, //是否显示时间线控件
        animation: true, //是否显示动画控件
        shouldAnimate: true,
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      viewerRef.current = viewer;

      let start = Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z');
      let stop = Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z');
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 5000 * 4;
      viewer.timeline.zoomTo(start, stop);

      setIsLoadedViewer(true);
    }
  }, []);

  const setBlueBox = (viewer: Cesium.Viewer) => {
    if (!blueBoxRef.current) {
      let blueBox = viewer.entities.add({
        id: 'blueBox',
        name: 'Blue box',
        position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0),
        box: {
          dimensions: new Cesium.Cartesian3(40000.0, 30000.0, 50000.0),
          material: Cesium.Color.BLUE,
          outline: true,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        path: {
          show: true,
        },
      });
      blueBoxRef.current = blueBox;
      flytoEntity(viewer, blueBox);
    } else {
      flytoEntity(viewer, blueBoxRef.current);
    }
  };

  const flytoEntity = (viewer: Cesium.Viewer, targetEntity: any) => {
    let headingPitchRange = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-45),
      500000,
    );
    // 视角定位
    viewer.flyTo(targetEntity, {
      duration: 1,
      offset: headingPitchRange,
    });
  };

  const setPropertyBag = (targetEntity: Cesium.Entity) => {
    let zp = new Cesium.SampledProperty(Number);
    zp.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
      200000.0,
    );
    zp.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
      700000.0,
    );

    targetEntity.box!.dimensions = new Cesium.PropertyBag({
      x: 40000.0,
      y: 30000.0,
      z: zp,
    });
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => setBlueBox(viewerRef.current)}>
            蓝色Box
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setPropertyBag(blueBoxRef.current)}
          >
            设置Box ReferenceProperty
          </Button>
        </div>
      </div>
    </>
  );
}
