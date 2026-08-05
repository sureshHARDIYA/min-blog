# Hands-on Big Data Modeling

**Authors:** James Lee, Tao Wei, & Dr. Suresh Kumar Mukhiya  
**Publisher:** Packt Publishing Limited  
**Year:** 2018  
**ISBN:** 978-1788628327  
**Domain:** Big Data & Machine Learning, Data Architecture  

---

## Executive Summary

Designing scalable data pipelines and storage architectures requires specialized data modeling strategies. **Hands-on Big Data Modeling** covers fundamental and advanced data modeling methodologies across relational, NoSQL, graph, and distributed columnar databases.

---

## Key Learning Objectives

1. **Relational vs. NoSQL Architectures**: Selecting between Cassandra, MongoDB, Neo4j, and PostgreSQL based on read/write latency requirements.
2. **Columnar & Document Schema Design**: Partitioning, indexing, and clustering key strategies for high-throughput query performance.
3. **Stream Processing Models**: Designing schemas for real-time streaming with Apache Kafka and Apache Spark.
4. **Data Warehouse & Data Lake Design**: Star schema, Snowflake schema, and Medallion architecture (Bronze, Silver, Gold layers).
5. **Machine Learning Feature Stores**: Organizing scalable feature pipelines for training and real-time inference.

---

## Architecture Example: Lambda Data Pipeline

```
                     ┌───► Batch Layer (Hadoop / Spark) ────► Batch View ───┐
                     │                                                     │
Data Sources ────────┤                                                     ├─► Serving Layer
                     │                                                     │
                     └───► Speed Layer (Kafka / Flink) ─────► Real-Time ───┘
```

---

## Who This Book Is For

Data architects, backend engineers, and big data developers responsible for designing resilient, high-volume data storage and analytical systems.
