import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

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

  useEffect(() => {
    if (isLoadedViewer) {
    }
  }, [isLoadedViewer]);

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

  const setDimensionsSampled = (blueBox: Cesium.Entity) => {
    if (blueBox) {
      const property = new Cesium.SampledProperty(Cesium.Cartesian3);

      property.addSample(
        Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
        new Cesium.Cartesian3(40000.0, 30000.0, 50000.0),
      );

      property.addSample(
        Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
        new Cesium.Cartesian3(40000.0, 30000.0, 70000.0),
      );

      blueBox.box!.dimensions = property;
    }
  };

  const setDimensionsTimeIntervalCollection = (blueBox: Cesium.Entity) => {
    if (blueBox) {
      const property = new Cesium.TimeIntervalCollectionProperty();
      property.intervals.addInterval(
        Cesium.TimeInterval.fromIso8601({
          iso8601: '2019-01-01T00:00:00.00Z/2019-01-01T12:00:00.00Z',
          isStartIncluded: true,
          isStopIncluded: false,
          data: new Cesium.Cartesian3(40000.0, 30000.0, 20000.0),
        }),
      );
      property.intervals.addInterval(
        Cesium.TimeInterval.fromIso8601({
          iso8601: '2019-01-01T12:00:01.00Z/2019-01-02T00:00:00.00Z',
          isStartIncluded: true,
          isStopIncluded: false,
          data: new Cesium.Cartesian3(40000.0, 30000.0, 40000.0),
        }),
      );
      property.intervals.addInterval(
        Cesium.TimeInterval.fromIso8601({
          iso8601: '2019-01-02T00:00:01.00Z/2019-01-02T12:00:00.00Z',
          isStartIncluded: true,
          isStopIncluded: false,
          data: new Cesium.Cartesian3(40000.0, 30000.0, 50000.0),
        }),
      );
      property.intervals.addInterval(
        Cesium.TimeInterval.fromIso8601({
          iso8601: '2019-01-02T12:00:01.00Z/2019-01-03T00:00:00.00Z',
          isStartIncluded: true,
          isStopIncluded: true,
          data: new Cesium.Cartesian3(40000.0, 30000.0, 70000.0),
        }),
      );

      blueBox.box!.dimensions = property;
    }
  };

  const setDimensionsConstantProperty = (blueBox: Cesium.Entity) => {
    if (blueBox) {
      const property = new Cesium.ConstantProperty(
        new Cesium.Cartesian3(40000.0, 30000.0, 100000.0),
      );
      blueBox.box!.dimensions = property;
    }
  };

  const setDimensionsCompositeProperty = (blueBox: Cesium.Entity) => {
    // 1 sampledProperty
    const sampledProperty = new Cesium.SampledProperty(Cesium.Cartesian3);
    sampledProperty.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
      new Cesium.Cartesian3(40000.0, 30000.0, 200000.0),
    );

    sampledProperty.addSample(
      Cesium.JulianDate.fromIso8601('2019-01-02T00:00:00.00Z'),
      new Cesium.Cartesian3(40000.0, 30000.0, 40000.0),
    );

    // 2 ticProperty
    const ticProperty = new Cesium.TimeIntervalCollectionProperty();
    ticProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-02T00:00:00.00Z/2019-01-02T06:00:00.00Z',
        isStartIncluded: true,
        isStopIncluded: false,
        data: new Cesium.Cartesian3(40000.0, 30000.0, 40000.0),
      }),
    );
    ticProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-02T06:00:00.00Z/2019-01-02T12:00:00.00Z',
        isStartIncluded: true,
        isStopIncluded: false,
        data: new Cesium.Cartesian3(40000.0, 30000.0, 50000.0),
      }),
    );
    ticProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-02T12:00:00.00Z/2019-01-02T18:00:00.00Z',
        isStartIncluded: true,
        isStopIncluded: false,
        data: new Cesium.Cartesian3(40000.0, 30000.0, 60000.0),
      }),
    );
    ticProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-02T18:00:00.00Z/2019-01-03T23:00:00.00Z',
        isStartIncluded: true,
        isStopIncluded: true,
        data: new Cesium.Cartesian3(40000.0, 30000.0, 70000.0),
      }),
    );

    // 3 compositeProperty
    const compositeProperty = new Cesium.CompositeProperty();
    compositeProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-01T00:00:00.00Z/2019-01-02T00:00:00.00Z',
        data: sampledProperty,
      }),
    );
    compositeProperty.intervals.addInterval(
      Cesium.TimeInterval.fromIso8601({
        iso8601: '2019-01-02T00:00:00.00Z/2019-01-03T00:00:00.00Z',
        isStartIncluded: false,
        isStopIncluded: false,
        data: ticProperty,
      }),
    );

    // 4 设置position
    blueBox.box!.dimensions = compositeProperty;
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
            onClick={() => setDimensionsSampled(blueBoxRef.current)}
          >
            设置Box尺寸Sampled
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              setDimensionsTimeIntervalCollection(blueBoxRef.current)
            }
          >
            设置Box尺寸TimeIntervalCollection
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setDimensionsConstantProperty(blueBoxRef.current)}
          >
            设置Box尺寸ConstantProperty
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setDimensionsCompositeProperty(blueBoxRef.current)}
          >
            设置Box尺寸CompositeProperty
          </Button>
        </div>
      </div>
    </>
  );
}
