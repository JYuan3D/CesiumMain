import { Cesium } from '@sl-theia/vis';
import * as turf from '@turf/turf';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const [alongLine, setAlongLine] = useState<any>(null);
  const [polygonArea, setPolygonArea] = useState<number>(0);

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesiums.current, {
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        selectionIndicator: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        fullscreenButton: false,
      });
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewerRef.current = viewer;
      setIsLoadedViewer(true);
    }
  }, []);

  const drawAlongLine = (viewer: Cesium.Viewer) => {
    if (!alongLine) {
      let positions = [
        [109.502991, 29.68718],
        [108.837829, 32.969237],
        [113.567871, 37.200787],
      ];
      let line = turf.lineString(positions);

      let along = turf.along(line, 300, { units: 'miles' });
      let promise = Cesium.GeoJsonDataSource.load(along);
      promise.then((dataSource: Cesium.GeoJsonDataSource) => {
        viewer.dataSources.add(dataSource);
        setAlongLine(dataSource);
        viewer.flyTo(dataSource, {
          offset: new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(-20.0),
            Cesium.Math.toRadians(-30.0),
            2000000,
          ),
        });
      });

      let bbox = turf.bbox(line);
      let bboxPolygon = turf.bboxPolygon(bbox);
      let bboxPolygonPromise = Cesium.GeoJsonDataSource.load(bboxPolygon, {
        stroke: Cesium.Color.HOTPINK,
        fill: Cesium.Color.PINK,
      });
      bboxPolygonPromise.then((dataSource: Cesium.GeoJsonDataSource) => {
        viewer.dataSources.add(dataSource);
      });

      drawLine(viewer, positions);
    } else {
      console.warn('[alongLine]已存在!');
      viewer.flyTo(alongLine, {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(35.0),
          Cesium.Math.toRadians(-35.0),
          3000000,
        ),
      });
    }
  };

  const drawLine = (viewer: Cesium.Viewer, positions: any[]) => {
    let cartesian3Positions = [];
    let colors = [];
    const length = positions.length;
    for (let i = 0; i < positions.length; ++i) {
      let position = positions[i];
      cartesian3Positions.push(
        Cesium.Cartesian3.fromDegrees(position[0], position[1], 100),
      );
    }

    for (let i = 0; i < length; ++i) {
      colors.push(
        Cesium.Color.fromRandom({
          red: 0.0,
          green: 1.0,
          blue: 0.0,
          alpha: 1.0,
        }),
      );
    }

    viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: cartesian3Positions,
            width: 20.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: colors,
            colorsPerVertex: true,
          }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
      }),
    );
  };

  const drawPolygon = (viewer: Cesium.Viewer) => {
    if (!polygonArea) {
      let positions = [
        [108.09876, 37.200787],
        [106.398901, 33.648651],
        [114.972103, 33.340483],
        [113.715685, 37.845557],
        [108.09876, 37.200787],
      ];
      let polygon = turf.polygon([positions]);

      let area = turf.area(polygon);
      console.warn('[area]:', area);
      setPolygonArea(area);
      drawLine(viewer, positions);
    }
  };

  return (
    <>
      <div className={styles.container} ref={cesiums}></div>
      <div className={styles.btnWrap} style={{ top: 8 }}>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => {
              drawAlongLine(viewerRef.current);
            }}
          >
            计算沿长点
          </Button>
        </div>
        <div className={styles.btnItem} style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => {
              drawPolygon(viewerRef.current);
            }}
          >
            计算区域面积
          </Button>
        </div>
      </div>
    </>
  );
}
