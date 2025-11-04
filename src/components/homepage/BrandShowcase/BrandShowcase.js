import React from 'react';
import styles from './BrandShowcase.module.scss';
import brandImage from '../../../assets/images/brand-showcase.jpg';

const BrandShowcase = () => {
  return (
    <div className={styles.showcase}>
      <img src={brandImage} alt="Brand showcase" />
    </div>
  );
};

export default BrandShowcase;