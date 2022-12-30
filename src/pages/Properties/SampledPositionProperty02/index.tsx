import { Cesium } from '@sl-theia/vis';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

function computeCirclularFlight(
  viewer: Cesium.Viewer,
  start: Cesium.JulianDate,
  lon: number,
  lat: number,
  radius: number,
): Cesium.SampledPositionProperty {
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i <= 360; i += 45) {
    const radians = Cesium.Math.toRadians(i);
    const time = Cesium.JulianDate.addSeconds(
      start,
      i,
      new Cesium.JulianDate(),
    );
    const position = Cesium.Cartesian3.fromDegrees(
      lon + radius * 1.5 * Math.cos(radians),
      lat + radius * Math.sin(radians),
      // Cesium.Math.nextRandomNumber() * 500 + 1750,
      1 * 500 + 1750,
    );
    property.addSample(time, position);

    //Also create a point for each sample we generate.
    viewer.entities.add({
      position: position,
      point: {
        pixelSize: 8,
        color: Cesium.Color.TRANSPARENT,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 3,
      },
    });
  }
  return property;
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const entityRef = useRef<any>();
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
        terrainProvider: Cesium.createWorldTerrain(),
      });
      viewerRef.current = viewer;

      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // 设置随机数种子以获得一致的结果
      Cesium.Math.setRandomNumberSeed(3);

      const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      const stop = Cesium.JulianDate.addSeconds(
        start,
        360,
        new Cesium.JulianDate(),
      );
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
      viewer.clock.multiplier = 10;
      viewer.timeline.zoomTo(start, stop);

      const position = computeCirclularFlight(
        viewer,
        start,
        -112.110693,
        36.0994841,
        0.03,
      );

      const entity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: start,
            stop: stop,
          }),
        ]),
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        model: {
          // uri: './cesium/models/CesiumAir/Cesium_Air.glb',
          uri: "./static/model/npc/SM_XMH_EM_WRJ_01_GLB.glb",
          minimumPixelSize: 128,
          maximumScale: 128,
        },
        path: {
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.YELLOW,
          }),
          width: 10,
        },
      });

      entityRef.current = entity;

      setIsLoadedViewer(true);
    }
  }, []);

  const setViewTopDown = (viewer: Cesium.Viewer) => {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(
      viewer.entities,
      new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)),
    );
  };

  const setViewSide = (viewer: Cesium.Viewer) => {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(
      viewer.entities,
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(-90),
        Cesium.Math.toRadians(0),
        7500,
      ),
    );
  };

  const setViewAircraft = (viewer: Cesium.Viewer, entity: Cesium.Entity) => {
    viewer.trackedEntity = entity;
  };

  const setLinearApproximation = (entity: Cesium.Entity) => {
    entity.position!.setInterpolationOptions({
      interpolationDegree: 1,
      interpolationAlgorithm: Cesium.LinearApproximation,
    });
  };

  const setLagrangePolynomialApproximation = (entity: Cesium.Entity) => {
    entity.position!.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });
  };

  const setHermitePolynomialApproximation = (entity: Cesium.Entity) => {
    entity.position!.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setViewTopDown(viewerRef.current)}
          >
            View Top Down
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => setViewSide(viewerRef.current)}>
            View Side
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              setViewAircraft(viewerRef.current, entityRef.current)
            }
          >
            View Aircraft
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setLinearApproximation(entityRef.current)}
          >
            Linear Approximation
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              setLagrangePolynomialApproximation(entityRef.current)
            }
          >
            Lagrange Polynomial Approximation
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setHermitePolynomialApproximation(entityRef.current)}
          >
            Hermite Polynomial Approximation
          </Button>
        </div>
      </div>
    </>
  );
}
