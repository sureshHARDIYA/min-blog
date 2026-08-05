# Hands-on Exploratory Data Analysis

**Authors:** Dr. Suresh Kumar Mukhiya & Usman Ahmed  
**Publisher:** Packt Publishing Limited  
**Year:** 2020  
**ISBN:** 978-1789537253  
**Domain:** Data Analytics, Python, Exploratory Analysis  

---

## Executive Summary

Exploratory Data Analysis (EDA) is an essential first step in any data science and machine learning workflow. It enables engineers and researchers to inspect data, discover patterns, detect outliers, check assumptions, and test hypotheses before building production ML models.

---

## Key Learning Objectives

1. **Data Cleaning & Wrangling**: Handling missing values, data type coercion, and deduplication with `Pandas`.
2. **Visual Exploratory Techniques**: Leveraging `Matplotlib` and `Seaborn` for univariate, bivariate, and multivariate visualizations.
3. **Outlier Detection**: Using IQR (Interquartile Range), Z-Score, and Isolation Forests to identify anomalous records.
4. **Time Series & Dimensionality Reduction**: Applying PCA (Principal Component Analysis) and t-SNE for high-dimensional feature visualization.
5. **Feature Engineering**: Creating informative features through binning, encoding, and interaction terms.

---

## Code Example: Dimensionality Reduction with PCA

```python
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize feature metrics
scaler = StandardScaler()
X_scaled = scaler.fit_transform(feature_matrix)

# Reduce dimensions to 2 principal components
pca = PCA(n_components=2)
principal_components = pca.fit_transform(X_scaled)

df_pca = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])
print("Explained Variance Ratio:", pca.explained_variance_ratio_)
```

---

## Who This Book Is For

Data analysts, software architects, and data engineers looking to master structured techniques for extracting actionable insights from raw structured and unstructured datasets.
