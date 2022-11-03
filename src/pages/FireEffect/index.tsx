import { Cesium } from '@sl-theia/vis';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

//火焰特效
class FireEffect {
  viewer: Cesium.Viewer;
  viewModel: any;
  emitterModelMatrix: Cesium.Matrix4 | undefined;
  translation: Cesium.Cartesian3 | undefined;
  rotation: Cesium.Quaternion | undefined;
  hpr: Cesium.HeadingPitchRoll | undefined;
  trs: Cesium.TranslationRotationScale | undefined;
  scene: Cesium.Scene;
  particleSystem: Cesium.ParticleSystem | undefined;
  entity: Cesium.Entity;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.viewModel = {
      emissionRate: 5,
      gravity: 0.0, //设置重力参数
      minimumParticleLife: 1,
      maximumParticleLife: 6,
      minimumSpeed: 1.0, //粒子发射的最小速度
      maximumSpeed: 4.0, //粒子发射的最大速度
      startScale: 0.0,
      endScale: 10.0,
      particleSize: 25.0,
    };
    this.emitterModelMatrix = new Cesium.Matrix4();
    this.translation = new Cesium.Cartesian3();
    this.rotation = new Cesium.Quaternion();
    this.hpr = new Cesium.HeadingPitchRoll();
    this.trs = new Cesium.TranslationRotationScale();
    this.scene = this.viewer.scene;
    this.particleSystem = undefined;
    this.entity = this.viewer.entities.add({
      //选择粒子放置的坐标
      position: Cesium.Cartesian3.fromDegrees(
        116.34485552299206,
        39.99754814959118,
      ),
    });
    this.init();
  }

  init() {
    const _this = this;
    this.viewer.clock.shouldAnimate = true;
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    this.viewer.trackedEntity = this.entity;
    var particleSystem = this.scene.primitives.add(
      new Cesium.ParticleSystem({
        image: require('./img/fire.png'), //生成所需粒子的图片路径
        //粒子在生命周期开始时的颜色
        startColor: new Cesium.Color(1, 1, 1, 1),
        //粒子在生命周期结束时的颜色
        endColor: new Cesium.Color(0.5, 0, 0, 0),
        //粒子在生命周期开始时初始比例
        startScale: _this.viewModel.startScale,
        //粒子在生命周期结束时比例
        endScale: _this.viewModel.endScale,
        //粒子发射的最小速度
        minimumParticleLife: _this.viewModel.minimumParticleLife,
        //粒子发射的最大速度
        maximumParticleLife: _this.viewModel.maximumParticleLife,
        //粒子质量的最小界限
        minimumSpeed: _this.viewModel.minimumSpeed,
        //粒子质量的最大界限
        maximumSpeed: _this.viewModel.maximumSpeed,
        //以像素为单位缩放粒子图像尺寸
        imageSize: new Cesium.Cartesian2(
          _this.viewModel.particleSize,
          _this.viewModel.particleSize,
        ),
        //每秒发射的粒子数
        emissionRate: _this.viewModel.emissionRate,
        //粒子系统发射粒子的时间（秒）
        lifetime: 16.0,
        //粒子系统是否应该在完成时循环其爆发
        loop: true,
        //设置粒子的大小是否以米或像素为单位
        sizeInMeters: true,
        //系统的粒子发射器
        emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)), //BoxEmitter 盒形发射器，ConeEmitter 锥形发射器，SphereEmitter 球形发射器，CircleEmitter圆形发射器
      }),
    );
    this.particleSystem = particleSystem;
    this.preUpdateEvent();
  }

  //场景渲染事件
  preUpdateEvent() {
    let _this = this;
    this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
      //发射器地理位置
      _this.particleSystem!.modelMatrix = _this.computeModelMatrix(
        _this.entity,
        time,
      );
      //发射器局部位置
      _this.particleSystem!.emitterModelMatrix =
        _this.computeEmitterModelMatrix();
      // 将发射器旋转
      if (_this.viewModel.spin) {
        _this.viewModel.heading += 1.0;
        _this.viewModel.pitch += 1.0;
        _this.viewModel.roll += 1.0;
      }
    });
  }

  computeModelMatrix(entity: Cesium.Entity, time: Cesium.JulianDate) {
    return entity.computeModelMatrix(time, new Cesium.Matrix4());
  }

  computeEmitterModelMatrix() {
    this.hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, this.hpr);
    this.trs!.translation = Cesium.Cartesian3.fromElements(
      -4.0,
      0.0,
      1.4,
      this.translation,
    );
    this.trs!.rotation = Cesium.Quaternion.fromHeadingPitchRoll(
      this.hpr,
      this.rotation,
    );

    return Cesium.Matrix4.fromTranslationRotationScale(
      this.trs!,
      this.emitterModelMatrix,
    );
  }

  removeEvent() {
    this.viewer.scene.preUpdate.removeEventListener(this.preUpdateEvent, this);
    this.emitterModelMatrix = undefined;
    this.translation = undefined;
    this.rotation = undefined;
    this.hpr = undefined;
    this.trs = undefined;
  }

  //移除粒子特效
  remove() {
    () => {
      return this.removeEvent();
    }; //清除事件
    this.viewer.scene.primitives.remove(this.particleSystem); //删除粒子对象
    this.viewer.entities.remove(this.entity); //删除entity
  }
}

export default function Map(props: any) {
  const cesiums = useRef<any>();
  const viewerRef = useRef<any>();
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
        destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 4000000),
      });

      const fireEffect = new FireEffect(viewer);

      setIsLoadedViewer(true);
    }
  }, []);

  return <div className={styles.container} ref={cesiums}></div>;
}
