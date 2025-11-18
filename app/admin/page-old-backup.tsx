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

  const handleAssignBid = async () => {
    if (!selectedBid || !assignData.memberId) {
      alert("Please select a member");
      return;
    }

    try {
      const member = members.find((m) => m.id === assignData.memberId);
      await bidsAPI.assignBid(selectedBid.id, {
        assignedTo: assignData.memberId,
        assignedUserName: member!.full_name,
        dueDate: assignData.dueDate,
      });
      alert("Bid assigned successfully!");
      setSelectedBid(null);
      setAssignData({ memberId: "", dueDate: "" });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to assign bid");
    }
  };

  const handleUpdateStatus = async (bidId: string, status: string) => {
    try {
      await bidsAPI.updateBidStatus(bidId, { status });
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
    if (filter === "all") return true;
    return bid.status === filter;
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
        <div className={styles.bidsHeader}>
          <h2>📋 Bids Management</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Bids</option>
            <option value="available">Available</option>
            <option value="considered">Considered</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

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
                {bid.due_date && (
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(bid.due_date).toLocaleDateString()}
                  </p>
                )}
                {bid.submitted_doc_link && (
                  <p>
                    <strong>Doc:</strong>{" "}
                    <a
                      href={bid.submitted_doc_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}
              </div>
              <div className={styles.bidActions}>
                <button
                  onClick={() => handleDownload(bid.gem_bid_id, bid.bid_number)}
                >
                  📥 Download
                </button>
                {bid.status === "available" && (
                  <button onClick={() => setSelectedBid(bid)}>✅ Assign</button>
                )}
                {bid.status !== "rejected" && (
                  <button
                    onClick={() => handleUpdateStatus(bid.id, "rejected")}
                    className={styles.rejectBtn}
                  >
                    ❌ Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBid && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Assign Bid: {selectedBid.bid_number}</h2>
            <div className={styles.formGroup}>
              <label>Select Member</label>
              <select
                value={assignData.memberId}
                onChange={(e) =>
                  setAssignData({ ...assignData, memberId: e.target.value })
                }
              >
                <option value="">-- Select Member --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input
                type="date"
                value={assignData.dueDate}
                onChange={(e) =>
                  setAssignData({ ...assignData, dueDate: e.target.value })
                }
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleAssignBid}>Assign</button>
              <button onClick={() => setSelectedBid(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
