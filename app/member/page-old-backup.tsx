"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { bidsAPI } from "@/lib/api";
import styles from "./member.module.css";

interface Bid {
  id: string;
  bid_number: string;
  gem_bid_id: string;
  category_name: string;
  quantity: number | null;
  end_date: string | null;
  department: string | null;
  status: string;
  due_date?: string;
  submitted_doc_link?: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingBid, setUpdatingBid] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [docLink, setDocLink] = useState("");

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
    } catch (error) {
      console.error("Failed to load bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bidId: string, status: string) => {
    setUpdatingBid(bidId);
    try {
      await bidsAPI.updateBidStatus(bidId, { status });
      loadBids();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingBid(null);
    }
  };

  const handleSubmit = async (bidId: string) => {
    if (!docLink) {
      alert("Please enter document link");
      return;
    }

    setUploadingDoc(bidId);
    try {
      await bidsAPI.updateBidStatus(bidId, {
        status: "submitted",
        submittedDocLink: docLink,
      });
      setDocLink("");
      loadBids();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to submit");
    } finally {
      setUploadingDoc(null);
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
        <h2>📋 Your Assigned Bids</h2>
        {bids.length === 0 ? (
          <p className={styles.emptyState}>No bids assigned yet.</p>
        ) : (
          <div className={styles.bidsGrid}>
            {bids.map((bid) => (
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
                  {bid.submitted_doc_link && (
                    <p>
                      <strong>Submitted Doc:</strong>{" "}
                      <a
                        href={bid.submitted_doc_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    </p>
                  )}
                </div>
                <div className={styles.bidActions}>
                  <button
                    onClick={() =>
                      handleDownload(bid.gem_bid_id, bid.bid_number)
                    }
                  >
                    📥 Download
                  </button>
                  {bid.status === "considered" && (
                    <button
                      onClick={() => handleUpdateStatus(bid.id, "in-progress")}
                      disabled={updatingBid === bid.id}
                    >
                      🚀 Start Work
                    </button>
                  )}
                  {bid.status === "in-progress" && (
                    <>
                      <input
                        type="text"
                        placeholder="Document Link (e.g., Google Drive)"
                        value={uploadingDoc === bid.id ? docLink : ""}
                        onChange={(e) => setDocLink(e.target.value)}
                        className={styles.docInput}
                      />
                      <button
                        onClick={() => handleSubmit(bid.id)}
                        disabled={uploadingDoc === bid.id}
                        className={styles.submitBtn}
                      >
                        ✅ Submit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
