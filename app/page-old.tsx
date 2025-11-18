"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Bid {
  id: string;
  bid_number: string;
  quantity: number | null;
  end_date: string | null;
  department: string | null;
}

interface Category {
  category_name: string;
  category_id: string;
  bids: Bid[];
}

interface Stats {
  totalCategories: number;
  categoriesWithBids: number;
  totalBids: number;
}

interface ResultData {
  stats: Stats;
  categories: Category[];
}

export default function Home() {
  const [csrfToken, setCsrfToken] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  const fetchBids = async () => {
    if (!csrfToken) {
      alert("Please enter CSRF token");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/fetch-bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          endDate: endDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bids");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔍 GEM Bid Finder</h1>
          <p className={styles.subtitle}>
            Find all active tenders across categories
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="csrf-token">CSRF Token *</label>
            <input
              type="text"
              id="csrf-token"
              placeholder="Enter your CSRF token from GEM portal"
              value={csrfToken}
              onChange={(e) => setCsrfToken(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end-date">End Date (Optional)</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            className={styles.button}
            onClick={fetchBids}
            disabled={loading}
          >
            {loading ? "⏳ Fetching..." : "🚀 Fetch All Bids"}
          </button>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <h2>Fetching bids from GEM portal...</h2>
            <p>This may take a few minutes...</p>
          </div>
        )}

        {error && <div className={styles.error}>Error: {error}</div>}

        {results && (
          <div className={styles.results}>
            <h2 className={styles.resultsTitle}>📊 Results</h2>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {results.stats.totalCategories}
                </div>
                <div className={styles.statLabel}>Categories</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {results.stats.categoriesWithBids}
                </div>
                <div className={styles.statLabel}>Categories with Bids</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {results.stats.totalBids}
                </div>
                <div className={styles.statLabel}>Total Bids</div>
              </div>
            </div>

            <div className={styles.categoriesContainer}>
              {results.categories.map((category, index) => (
                <div key={category.category_id} className={styles.category}>
                  <div
                    className={styles.categoryHeader}
                    onClick={() => toggleCategory(index)}
                  >
                    <div className={styles.categoryTitle}>
                      {category.category_name}
                    </div>
                    <div className={styles.bidCount}>
                      {category.bids.length} bids
                    </div>
                  </div>

                  {expandedCategories.has(index) && (
                    <div className={styles.bidsList}>
                      {category.bids.map((bid) => (
                        <div key={bid.id} className={styles.bidCard}>
                          <div className={styles.bidNumber}>
                            {bid.bid_number}
                          </div>

                          <div className={styles.bidDetails}>
                            <div className={styles.bidDetail}>
                              <span className={styles.bidLabel}>Quantity</span>
                              <span className={styles.bidValue}>
                                {bid.quantity || "N/A"}
                              </span>
                            </div>
                            <div className={styles.bidDetail}>
                              <span className={styles.bidLabel}>End Date</span>
                              <span className={styles.bidValue}>
                                {bid.end_date || "N/A"}
                              </span>
                            </div>
                            <div className={styles.bidDetail}>
                              <span className={styles.bidLabel}>
                                Department
                              </span>
                              <span className={styles.bidValue}>
                                {bid.department || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className={styles.bidActions}>
                            <a
                              href={`https://bidplus.gem.gov.in/showbidDocument/${bid.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.btnView}
                            >
                              📄 View Document
                            </a>
                            <a
                              href={`/api/download-document?id=${bid.id}&bidNumber=${bid.bid_number}`}
                              className={styles.btnDownload}
                            >
                              📥 Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
