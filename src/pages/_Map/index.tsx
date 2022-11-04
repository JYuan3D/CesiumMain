import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import Layer from './Layer';

export default function Map(props: any) {
  const cesium = useRef<any>(null);
  const viewerRef = useRef<Cesium.Viewer>();
  const layerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);
  const tiles = true ? 'tiles' : 'http://10.253.102.69';
  const map = true ? 'map' : 'http://10.253.102.70';

  useEffect(() => {
    if (!isLoadedViewer) {
      const viewer = new Cesium.Viewer(cesium.current, {
        timeline: false,
        animation: false,
      });
      layerRef.current = new Layer(viewer);
      // 卫星影像
      layerRef.current.setSatelliteLayer(`${tiles}/gw/OGC/Map/SZ_IMG02_2019/`);
      // 3D瓦片
      layerRef.current.set3DTilesLayer(
        // './SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json',
        // `${tiles}/gw/TILE_3D_MODEL/sz/futian_danti_bld/tileset.json`, // 福田单体-建筑物
        // `${tiles}/gw/TILE_3D_MODEL/sz/FTJZ/tileset.json`, // 深圳市福田区建筑模型
        // `${tiles}/gw/TILE_3D_MODEL/sz/shenzhenBM/tileset.json`, // 深圳市白模
        // `${tiles}/gw/TILE_3D_MODEL/sz/shenzhen/tileset.json`, // 深圳市倾斜摄影模型（2020年）
        `${tiles}/gw/TILE_3D_MODEL/sz/futianBM/tileset.json`, // 深圳市福田区白模（2020年）
        (tileset: Cesium.Cesium3DTileset) => {
          // viewer.scene.primitives.add(tileset);
          // viewer.zoomTo(
          //   tileset,
          //   new Cesium.HeadingPitchRange(
          //     0.0,
          //     -0.5,
          //     tileset.boundingSphere.radius * 2.0,
          //   ),
          // );
          // set3DTilesLayerBounding(viewer, tileset);
        },
      );
      // 图层资源
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/JTSS`,
      //   2,
      //   '交通设施(02)',
      //   true,
      //   1,
      // );
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/Road_GS_L`,
      //   2,
      //   '高快速路',
      //   true,
      //   1,
      // );
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/Road_ZGD_L/`,
      //   2,
      //   '主干道',
      //   true,
      //   1,
      // );
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/Road_CGD_L`,
      //   2,
      //   '次干道',
      //   true,
      //   1,
      // );
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/Road_ZL_L`,
      //   2,
      //   '支路',
      //   true,
      //   1,
      // );
      // layerRef.current.setImageryLayer(
      //   `${map}/gw/ESRI/GeoData/Road_Sid_L`,
      //   2,
      //   '车行道边线及立交',
      //   true,
      //   1,
      // );
      viewer.scene.globe.depthTestAgainstTerrain = true;
      // viewer.scene.globe.enableLighting = true;

      viewerRef.current = viewer;
      setIsLoadedViewer(true);
    }
  }, []);

  const setset3DTilesLayerToZoom = (
    viewer: Cesium.Viewer,
    tileset: Cesium.Cesium3DTileset,
  ) => {
    // 瓦片下沉
    viewer.zoomTo(tileset);
    // 将3d tiles离地高度抬升100米
    let cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center,
    );

    let surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0.0,
    );

    let offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      -20.0,
    );

    let translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3(),
    );

    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  };

  const set3DTilesLayerBounding = (
    viewer: Cesium.Viewer,
    tileset: Cesium.Cesium3DTileset,
  ) => {
    // 设置摄像头查看新添加的tileset
    viewer.entities.add({
      position: tileset.boundingSphere.center,
      box: {
        //dimensions: new Cesium.Cartesian3(150.0, 440.0, 1.0),
        dimensions: new Cesium.Cartesian3(
          2 * tileset.boundingSphere.radius,
          2 * tileset.boundingSphere.radius,
          2 * tileset.boundingSphere.radius,
        ),
        material: Cesium.Color.RED.withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.RED,
      },
    });
    // viewer.camera.viewBoundingSphere(
    //   tileset.boundingSphere,
    //   new Cesium.HeadingPitchRange(0, -0.5, 0),
    // );
  };

  return (
    <>
      <div className={styles.container} ref={cesium}></div>
      <div className={styles.btnWrap}>
        <button>按钮</button>
      </div>
    </>
  );
}
