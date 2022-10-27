import { Cesium } from '@sl-theia/vis';
// @ts-ignore
import { ArcGisMapServerImageryProviderExt } from './ArcGisMapServerImageryProviderExt';

export interface LayerInterface {
  viewer: Cesium.Viewer;
}

class Layer implements LayerInterface {
  viewer: Cesium.Viewer;
  satelliteLayer: Cesium.ImageryLayer | undefined;
  terrainLayer: any;
  tilesLayer: Cesium.Cesium3DTileset | undefined;
  imageryLayers: Cesium.ImageryLayer[] | any[];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.imageryLayers = [];
  }

  setSatelliteLayer(url: string) {
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: url,
    });
    this.satelliteLayer = this.viewer.imageryLayers.addImageryProvider(
      imageryProvider,
      1,
    );
    this.satelliteLayer.name = '卫星影像';
  }

  setSatelliteLayerShow(show: boolean) {
    this.satelliteLayer!.show = show;
  }

  set3DTilesLayer(url: string, cb?: Function) {
    this.tilesLayer = new Cesium.Cesium3DTileset({
      url: url,
    });
    this.tilesLayer.readyPromise
      .then((tileset: Cesium.Cesium3DTileset) => {
        this.viewer.scene.primitives.add(tileset);
        cb && cb(tileset);
        // this.set3DTilesLayerBounding(tileset);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  set3DTilesLayerShow(value: boolean) {
    this.tilesLayer!.show = value;
  }

  setTerrainLayer(url: string) {
    this.terrainLayer = new Cesium.CesiumTerrainProvider({
      url: url,
      requestVertexNormals: true,
    });
    this.viewer.terrainProvider = this.terrainLayer;
  }

  setTerrainLayerShow(value: boolean) {
    if (value) {
      this.viewer.terrainProvider = this.terrainLayer;
      this.viewer.scene.globe.depthTestAgainstTerrain = true;
    } else {
      this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
      this.viewer.scene.globe.depthTestAgainstTerrain = false;
    }
  }

  setImageryLayer(
    url: string,
    index: number,
    name: string,
    show: boolean,
    alpha?: number,
  ) {
    let imageryProvider = null;
    imageryProvider = new ArcGisMapServerImageryProviderExt({
      url: url,
    });
    let imageryLayer: Cesium.ImageryLayer | any =
      this.viewer.imageryLayers.addImageryProvider(imageryProvider, index);
    imageryLayer.name = name;
    imageryLayer.show = Cesium.defaultValue(show, true); // wms图层显示隐藏
    imageryLayer.alpha = Cesium.defaultValue(alpha, 1); // wms图层透明可视
    this.imageryLayers?.push(imageryLayer);
  }

  setImageryLayerShow(name: string, show: boolean) {
    this.imageryLayers?.forEach((imageryLayer: Cesium.ImageryLayer | any) => {
      if (imageryLayer.name === name) {
        imageryLayer.show = Cesium.defaultValue(show, true);
      }
    });
  }

  setImageryLayerAlpha(name: string, show: boolean) {
    this.imageryLayers?.forEach((imageryLayer: Cesium.ImageryLayer | any) => {
      if (imageryLayer.name === name) {
        if (show) {
          imageryLayer.alpha = 1;
        } else {
          imageryLayer.alpha = 0;
        }
      }
    });
  }
}

export default Layer;
