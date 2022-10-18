import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  const threeQuartersView = {
    destination: new Cesium.Cartesian3(
      -1371203.1456494154,
      -5508700.033950869,
      2901802.2749172337,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(67.64973594265429),
      pitch: Cesium.Math.toRadians(-8.158676059409297),
      roll: Cesium.Math.toRadians(359.9999987450017),
    },
    maximumHeight: 100,
  };

  const frontView = {
    destination: new Cesium.Cartesian3(
      -1371214.9554156072,
      -5508700.8494476415,
      2901826.794611029,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(80.5354269423926),
      pitch: Cesium.Math.toRadians(-15.466062969558285),
      roll: Cesium.Math.toRadians(359.9999999526579),
    },
    maximumHeight: 100,
  };

  const topView = {
    destination: new Cesium.Cartesian3(
      -1371190.7755780201,
      -5508732.668834588,
      2901827.2625979027,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(68.29411482061157),
      pitch: Cesium.Math.toRadians(-33.97774554735345),
      roll: Cesium.Math.toRadians(359.9999999298912),
    },
    maximumHeight: 100,
  };

  const upwardsView = {
    destination: new Cesium.Cartesian3(
      -1371052.4616855076,
      -5508691.745389906,
      2901861.440673151,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(236.4536374528137),
      pitch: Cesium.Math.toRadians(-1.3382025460115552),
      roll: Cesium.Math.toRadians(359.9999985917282),
    },
    maximumHeight: 100,
  };

  useEffect(() => {
    if (!isLoadedViewer) {
      const clock = new Cesium.Clock({
        startTime: Cesium.JulianDate.fromIso8601('2017-07-11T00:00:00Z'),
        stopTime: Cesium.JulianDate.fromIso8601('2017-07-11T24:00:00Z'),
        currentTime: Cesium.JulianDate.fromIso8601('2017-07-11T10:00:00Z'),
        clockRange: Cesium.ClockRange.LOOP_STOP,
        clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
        multiplier: 1000,
        shouldAnimate: true,
      });

      const viewer = new Cesium.Viewer(cesiums.current, {
        clockViewModel: new Cesium.ClockViewModel(clock),
        selectionIndicator: false,
        terrainProvider: Cesium.createWorldTerrain(),
      });

      viewerRef.current = viewer;

      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      const position = new Cesium.Cartesian3(
        -1371108.6511167218,
        -5508684.080096612,
        2901825.449865087,
      );
      const heading = Cesium.Math.toRadians(180);
      const pitch = Cesium.Math.toRadians(2);
      const roll = Cesium.Math.toRadians(-6);
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr,
      );

      const entity = viewer.entities.add({
        name: 'truck',
        position: position,
        orientation: orientation,
        model: {
          uri: './SampleData/models/GroundVehicle/GroundVehicle.glb',
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          minimumPixelSize: 128,
          maximumScale: 20,
          scale: 8.0,
          runAnimations: false,
        },
      });

      viewer.scene.camera.flyTo({
        destination: frontView.destination,
        orientation: frontView.orientation,
        duration: 5.0,
        pitchAdjustHeight: 20,
      });

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
