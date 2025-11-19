"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { bidsAPI } from "@/lib/api";
import styles from "./BidDetailsModal.module.css";

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

interface Member {
  id: string;
  full_name: string;
  email: string;
}

interface BidDetailsModalProps {
  bid: Bid;
  members?: Member[];
  isAdmin: boolean;
  initialShowPQ?: boolean;
  onClose: () => void;
  onAssign?: (
    bidId: string,
    memberId: string,
    memberName: string,
    dueDate: string
  ) => void;
  onStatusChange: (
    bidId: string,
    status: string,
    submittedDocLink?: string
  ) => void;
  onDownload: (gemBidId: string, bidNumber: string) => void;
  onGuideGenerated?: (bidId: string, guide: string) => void;
}

export default function BidDetailsModal({
  bid,
  members = [],
  isAdmin,
  initialShowPQ = false,
  onClose,
  onAssign,
  onStatusChange,
  onDownload,
  onGuideGenerated,
}: BidDetailsModalProps) {
  const [selectedMember, setSelectedMember] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [docLink, setDocLink] = useState(bid.submitted_doc_link || "");
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [pqGuide, setPqGuide] = useState(bid.bid_preparation_guide || "");
  const [loadingPQ, setLoadingPQ] = useState(false);
  const [showPQModal, setShowPQModal] = useState(initialShowPQ);

  const handleCheckPQ = async () => {
    if (pqGuide) {
      setShowPQModal(true);
      return;
    }

    setLoadingPQ(true);
    try {
      const response = await bidsAPI.checkPQ(bid.id);
      setPqGuide(response.data.guide);
      if (onGuideGenerated) {
        onGuideGenerated(bid.id, response.data.guide);
      }
      setShowPQModal(true);
    } catch (error) {
      console.error("Failed to check PQ:", error);
      alert("Failed to generate Bid Preparation Guide");
    } finally {
      setLoadingPQ(false);
    }
  };

  useEffect(() => {
    if (initialShowPQ && !pqGuide && !loadingPQ) {
      handleCheckPQ();
    }
  }, [initialShowPQ]);

  const handleAssign = () => {
    if (!selectedMember || !onAssign) return;
    const member = members.find((m) => m.id === selectedMember);
    if (member) {
      onAssign(bid.id, member.id, member.full_name, dueDate);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "submitted" && !docLink) {
      alert("Please provide a document link for submission");
      return;
    }
    onStatusChange(bid.id, newStatus, docLink);
    setShowStatusChange(false);
  };

  const statusOptions = [
    "available",
    "rejected",
    "considered",
    "in-progress",
    "submitted",
  ];
  const availableStatusOptions = statusOptions.filter((s) => s !== bid.status);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Bid Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.bidStatus}>
            <span className={`${styles.statusBadge} ${styles[bid.status]}`}>
              {bid.status.toUpperCase().replace("-", " ")}
            </span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <label>Bid Number</label>
              <p>{bid.bid_number}</p>
            </div>

            <div className={styles.detailItem}>
              <label>GEM Bid ID</label>
              <p className={styles.monospace}>{bid.gem_bid_id}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Category</label>
              <p>{bid.category_name}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Department</label>
              <p>{bid.department || "N/A"}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Quantity</label>
              <p>{bid.quantity || "N/A"}</p>
            </div>

            <div className={styles.detailItem}>
              <label>End Date</label>
              <p>
                {bid.end_date
                  ? new Date(bid.end_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>

            {bid.assigned_user_name && (
              <div className={styles.detailItem}>
                <label>Assigned To</label>
                <p>{bid.assigned_user_name}</p>
              </div>
            )}

            {bid.due_date && (
              <div className={styles.detailItem}>
                <label>Due Date</label>
                <p>
                  {new Date(bid.due_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {bid.submitted_doc_link && (
              <div className={styles.detailItem}>
                <label>Submitted Document</label>
                <a
                  href={bid.submitted_doc_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  View Document →
                </a>
              </div>
            )}

            <div className={styles.detailItem}>
              <label>Created At</label>
              <p>
                {new Date(bid.created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className={styles.detailItem}>
              <label>Last Updated</label>
              <p>
                {new Date(bid.updated_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Assignment Section */}
          {isAdmin && onAssign && (
            <div className={styles.actionSection}>
              <h3>
                {bid.assigned_to
                  ? "Reassign Bid / Change Due Date"
                  : "Assign to Member"}
              </h3>
              <div className={styles.assignForm}>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} ({member.email})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.input}
                  placeholder="Due Date"
                />
                <button
                  onClick={handleAssign}
                  disabled={!selectedMember}
                  className={styles.primaryBtn}
                >
                  {bid.assigned_to ? "Update Assignment" : "Assign Bid"}
                </button>
              </div>
            </div>
          )}

          {/* Status Change Section - Only for Admin */}
          {isAdmin && (
            <>
              {!showStatusChange ? (
                <div className={styles.actionSection}>
                  <button
                    onClick={() => setShowStatusChange(true)}
                    className={styles.secondaryBtn}
                  >
                    Change Status
                  </button>
                </div>
              ) : (
                <div className={styles.actionSection}>
                  <h3>Change Status</h3>
                  {bid.status === "in-progress" && (
                    <div className={styles.formGroup}>
                      <label>Document Link (required for submission)</label>
                      <input
                        type="text"
                        value={docLink}
                        onChange={(e) => setDocLink(e.target.value)}
                        placeholder="https://..."
                        className={styles.input}
                      />
                    </div>
                  )}
                  <div className={styles.statusButtons}>
                    {availableStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`${styles.statusBtn} ${styles[status]}`}
                      >
                        {status.toUpperCase().replace("-", " ")}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowStatusChange(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={handleCheckPQ}
            className={styles.secondaryBtn}
            disabled={loadingPQ}
            style={{ marginRight: "10px" }}
          >
            {loadingPQ ? "Generating Guide..." : "📋 Check PQ"}
          </button>
          <button
            onClick={() => onDownload(bid.gem_bid_id, bid.bid_number)}
            className={styles.downloadBtn}
          >
            📥 Download Document
          </button>
          <button onClick={onClose} className={styles.closeFooterBtn}>
            Close
          </button>
        </div>
      </div>

      {/* PQ Guide Modal */}
      {showPQModal && (
        <div
          className={styles.modalOverlay}
          style={{ zIndex: 1100 }}
          onClick={() => setShowPQModal(false)}
        >
          <div
            className={styles.modalContent}
            style={{
              maxWidth: "800px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Bid Preparation Guide</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowPQModal(false)}
              >
                ✕
              </button>
            </div>
            <div
              className={styles.modalBody}
              style={{ overflowY: "auto", flex: 1 }}
            >
              <div className={styles.markdownContent}>
                <ReactMarkdown>{pqGuide}</ReactMarkdown>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowPQModal(false)}
                className={styles.closeFooterBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
