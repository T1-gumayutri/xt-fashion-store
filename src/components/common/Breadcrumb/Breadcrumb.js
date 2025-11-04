import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.scss';

const Breadcrumb = ({ paths }) => {
  return (
    <nav className={styles.breadcrumbNav}>
      <div className={styles.container}>
        {paths.map((path, index) => (
          <span key={index} className={styles.pathItem}>
            {path.link ? (
              <Link to={path.link} className={styles.link}>
                {path.name}
              </Link>
            ) : (
              <span className={styles.current}>{path.name}</span>
            )}
            {index < paths.length - 1 && <span className={styles.separator}>/</span>}
          </span>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;