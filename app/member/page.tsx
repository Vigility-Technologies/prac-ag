"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { bidsAPI } from "@/lib/api";
import BidDetailsModal from "../components/BidDetailsModal";
import styles from "./member.module.css";

interface Bid {
  id: string;
  bid_number: string;
  gem_bid_id: string;
  category_name: string;
  category_id: string;
  quantity: number | null;
  end_date: string | null;
  department: string | null;
  status: string;
  due_date?: string;
  submitted_doc_link?: string;
  created_at: string;
  updated_at: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "member") {
        router.push("/login");
      } else {
        loadBids();
      }
    }
  }, [user, authLoading, router]);

  const loadBids = async () => {
    try {
      const response = await bidsAPI.getMyBids();
      setBids(response.data.bids);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(response.data.bids.map((bid: Bid) => bid.category_name))
      ).sort();
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error("Failed to load bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    bidId: string,
    status: string,
    submittedDocLink?: string
  ) => {
    try {
      await bidsAPI.updateBidStatus(bidId, { status, submittedDocLink });
      alert("Status updated successfully!");
      setSelectedBid(null);
      loadBids();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDownload = async (gemBidId: string, bidNumber: string) => {
    try {
      const response = await bidsAPI.downloadDocument(gemBidId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${bidNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download document");
    }
  };

  const filteredBids = bids.filter((bid) => {
    // Status filter
    if (statusFilter !== "all" && bid.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== "all" && bid.category_name !== categoryFilter)
      return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        bid.bid_number.toLowerCase().includes(query) ||
        bid.category_name.toLowerCase().includes(query) ||
        bid.department?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (authLoading || loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>👤 My Bids</h1>
        <div className={styles.headerActions}>
          <span>Welcome, {user?.full_name}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{bids.length}</div>
          <div className={styles.statLabel}>Assigned Bids</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bids.filter((b) => b.status === "considered").length}
          </div>
          <div className={styles.statLabel}>To Start</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bids.filter((b) => b.status === "in-progress").length}
          </div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bids.filter((b) => b.status === "submitted").length}
          </div>
          <div className={styles.statLabel}>Submitted</div>
        </div>
      </div>

      <div className={styles.bidsSection}>
        <div className={styles.bidsControls}>
          <h2>📋 Your Assigned Bids ({filteredBids.length})</h2>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="🔍 Search by bid number, category, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="considered">To Start</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className={styles.viewToggle}>
              <button
                className={viewMode === "table" ? styles.active : ""}
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                📊
              </button>
              <button
                className={viewMode === "cards" ? styles.active : ""}
                onClick={() => setViewMode("cards")}
                title="Card View"
              >
                📇
              </button>
            </div>
          </div>
        </div>

        {filteredBids.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No bids found matching your filters.</p>
          </div>
        ) : viewMode === "table" ? (
          <div className={styles.tableContainer}>
            <table className={styles.bidsTable}>
              <thead>
                <tr>
                  <th>Bid Number</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Quantity</th>
                  <th>End Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid) => (
                  <tr key={bid.id}>
                    <td className={styles.bidNumber}>{bid.bid_number}</td>
                    <td className={styles.category}>{bid.category_name}</td>
                    <td>{bid.department || "N/A"}</td>
                    <td>{bid.quantity || "N/A"}</td>
                    <td>
                      {bid.end_date
                        ? new Date(bid.end_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {bid.due_date
                        ? new Date(bid.due_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[bid.status]}`}
                      >
                        {bid.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => setSelectedBid(bid)}
                        className={styles.viewBtn}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(bid.gem_bid_id, bid.bid_number)
                        }
                        className={styles.downloadBtn}
                        title="Download"
                      >
                        📥
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.bidsGrid}>
            {filteredBids.map((bid) => (
              <div key={bid.id} className={styles.bidCard}>
                <div className={styles.bidHeader}>
                  <span className={styles.bidNumber}>{bid.bid_number}</span>
                  <span className={`${styles.status} ${styles[bid.status]}`}>
                    {bid.status}
                  </span>
                </div>
                <div className={styles.bidInfo}>
                  <p>
                    <strong>Category:</strong> {bid.category_name}
                  </p>
                  <p>
                    <strong>Department:</strong> {bid.department || "N/A"}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {bid.quantity || "N/A"}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {bid.end_date
                      ? new Date(bid.end_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {bid.due_date && (
                    <p>
                      <strong>Due Date:</strong>{" "}
                      {new Date(bid.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className={styles.bidActions}>
                  <button onClick={() => setSelectedBid(bid)}>👁️ View</button>
                  <button
                    onClick={() => handleDownload(bid.gem_bid_id, bid.bid_number)}
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBid && (
        <BidDetailsModal
          bid={selectedBid}
          isAdmin={false}
          onClose={() => setSelectedBid(null)}
          onStatusChange={handleUpdateStatus}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
