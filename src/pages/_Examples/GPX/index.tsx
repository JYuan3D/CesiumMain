import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesium = useRef<any>(null);
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const pinBuilder = new Cesium.PinBuilder();

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesium.current, {
        terrainProvider: Cesium.createWorldTerrain(),
      });

      viewerRef.current = viewer;
      setIsLoadedViewer(true);
    }
  }, []);

  const onSelectTrackWithWaypoints = (viewer: Cesium.Viewer) => {
    reset(viewer);
    viewer.dataSources
      .add(
        Cesium.GpxDataSource.load('./SampleData/gpx/lamina.gpx', {
          clampToGround: true,
        }),
      )
      .then(function (dataSource) {
        viewer.flyTo(dataSource.entities);
      });
  };

  const onSelectRoute = (viewer: Cesium.Viewer) => {
    // const headingPitchRange = new Cesium.HeadingPitchRange(
    //   Cesium.Math.toRadians(0),
    //   Cesium.Math.toRadians(-90),
    //   10000,
    // );
    reset(viewer);
    viewer.dataSources
      .add(
        Cesium.GpxDataSource.load('./SampleData/gpx/route.gpx', {
          clampToGround: true,
        }),
      )
      .then(function (dataSource) {
        viewer.flyTo(dataSource.entities);
      });
  };

  const onSelectWaypoints = (viewer: Cesium.Viewer) => {
    reset(viewer);
    viewer.dataSources
      .add(
        Cesium.GpxDataSource.load('./SampleData/gpx/wpt.gpx', {
          clampToGround: true,
        }),
      )
      .then(function (dataSource) {
        viewer.flyTo(dataSource.entities);
      });
  };

  const onSelectMultipleTracksWithWaypoints = (viewer: Cesium.Viewer) => {
    reset(viewer);
    viewer.dataSources
      .add(
        Cesium.GpxDataSource.load('./SampleData/gpx/complexTrk.gpx', {
          clampToGround: true,
        }),
      )
      .then(function (dataSource) {
        viewer.flyTo(dataSource.entities);
      });
  };

  const onSelectSymbologyOptions = (viewer: Cesium.Viewer) => {
    reset(viewer);
    viewer.dataSources
      .add(
        Cesium.GpxDataSource.load('./SampleData/gpx/lamina.gpx', {
          clampToGround: true,
          // @ts-ignore;
          trackColor: Cesium.Color.YELLOW,
          // @ts-ignore;
          waypointImage: pinBuilder.fromMakiIconId(
            'bicycle',
            Cesium.Color.BLUE,
            48,
          ),
        }),
      )
      .then(function (dataSource) {
        viewer.flyTo(dataSource.entities);
      });
  };

  const reset = (viewer: Cesium.Viewer) => {
    viewer.dataSources.removeAll();
    viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
  };

  return (
    <>
      <div className={styles.container} ref={cesium}></div>
      <div className={styles.btnWrap}>
        <button onClick={() => onSelectTrackWithWaypoints(viewerRef.current)}>
          Track with Waypoints（携带路标的航迹）
        </button>
        <button onClick={() => onSelectRoute(viewerRef.current)}>
          Route（路线）
        </button>
        <button onClick={() => onSelectWaypoints(viewerRef.current)}>
          Waypoints（路点）
        </button>
        <button
          onClick={() => onSelectMultipleTracksWithWaypoints(viewerRef.current)}
        >
          Multiple Tracks with Waypoints（携带路标的多条航迹）
        </button>
        <button onClick={() => onSelectSymbologyOptions(viewerRef.current)}>
          Symbology Options（符号选项）
        </button>
      </div>
    </>
  );
}
