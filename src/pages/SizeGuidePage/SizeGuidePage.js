import React from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './SizeGuidePage.module.scss';

const SizeGuidePage = () => {
  return (
    <PageLayout pageTitle="Hướng dẫn chọn size">
      <div className={styles.guideContainer}>
        <h1 className={styles.mainTitle}>Bảng quy đổi kích cỡ XT Fashion</h1>
        <p className={styles.intro}>
          Để chọn được sản phẩm vừa vặn nhất, XT Fashion khuyến khích quý khách tham khảo các bảng thông số dưới đây. 
          Nếu số đo của bạn nằm giữa hai size, hãy ưu tiên chọn size lớn hơn để thoải mái hoặc liên hệ CSKH để được tư vấn.
        </p>
        
        {/* Phần 1: Áo Nam */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Áo Nam (Sơ mi, Polo, T-shirt, Áo khoác)</h2>
          
          <div className={styles.tableGroup}>
            <h3>A. Áo theo Size chữ (Polo, T-shirt, Áo khoác)</h3>
            <p>Áp dụng cho các size: S, M, L, XL</p>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chiều cao (m)</th>
                  <th>Cân nặng (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>S</strong></td>
                  <td>1m60 - 1m65</td>
                  <td>50 - 60</td>
                </tr>
                <tr>
                  <td><strong>M</strong></td>
                  <td>1m64 - 1m69</td>
                  <td>60 - 68</td>
                </tr>
                <tr>
                  <td><strong>L</strong></td>
                  <td>1m70 - 1m74</td>
                  <td>68 - 75</td>
                </tr>
                <tr>
                  <td><strong>XL</strong></td>
                  <td>1m74 - 1m77</td>
                  <td>75 - 80</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.tableGroup}>
            <h3>B. Áo Sơ mi theo Size số</h3>
            <p>Áp dụng cho các size: 38, 39, 40, 41, 42, 43</p>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size số</th>
                  <th>Tương đương</th>
                  <th>Vòng cổ (cm)</th>
                  <th>Vòng ngực (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>38</strong></td>
                  <td>S</td>
                  <td>38</td>
                  <td>88 - 92</td>
                </tr>
                <tr>
                  <td><strong>39</strong></td>
                  <td>M</td>
                  <td>39</td>
                  <td>92 - 96</td>
                </tr>
                <tr>
                  <td><strong>40</strong></td>
                  <td>L</td>
                  <td>40</td>
                  <td>96 - 100</td>
                </tr>
                <tr>
                  <td><strong>41</strong></td>
                  <td>XL</td>
                  <td>41</td>
                  <td>100 - 104</td>
                </tr>
                <tr>
                  <td><strong>42</strong></td>
                  <td>XXL</td>
                  <td>42</td>
                  <td>104 - 108</td>
                </tr>
                 <tr>
                  <td><strong>43</strong></td>
                  <td>XXXL</td>
                  <td>43</td>
                  <td>108 - 112</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Phần 2: Quần Nam */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Quần Nam (Quần Âu, Jeans, Kaki, Short)</h2>
          <p>Áp dụng cho các size: 29, 30, 31, 32, 33, 34, 35</p>
          <table className={styles.sizeTable}>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chiều cao (m)</th>
                <th>Cân nặng (kg)</th>
                <th>Vòng bụng (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>29</strong></td>
                <td>1m60 - 1m65</td>
                <td>50 - 55</td>
                <td>72 - 74</td>
              </tr>
              <tr>
                <td><strong>30</strong></td>
                <td>1m64 - 1m69</td>
                <td>56 - 60</td>
                <td>74 - 76</td>
              </tr>
              <tr>
                <td><strong>31</strong></td>
                <td>1m66 - 1m72</td>
                <td>61 - 65</td>
                <td>76 - 79</td>
              </tr>
              <tr>
                <td><strong>32</strong></td>
                <td>1m68 - 1m74</td>
                <td>66 - 70</td>
                <td>79 - 82</td>
              </tr>
              <tr>
                <td><strong>33</strong></td>
                <td>1m70 - 1m76</td>
                <td>71 - 75</td>
                <td>83 - 86</td>
              </tr>
              <tr>
                <td><strong>34</strong></td>
                <td>1m72 - 1m78</td>
                <td>75 - 80</td>
                <td>87 - 90</td>
              </tr>
              <tr>
                <td><strong>35</strong></td>
                <td>1m75 - 1m80</td>
                <td>80 - 85</td>
                <td>91 - 94</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Phần 3: Giày Da & Sneaker */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Giày Nam (Giày Tây, Loafer, Sneaker)</h2>
          <p>Áp dụng cho các size: 39, 40, 41</p>
          <div className={styles.guideStep}>
             <strong>Cách đo:</strong> Đặt bàn chân lên tờ giấy, đánh dấu điểm gót và điểm ngón chân dài nhất. Đo khoảng cách giữa 2 điểm.
          </div>
          <table className={styles.sizeTable}>
            <thead>
              <tr>
                <th>Size Giày</th>
                <th>Chiều dài bàn chân (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>39</strong></td>
                <td>24.5</td>
              </tr>
              <tr>
                <td><strong>40</strong></td>
                <td>25</td>
              </tr>
              <tr>
                <td><strong>41</strong></td>
                <td>25.5 - 26</td>
              </tr>
              {/* Thêm size 42 nếu sau này có hàng */}
              <tr>
                <td><strong>42</strong></td>
                <td>26.5</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        {/* Phần 4: Phụ kiện */}
         <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Phụ Kiện (Thắt lưng, Ví)</h2>
          <ul className={styles.accessoryList}>
              <li><strong>Thắt lưng:</strong> Hầu hết là Free Size (Size 0), dây dài tiêu chuẩn có thể cắt ngắn hoặc đục thêm lỗ tùy theo vòng bụng.</li>
              <li><strong>Ví/Bóp tay:</strong> Kích thước cụ thể (Dài x Rộng x Cao) được ghi chi tiết trong trang từng sản phẩm.</li>
          </ul>
        </section>

      </div>
    </PageLayout>
  );
};

export default SizeGuidePage;