"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { bidsAPI, usersAPI } from "@/lib/api";
import BidDetailsModal from "../components/BidDetailsModal";
import styles from "./admin.module.css";

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
  assigned_to?: string;
  assigned_user_name?: string;
  due_date?: string;
  submitted_doc_link?: string;
  created_at: string;
  updated_at: string;
}

interface Member {
  id: string;
  email: string;
  full_name: string;
}

interface Stats {
  total: number;
  available: number;
  considered: number;
  inProgress: number;
  submitted: number;
  rejected: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingBids, setFetchingBids] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [bidsRes, membersRes, statsRes] = await Promise.all([
        bidsAPI.getAvailableBids(),
        usersAPI.getMembers(),
        bidsAPI.getStats(),
      ]);
      setBids(bidsRes.data.bids);
      setMembers(membersRes.data.members);
      setStats(statsRes.data.stats);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(bidsRes.data.bids.map((bid: Bid) => bid.category_name))
      ).sort();
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBids = async () => {
    if (!csrfToken) {
      alert("Please enter CSRF token");
      return;
    }

    setFetchingBids(true);
    try {
      await bidsAPI.fetchBids({ csrfToken, endDate });
      alert("Bids fetched successfully!");
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to fetch bids");
    } finally {
      setFetchingBids(false);
    }
  };

  const handleAssignBid = async (
    bidId: string,
    memberId: string,
    memberName: string,
    dueDate: string
  ) => {
    try {
      await bidsAPI.assignBid(bidId, {
        assignedTo: memberId,
        assignedUserName: memberName,
        dueDate: dueDate,
      });
      alert("Bid assigned successfully!");
      setSelectedBid(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to assign bid");
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
      loadData();
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

    // Member filter
    if (memberFilter !== "all") {
      if (memberFilter === "unassigned" && bid.assigned_to) return false;
      if (memberFilter !== "unassigned" && bid.assigned_to !== memberFilter)
        return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        bid.bid_number.toLowerCase().includes(query) ||
        bid.category_name.toLowerCase().includes(query) ||
        bid.department?.toLowerCase().includes(query) ||
        bid.assigned_user_name?.toLowerCase().includes(query)
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
        <h1>🎯 Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <span>Welcome, {user?.full_name}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Bids</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.available}</div>
            <div className={styles.statLabel}>Available</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.considered}</div>
            <div className={styles.statLabel}>Considered</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.inProgress}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.submitted}</div>
            <div className={styles.statLabel}>Submitted</div>
          </div>
        </div>
      )}

      <div className={styles.fetchSection}>
        <h2>🔄 Fetch New Bids from GEM</h2>
        <div className={styles.fetchForm}>
          <input
            type="text"
            placeholder="CSRF Token"
            value={csrfToken}
            onChange={(e) => setCsrfToken(e.target.value)}
          />
          <input
            type="date"
            placeholder="End Date (Optional)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={handleFetchBids} disabled={fetchingBids}>
            {fetchingBids ? "Fetching..." : "Fetch Bids"}
          </button>
        </div>
      </div>

      <div className={styles.bidsSection}>
        <div className={styles.bidsControls}>
          <h2>📋 Bids Management ({filteredBids.length})</h2>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="🔍 Search by bid number, category, department, or member..."
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
              <option value="available">Available</option>
              <option value="considered">Considered</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="rejected">Rejected</option>
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

            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Members</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
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
                  <th>Status</th>
                  <th>Assigned To</th>
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
                      <span
                        className={`${styles.statusBadge} ${
                          styles[bid.status]
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                    <td>{bid.assigned_user_name || "Unassigned"}</td>
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
                  {bid.assigned_user_name && (
                    <p>
                      <strong>Assigned to:</strong> {bid.assigned_user_name}
                    </p>
                  )}
                </div>
                <div className={styles.bidActions}>
                  <button onClick={() => setSelectedBid(bid)}>👁️ View</button>
                  <button
                    onClick={() =>
                      handleDownload(bid.gem_bid_id, bid.bid_number)
                    }
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
          members={members}
          isAdmin={true}
          onClose={() => setSelectedBid(null)}
          onAssign={handleAssignBid}
          onStatusChange={handleUpdateStatus}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
