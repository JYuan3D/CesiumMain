import { useEffect, useRef } from 'react';
import styles from './index.less';

// ======================================================================
//  线性代数和辅助工具
// ======================================================================

// 两个三维向量的点积
const DotProduct = (v1: number[], v2: number[]) => {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

// 计算 v1 - v2.
const Subtract = (v1: number[], v2: number[]) => {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

// 一个球体
class Sphere {
  center: number[];
  radius: number;
  color: number[];
  constructor(center: number[], radius: number, color: number[]) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }
}

export default function Map(props: any) {
  const canvasRef = useRef<any>();

  const viewport_size = 1;
  const projection_plane_z = 1;
  const camera_position = [0, 0, 0];
  const background_color = [255, 255, 255];
  const spheres = [
    new Sphere([0, -1, 3], 1, [255, 0, 0]),
    new Sphere([2, 0, 4], 1, [0, 0, 255]),
    new Sphere([-2, 0, 4], 1, [0, 255, 0]),
  ];

  useEffect(() => {
    let canvas: HTMLCanvasElement = canvasRef.current;
    let canvas_context = canvas.getContext('2d');
    let canvas_buffer = canvas_context!.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    let canvas_pitch = canvas_buffer.width * 4;

    // 主循环
    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
      for (let y = -canvas.height / 2; y < canvas.height / 2; y++) {
        let direction = CanvasToViewport(canvas, [x, y]);
        let color = TraceRay(camera_position, direction, 1, Infinity);
        PutPixel(canvas, canvas_buffer, canvas_pitch, x, y, color);
      }
    }

    UpdateCanvas(canvas_context!, canvas_buffer);
  }, []);

  // 将2D画布坐标转换为3D视口坐标
  const CanvasToViewport = (canvas: HTMLCanvasElement, p2d: number[]) => {
    return [
      (p2d[0] * viewport_size) / canvas.width, // [-1/2, +1/2]
      (p2d[1] * viewport_size) / canvas.height, // [-1/2, +1/2]
      projection_plane_z,
    ];
  };

  const TraceRay = (
    origin: number[],
    direction: number[],
    min_t: number,
    max_t: number,
  ) => {
    let closest_t = Infinity;
    let closest_sphere = null;

    for (let i = 0; i < spheres.length; i++) {
      let ts = IntersectRaySphere(origin, direction, spheres[i]);
      if (ts[0] < closest_t && min_t < ts[0] && ts[0] < max_t) {
        closest_t = ts[0];
        closest_sphere = spheres[i];
      }
      if (ts[1] < closest_t && min_t < ts[1] && ts[1] < max_t) {
        closest_t = ts[1];
        // debugger;
        closest_sphere = spheres[i];
      }
      // 使用ts数组中最小的值
    }

    if (closest_sphere == null) {
      return background_color;
    }

    return closest_sphere.color;
  };

  const IntersectRaySphere = (
    origin: number[],
    direction: number[],
    sphere: any,
  ) => {
    let oc = Subtract(origin, sphere.center);

    let k1 = DotProduct(direction, direction);
    let k2 = 2 * DotProduct(oc, direction);
    let k3 = DotProduct(oc, oc) - sphere.radius * sphere.radius;

    let discriminant = k2 * k2 - 4 * k1 * k3;
    if (discriminant < 0) {
      return [Infinity, Infinity];
    }

    let t1 = (-k2 + Math.sqrt(discriminant)) / (2 * k1);
    let t2 = (-k2 - Math.sqrt(discriminant)) / (2 * k1);
    return [t1, t2];
  };

  // 绘制像素
  const PutPixel = (
    canvas: HTMLCanvasElement,
    canvas_buffer: ImageData,
    canvas_pitch: number,
    x: number,
    y: number,
    color: number[],
  ) => {
    x = canvas.width / 2 + x;
    y = canvas.height / 2 - y - 1;

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }

    let offset = 4 * x + canvas_pitch * y;
    canvas_buffer.data[offset++] = color[0];
    canvas_buffer.data[offset++] = color[1];
    canvas_buffer.data[offset++] = color[2];
    canvas_buffer.data[offset++] = 255;
  };

  // 将屏幕外缓冲区的内容显示到画布中
  const UpdateCanvas = (
    canvas_context: CanvasRenderingContext2D,
    canvas_buffer: ImageData,
  ) => {
    canvas_context.putImageData(canvas_buffer, 0, 0);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width="600"
        height="600"
        style={{ border: '1px rgb(236, 223, 31) solid' }}
      ></canvas>
    </div>
  );
}
