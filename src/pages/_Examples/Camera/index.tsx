import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesium = useRef<any>(null);
  const viewerRef = useRef<any>();
  const sceneRef = useRef<any>();
  const referenceFramePrimitiveRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesium.current, {
        terrainProvider: Cesium.createWorldTerrain(),
      });

      viewerRef.current = viewer;
      sceneRef.current = viewer.scene;
      setIsLoadedViewer(true);
    }
  }, []);

  const flyInACity = (scene: Cesium.Scene) => {
    const camera = scene.camera;
    camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        -73.98580932617188,
        40.74843406689482,
        363.34038727246224,
      ),
      complete: function () {
        setTimeout(function () {
          camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              -73.98585975679403,
              40.75759944127251,
              186.50838555841779,
            ),
            orientation: {
              heading: Cesium.Math.toRadians(200.0),
              pitch: Cesium.Math.toRadians(-50.0),
            },
            easingFunction: Cesium.EasingFunction.LINEAR_NONE,
          });
        }, 1000);
      },
    });
  };

  const setReferenceFrame = (viewer: Cesium.Viewer, scene: Cesium.Scene) => {
    const center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    // 东北向上框架视图
    const camera = viewer.camera;
    camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
    camera.lookAtTransform(
      // 使用目标和变换矩阵设置相机的位置和方向
      transform,
      new Cesium.Cartesian3(-120000.0, -120000.0, 120000.0),
    );

    // 显示参考框架（不需要）
    referenceFramePrimitiveRef.current = scene.primitives.add(
      new Cesium.DebugModelMatrixPrimitive({
        modelMatrix: transform,
        length: 100000.0,
      }),
    );
  };

  const flyToRectangle = (viewer: Cesium.Viewer) => {
    const west = -90.0;
    const south = 38.0;
    const east = -87.0;
    const north = 40.0;
    const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

    viewer.camera.flyTo({
      destination: rectangle,
    });

    // Show the rectangle.  Not required; just for show.
    viewer.entities.add({
      rectangle: {
        coordinates: rectangle,
        fill: false,
        outline: true,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 10,
      },
    });
  };

  const viewRectangle = (viewer: Cesium.Viewer) => {
    const west = -77.0;
    const south = 38.0;
    const east = -72.0;
    const north = 42.0;

    const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
    viewer.camera.setView({
      destination: rectangle,
    });

    // Show the rectangle.  Not required; just for show.
    viewer.entities.add({
      rectangle: {
        coordinates: rectangle,
        fill: false,
        outline: true,
        outlineColor: Cesium.Color.WHITE,
      },
    });
  };

  return (
    <>
      <div className={styles.container} ref={cesium}></div>
      <div className={styles.btnWrap}>
        <button onClick={() => flyInACity(sceneRef.current)}>
          Fly in a city
        </button>
        <button
          onClick={() => setReferenceFrame(viewerRef.current, sceneRef.current)}
        >
          Set camera reference frame
        </button>
        <button onClick={() => flyToRectangle(viewerRef.current)}>
          Fly to Rectangle
        </button>
        <button onClick={() => viewRectangle(viewerRef.current)}>
          View a Rectangle
        </button>
      </div>
    </>
  );
}
