import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout title="Iron Ledger" description="Documentación de diseño del juego">
      <main className={styles.heroBanner}>
        <div className="container">
          <h1>Iron Ledger</h1>
          <p>Dirigís un gremio de chatarreros mechas sobreviviendo semana a semana.</p>
          <Link className="button button--primary button--lg" to="/docs/gdd/game-concept">
            Ver documentación
          </Link>
        </div>
      </main>
    </Layout>
  );
}
