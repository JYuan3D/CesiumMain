import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        terrainProvider: Cesium.createWorldTerrain(),
      });
      viewerRef.current = viewer;

      const scene: Cesium.Scene = viewer.scene;
      const clock: Cesium.Clock = viewer.clock;

      let entity: Cesium.Entity | undefined;
      let positionProperty: Cesium.PositionProperty | undefined;
      const dataSourcePromise = Cesium.CzmlDataSource.load(
        './SampleData/ClampToGround.czml',
      );

      viewer.dataSources.add(dataSourcePromise).then(function (dataSource) {
        entity = dataSource.entities.getById('CesiumMilkTruck');
        positionProperty = entity!.position;
      });

      const tileset: Cesium.Cesium3DTileset = scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(40866),
        }),
      );
      console.warn('[tileset]:', tileset);

      viewer.camera.setView({
        destination: new Cesium.Cartesian3(
          1216403.8845586285,
          -4736357.493351395,
          4081299.715698949,
        ),
        orientation: new Cesium.HeadingPitchRoll(
          4.2892217081808806,
          -0.4799070147502502,
          6.279789177843313,
        ),
        endTransform: Cesium.Matrix4.IDENTITY,
      });

      if (scene.clampToHeightSupported) {
        tileset.initialTilesLoaded.addEventListener(start);
      } else {
        window.alert('This browser does not support clampToHeight.');
      }

      function start() {
        clock.shouldAnimate = true;
        const objectsToExclude = [entity];
        scene.postRender.addEventListener(function () {
          const position = positionProperty!.getValue(clock.currentTime);
          // console.warn('[position]:', position);
          // @ts-ignore;
          entity.position = scene.clampToHeight(position, objectsToExclude);
        });
      }

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
