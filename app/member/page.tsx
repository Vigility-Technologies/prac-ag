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
  assigned_to?: string;
  assigned_user_name?: string;
  due_date?: string;
  submitted_doc_link?: string;
  bid_preparation_guide?: string;
  created_at: string;
  updated_at: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [openGuideDirectly, setOpenGuideDirectly] = useState(false);

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
      // Fetch all available bids, not just assigned ones
      const response = await bidsAPI.getAvailableBids();
      setBids(response.data.bids);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(response.data.bids.map((bid: Bid) => bid.category_name))
      ).sort();
      setCategories(uniqueCategories as string[]);

      // Extract unique member names
      const uniqueMembers = Array.from(
        new Set(
          response.data.bids
            .filter((bid: Bid) => bid.assigned_user_name)
            .map((bid: Bid) => bid.assigned_user_name)
        )
      ).sort();
      setMembers(uniqueMembers as string[]);
    } catch (error) {
      console.error("Failed to load bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAssign = async (bidId: string) => {
    if (!user) return;

    const dueDateInput = prompt("Enter due date (YYYY-MM-DD):");
    if (!dueDateInput) return; // User cancelled

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDateInput)) {
      alert("Invalid date format. Please use YYYY-MM-DD format.");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(dueDateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Due date cannot be in the past.");
      return;
    }

    try {
      await bidsAPI.assignBid(bidId, {
        assignedTo: user.id,
        assignedUserName: user.full_name,
        dueDate: dueDateInput,
      });
      alert("Bid assigned to you successfully!");
      loadBids();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to assign bid");
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

  const handleGuideGenerated = (bidId: string, guide: string) => {
    setBids((prevBids) =>
      prevBids.map((bid) =>
        bid.id === bidId ? { ...bid, bid_preparation_guide: guide } : bid
      )
    );
    if (selectedBid && selectedBid.id === bidId) {
      setSelectedBid((prev) =>
        prev ? { ...prev, bid_preparation_guide: guide } : null
      );
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
      if (memberFilter === "unassigned" && bid.assigned_user_name) return false;
      if (
        memberFilter !== "unassigned" &&
        bid.assigned_user_name !== memberFilter
      )
        return false;
    }

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
        <h1>👤 All Bids</h1>
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
          <div className={styles.statLabel}>Total Bids</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bids.filter((b) => b.status === "available").length}
          </div>
          <div className={styles.statLabel}>Available</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bids.filter((b) => b.assigned_to === user?.id).length}
          </div>
          <div className={styles.statLabel}>Assigned to Me</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {
              bids.filter(
                (b) => b.assigned_to === user?.id && b.status === "in-progress"
              ).length
            }
          </div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
      </div>

      <div className={styles.bidsSection}>
        <div className={styles.bidsControls}>
          <h2>📋 All Bids ({filteredBids.length})</h2>

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
              <option value="available">Available</option>
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

            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Members</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => (
                <option key={member} value={member}>
                  {member}
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
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>PQ Guide</th>
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
                    <td>{bid.assigned_user_name || "Unassigned"}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[bid.status]
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                    <td>
                      {bid.bid_preparation_guide ? (
                        <button
                          onClick={() => {
                            setOpenGuideDirectly(true);
                            setSelectedBid(bid);
                          }}
                          className={styles.viewBtn}
                        >
                          View Guide
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setOpenGuideDirectly(true);
                            setSelectedBid(bid);
                          }}
                          className={styles.generateBtn}
                        >
                          Generate
                        </button>
                      )}
                    </td>
                    <td className={styles.actions}>
                      {bid.status === "available" && !bid.assigned_to && (
                        <button
                          onClick={() => handleSelfAssign(bid.id)}
                          className={styles.assignBtn}
                          title="Assign to Me"
                        >
                          Assign
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setOpenGuideDirectly(false);
                          setSelectedBid(bid);
                        }}
                        className={styles.viewBtn}
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(bid.gem_bid_id, bid.bid_number)
                        }
                        className={styles.downloadBtn}
                        title="Download"
                      >
                        Download
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
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {bid.assigned_user_name || "Unassigned"}
                  </p>
                  {bid.bid_preparation_guide && (
                    <p>
                      <strong>PQ Guide:</strong>{" "}
                      <span style={{ color: "green" }}>Generated</span>
                    </p>
                  )}
                </div>
                <div className={styles.bidActions}>
                  {bid.status === "available" && !bid.assigned_to && (
                    <button onClick={() => handleSelfAssign(bid.id)}>
                      Assign to Me
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setOpenGuideDirectly(false);
                      setSelectedBid(bid);
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(bid.gem_bid_id, bid.bid_number)
                    }
                  >
                    Download
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
          initialShowPQ={openGuideDirectly}
          onClose={() => {
            setSelectedBid(null);
            setOpenGuideDirectly(false);
          }}
          onStatusChange={() => {}}
          onDownload={handleDownload}
          onGuideGenerated={handleGuideGenerated}
        />
      )}
    </div>
  );
}
