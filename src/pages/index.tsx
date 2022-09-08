import styles from './index.less';

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          欢迎来到 <a>Vis.js!</a>
        </h1>
        <p className={styles.description}>
          从编辑 <code className={styles.code}>pages/index.tsx</code> 开始
        </p>

        <div className={styles.grid}>
          <a href="http://vis.vercel.app" className={styles.card} target="bank">
            <h2>文档 &rarr;</h2>
            <p>查找有关 Vis.js 特性和 API 的更多信息。</p>
          </a>

          <a
            href="http://202.104.149.204:3000/vis/vis/src/branch/master/examples"
            className={styles.card}
            target="bank"
          >
            <h2>示例 &rarr;</h2>
            <p>通过更多的功能模板示例来学习Vis.js。</p>
          </a>
        </div>
      </main>
    </div>
  );
}
