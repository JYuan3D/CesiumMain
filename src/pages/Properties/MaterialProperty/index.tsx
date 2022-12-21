import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const setPoint = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
  color: Cesium.Color,
) => {
  viewer.entities.add({
    position: position,
    point: {
      color: color,
      pixelSize: 20,
    },
  });
};

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const blueBoxRef = useRef<any>();
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

  const setColorMaterialProperty = (targetEntity: Cesium.Entity) => {
    targetEntity.box!.material = new Cesium.ColorMaterialProperty(
      new Cesium.Color(0, 1, 0),
    );
    // 以上代码等同于
    // targetEntity.box!.material = new Cesium.Color(0, 1, 0);
  };

  const setDynamicColorMaterialProperty = (targetEntity: Cesium.Entity) => {
    let colorProperty = new Cesium.SampledProperty(Cesium.Color);

    colorProperty.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
      new Cesium.Color(0, 1, 0),
    );

    colorProperty.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
      new Cesium.Color(0, 0, 1),
    );

    targetEntity.box!.material = new Cesium.ColorMaterialProperty(
      colorProperty,
    );
  };

  const setImageMaterialProperty = (targetEntity: Cesium.Entity) => {
    targetEntity.box!.material = new Cesium.ImageMaterialProperty({
      image: require('./wall.png'),
      repeat: new Cesium.Cartesian2(1, 1),
      color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      transparent: true,
    });
  };

  const setGridMaterialProperty = (targetEntity: Cesium.Entity) => {
    targetEntity.box!.material = new Cesium.GridMaterialProperty({
      color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      cellAlpha: 0.1,
      lineCount: new Cesium.Cartesian2(8, 8),
      lineThickness: new Cesium.Cartesian2(1, 1),
      lineOffset: new Cesium.Cartesian2(0, 0),
    });
  };

  const setStripeMaterialProperty = (targetEntity: Cesium.Entity) => {
    targetEntity.box!.material = new Cesium.StripeMaterialProperty({
      orientation: Cesium.StripeOrientation.HORIZONTAL,
      evenColor: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      oddColor: new Cesium.Color(0.0, 1.0, 0.0, 0.1),
      offset: 6,
      repeat: 10,
    });
  };

  const setCheckerboardMaterialProperty = (targetEntity: Cesium.Entity) => {
    targetEntity.box!.material = new Cesium.CheckerboardMaterialProperty({
      evenColor: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      oddColor: new Cesium.Color(0.0, 1.0, 0.0, 0.1),
      repeat: new Cesium.Cartesian2(2, 2.0),
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
            onClick={() => setColorMaterialProperty(blueBoxRef.current)}
          >
            设置Box ColorMaterialProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setDynamicColorMaterialProperty(blueBoxRef.current)}
          >
            设置Box Dynamic ColorMaterialProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setImageMaterialProperty(blueBoxRef.current)}
          >
            设置Box ImageMaterialProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setGridMaterialProperty(blueBoxRef.current)}
          >
            设置Box GridMaterialProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setStripeMaterialProperty(blueBoxRef.current)}
          >
            设置Box StripeMaterialProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setCheckerboardMaterialProperty(blueBoxRef.current)}
          >
            设置Box CheckerboardMaterialProperty
          </Button>
        </div>
      </div>
    </>
  );
}
