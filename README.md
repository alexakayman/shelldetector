# Shell Companny Detection

A lightweight pattern detection system for shell corporations. [WIP]

![Preview](/app/img/preview.png)

# Data Sources
[OpenCorporates](https://api.opencorporates.com/documentation/API-Reference)
- For fuzzymatching initial search terms
- For an initial overview of legal incorporation
- For registered relationships from direct to ultimate parent or child entities
  
[GLEIF](https://www.gleif.org/en/lei-data/gleif-api)
- For company ownership and operating info

[EDGAR - SEC](https://data.sec.gov)
- For most recent filings, often used to check incorporation date vs. filing activity
  

# Risk Flags
There are four primary risk flags, each with varying weight and verification checks within themselves.

1. Rapid Ownership Changes (0.8)
2. Circular Ownership Pattern (0.9)
3. Minimal Business Operations (0.7)
4. Common Legal Address (0.6)
