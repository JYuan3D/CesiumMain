import { Cesium } from '@sl-theia/vis';
import { GeographicTilingScheme4490 } from './GeographicTilingScheme4490';
const {
  ArcGisMapServerImageryProvider,
  Cartesian2,
  Credit,
  defined,
  DiscardMissingTileImagePolicy,
  GeographicProjection,
  Rectangle,
} = Cesium;

export class ArcGisMapServerImageryProviderExt extends ArcGisMapServerImageryProvider {
  // @ts-ignore;
  options?: ArcGisMapServerImageryProvider.ConstructorOptions;
  constructor(options: any) {
    super(options);
    this.options = options;
    this.init();
  }

  init() {
    const self: any = this;
    function requestMetadata() {
      const resource = self._resource.getDerivedResource({
        queryParameters: {
          f: 'json',
        },
      });
      const metadata = resource.fetchJsonp();
      metadata.then((data: any) => {
        self.metadata4490Success(data);
      });
    }
    requestMetadata();
  }

  metadata4490Success(data: any) {
    const tileInfo = data.tileInfo;
    if (data.spatialReference.wkid === 4490 && tileInfo) {
      // debugger;
      const self: any = this;
      const { options } = this;
      if (options) {
        if (data.tileInfo.spatialReference.wkid === 4490) {
          const geoTilingScheme = new GeographicTilingScheme4490({
            ellipsoid: options.ellipsoid,
            tileInfo: tileInfo,
          } as any);
          self._tilingScheme = geoTilingScheme;
        }
        self._maximumLevel = tileInfo.lods.length - 1;
        self._useTiles = true;
        if (defined(data.fullExtent)) {
          if (
            defined(data.fullExtent.spatialReference) &&
            defined(data.fullExtent.spatialReference.wkid)
          ) {
            if (data.fullExtent.spatialReference.wkid === 4490) {
              self._rectangle = Rectangle.fromDegrees(
                data.fullExtent.xmin,
                data.fullExtent.ymin,
                data.fullExtent.xmax,
                data.fullExtent.ymax,
              );
            }
          }
        } else {
          self._rectangle = self._tilingScheme.rectangle;
        }

        // Install the default tile discard policy if none has been supplied.
        if (!defined(self._tileDiscardPolicy)) {
          self._tileDiscardPolicy = new DiscardMissingTileImagePolicy({
            missingImageUrl: self.buildImageResource(
              self,
              0,
              0,
              self._maximumLevel,
            ).url,
            pixelsToCheck: [
              new Cartesian2(0, 0),
              new Cartesian2(200, 20),
              new Cartesian2(20, 200),
              new Cartesian2(80, 110),
              new Cartesian2(160, 130),
            ],
            disableCheckIfAllPixelsAreTransparent: true,
          });
        }
      }

      if (defined(data.copyrightText) && data.copyrightText.length > 0) {
        self._credit = new Credit(data.copyrightText);
      }
      self._ready = true;
      // debugger;
      // self._readyPromise.resolve(true);
      self._readyPromise = Promise.resolve(true);
    }
  }

  buildImageResource(
    imageryProvider: any,
    x: any,
    y: any,
    level: any,
    request: any,
  ) {
    var resource;
    if (imageryProvider._useTiles) {
      resource = imageryProvider._resource.getDerivedResource({
        url: 'tile/' + level + '/' + y + '/' + x,
        request: request,
      });
    } else {
      var nativeRectangle =
        imageryProvider._tilingScheme.tileXYToNativeRectangle(x, y, level);
      var bbox =
        nativeRectangle.west +
        ',' +
        nativeRectangle.south +
        ',' +
        nativeRectangle.east +
        ',' +
        nativeRectangle.north;

      var query: any = {
        bbox: bbox,
        size: imageryProvider._tileWidth + ',' + imageryProvider._tileHeight,
        format: 'png32',
        transparent: true,
        f: 'image',
      };

      if (
        imageryProvider._tilingScheme.projection instanceof GeographicProjection
      ) {
        query.bboxSR = 4490;
        query.imageSR = 4490;
      } else {
        query.bboxSR = 3857;
        query.imageSR = 3857;
      }
      if (imageryProvider.layers) {
        query.layers = 'show:' + imageryProvider.layers;
      }

      resource = imageryProvider._resource.getDerivedResource({
        url: 'export',
        request: request,
        queryParameters: query,
      });
    }

    return resource;
  }
}
