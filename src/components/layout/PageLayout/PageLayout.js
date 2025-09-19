import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';

const PageLayout = ({ pageTitle, children }) => {
  // Automatically generate breadcrumb paths based on the page title
  const breadcrumbPaths = [
    { name: 'Trang chủ', link: '/' },
    { name: pageTitle } // The current page
  ];

  return (
    <>
      <Header />
      <Breadcrumb paths={breadcrumbPaths} />
      
      <main>
        {/* All the page's unique content will be rendered here */}
        {children}
      </main>
      
      <Footer />
    </>
  );
};

export default PageLayout;