import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

function createProperty(
  name,
  privateName,
  subscriptionName,
  configurable,
  createPropertyCallback,
) {
  return {
    configurable: configurable,
    get: function () {
      return this[privateName];
    },
    set: function (value) {
      var oldValue = this[privateName];
      var subscription = this[subscriptionName];
      if (Cesium.defined(subscription)) {
        subscription();
        this[subscriptionName] = undefined;
      }

      var hasValue = value !== undefined;
      if (
        hasValue &&
        (!Cesium.defined(value) || !Cesium.defined(value.getValue)) &&
        Cesium.defined(createPropertyCallback)
      ) {
        value = createPropertyCallback(value);
      }

      if (oldValue !== value) {
        this[privateName] = value;
        this._definitionChanged.raiseEvent(this, name, value, oldValue);
      }

      if (Cesium.defined(value) && Cesium.defined(value.definitionChanged)) {
        this[subscriptionName] = value.definitionChanged.addEventListener(
          function () {
            this._definitionChanged.raiseEvent(this, name, value, value);
          },
          this,
        );
      }
    },
  };
}

function createConstantProperty(value) {
  return new Cesium.ConstantProperty(value);
}

/**
 * Used to consistently define all DataSources graphics objects.
 * This is broken into two functions because the Chrome profiler does a better
 * job of optimizing lookups if it notices that the string is constant throughout the function.
 * @private
 */
function createPropertyDescriptor(name, configurable, createPropertyCallback) {
  //Safari 8.0.3 has a JavaScript bug that causes it to confuse two variables and treat them as the same.
  //The two extra toString calls work around the issue.
  return createProperty(
    name,
    '_' + name.toString(),
    '_' + name.toString() + 'Subscription',
    Cesium.defaultValue(configurable, false),
    Cesium.defaultValue(createPropertyCallback, createConstantProperty),
  );
}

function getValueOrClonedDefault(property, time, valueDefault, result) {
  var value;
  if (Cesium.defined(property)) {
    value = property.getValue(time, result);
  }
  if (!Cesium.defined(value)) {
    value = valueDefault.clone(value);
  }
  return value;
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
  const [isLoadedViewer, setIsLoadedViewer] = useState(false);

  useEffect(() => {
    if (!isLoadedViewer) {
      let osm = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/',
      });

      const viewer = new Cesium.Viewer(cesiums.current, {
        imageryProvider: osm,
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
      viewerRef.current = viewer;

      // 取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      );

      // 设置homebutton的位置
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        // Rectangle(west, south, east, north)
        110.15,
        34.54,
        110.25,
        34.56,
      );
      // 设置初始位置
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 3000000),
      });

      function PolylineTrailLinkMaterialProperty(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = new Date().getTime();
      }
      Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
          get: function () {
            return false;
          },
        },
        definitionChanged: {
          get: function () {
            return this._definitionChanged;
          },
        },
        color: createPropertyDescriptor('color'),
      });
      PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
        return 'PolylineTrailLink';
      };
      PolylineTrailLinkMaterialProperty.prototype.getValue = function (
        time,
        result,
      ) {
        if (!Cesium.defined(result)) {
          result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(
          this._color,
          time,
          Cesium.Color.WHITE,
          result.color,
        );
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time =
          ((new Date().getTime() - this._time) % this.duration) / this.duration;
        return result;
      };
      PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
        return (
          this === other ||
          (other instanceof PolylineTrailLinkMaterialProperty &&
            Property.equals(this._color, other._color))
        );
      };
      Cesium.PolylineTrailLinkMaterialProperty =
        PolylineTrailLinkMaterialProperty;
      Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
      Cesium.Material.PolylineTrailLinkImage = './static/img/link/colors.png';
      Cesium.Material.PolylineTrailLinkSource =
        'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                      {\n\
                                                           czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                           vec2 st = materialInput.st;\n\
                                                           vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                           material.alpha = colorImage.a * color.a;\n\
                                                           material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                           return material;\n\
                                                       }';
      Cesium.Material._materialCache.addMaterial(
        Cesium.Material.PolylineTrailLinkType,
        {
          fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
              color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
              image: Cesium.Material.PolylineTrailLinkImage,
              time: 0,
            },
            source: Cesium.Material.PolylineTrailLinkSource,
          },
          translucent: function (material) {
            return true;
          },
        },
      );

      viewer.entities.add({
        name: 'PolylineTrail',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            78.14473433271054, 39.519094301687126, 1000, 108.29490332070186,
            24.28096440338249, 1000, 134.08730679410138, 49.149581652474076,
            1000,
          ]),
          width: 15,
          material: new Cesium.PolylineTrailLinkMaterialProperty(
            Cesium.Color.ORANGE,
            3000,
          ),
        },
      });

      // viewer.zoomTo(polylineTrailLinkRef.current.instance);

      setIsLoadedViewer(true);
    }
  }, []);

  return <div className={styles.container} ref={cesiums}></div>;
}
