import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { supabase } from "../config/supabase";
import { authenticate, isAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Fetch bids from GEM portal (admin only)
router.post(
  "/fetch",
  authenticate,
  isAdmin,
  [body("csrfToken").notEmpty(), body("endDate").optional().isString()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { csrfToken, endDate } = req.body;

      const categories = [
        {
          category_name: "Enterprise Storage",
          category_id: "home_info_co87882452_medi_en44773564",
        },
        {
          category_name: "Library Management Software",
          category_id: "home_info_soft_4316374606_libr",
        },
        {
          category_name:
            "Development Tools For Web Application / Portal Application Software",
          category_id: "home_info_soft_4377702185_deve",
        },
        {
          category_name:
            "Software Based Solution For Mobile Devices And Cdr Analysis",
          category_id: "home_info_soft_cont_soft",
        },
        {
          category_name: "Electronic Mail And Messaging Software",
          category_id: "home_info_soft_info_el60210130",
        },
        {
          category_name: "Vulnerability Management / Assessment Software (v2)",
          category_id: "home_info_soft_netw_vu05187046",
        },
        {
          category_name: "Data Loss Prevention (dlp) Software",
          category_id: "home_info_soft_secu_da04615711",
        },
        {
          category_name:
            "Live Remote Temperature And Humidity Monitoring And Alert System",
          category_id: "home_info_so18353664_indi_live",
        },
        {
          category_name: "Network Monitoring Software (v2)",
          category_id: "home_info_soft_ne74724043_netw",
        },
        {
          category_name: "Api Management Software",
          category_id: "home_info_soft_info_apim",
        },
        {
          category_name:
            "Cyber Security Audit - Infrastructure Audit, Security And Compliance Audit",
          category_id: "services_home_cybe_cybe",
        },
        {
          category_name:
            "Vulnerability And Penetration Testing - Web Application, Mobile Applications...",
          category_id: "services_home_cybe_vuln",
        },
        {
          category_name:
            "Artificial Intelligence, Machine Learning, And Deep Learning As A Service...",
          category_id: "services_home_emer_arti",
        },
        {
          category_name:
            "E-learning Content Development - Igot; Translation Of Existing E-learning Content...",
          category_id: "services_home_mult_elea",
        },
        { category_name: "Cloud Service", category_id: "home_clou" },
        {
          category_name: "Data Analytics Service",
          category_id: "home_da84613414",
        },
        {
          category_name: "Backup Software",
          category_id: "home_info_co84875567_so08531025_back",
        },
        {
          category_name: "Enterprise Management System",
          category_id: "home_info_co84875567_soft_ente",
        },
        {
          category_name: "Web Application Firewall",
          category_id: "home_info_data_ne51580770_weba",
        },
        {
          category_name: "Hyper Converged Infrastructure For Data Centers",
          category_id: "home_info_so18353664_data_hype",
        },
        {
          category_name: "Document Management Software",
          category_id: "home_info_soft_4325585261_docu",
        },
        {
          category_name:
            "Backup And Replication Software Backup Or Archival Software",
          category_id: "home_info_soft_4336483473_back",
        },
        {
          category_name: "Network Management  Software",
          category_id: "home_info_soft_4384644547_netw",
        },
        {
          category_name: "Business Intelligence And Data Analysis Software",
          category_id: "home_info_soft_draf_busi",
        },
        {
          category_name: "Customer Relationship Management Software",
          category_id: "home_info_soft_draf_cust",
        },
        {
          category_name: "Data Base Management System Software",
          category_id: "home_info_soft_draf_data",
        },
        {
          category_name:
            "Artifical Intelligence (ai) Based Video Analytics Software",
          category_id: "home_info_soft_indu_arti",
        },
        {
          category_name: "Cyber Security Software / Appliances",
          category_id: "home_info_soft_secu_cy58162858",
        },
        {
          category_name: "Audit And Compliance Software",
          category_id: "home_info_soft_soft_audi",
        },
        {
          category_name:
            "System Integration For Networking And Computing Devices",
          category_id: "home_info_data_netw_syst",
        },
        { category_name: "Ai System", category_id: "home_info_comp_comp_aisy" },
        {
          category_name: "IT Professional Outsourcing Service",
          category_id: "services_home_itpr",
        },
        {
          category_name: "IT Consultants Hiring Services",
          category_id: "services_home_pr22455282_co24172185",
        },
        {
          category_name: "Application Development",
          category_id: "services_home_appl",
        },
      ];

      console.log(`🚀 Fetching bids for ${categories.length} categories...`);

      const fetchWithRetry = async (
        url: string,
        options: any,
        maxRetries = 3
      ) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const response = await fetch(url, {
              ...options,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
          } catch (error: any) {
            if (attempt === maxRetries) throw error;
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
        throw new Error("Max retries exceeded");
      };

      const fetchCategoryBids = async (category: any) => {
        try {
          let allBids: any[] = [];
          let page = 1;
          let hasMorePages = true;

          while (hasMorePages) {
            const payload = {
              searchType: "bidNumber",
              bidNumber: "",
              category: category.category_id,
              bidEndFrom: "",
              bidEndTo: endDate || "",
              page: page,
            };

            const body = `payload=${encodeURIComponent(
              JSON.stringify(payload)
            )}&csrf_bd_gem_nk=${csrfToken}`;

            const response = await fetchWithRetry(
              "https://bidplus.gem.gov.in/search-bids",
              {
                method: "POST",
                headers: {
                  accept: "application/json, text/javascript, */*; q=0.01",
                  "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                  "x-requested-with": "XMLHttpRequest",
                  cookie: `csrf_gem_cookie=${csrfToken}; GeM=1474969956.20480.0000`,
                },
                body: body,
              }
            );

            if (!response || !response.ok) {
              break;
            }

            const data: any = await response.json();

            if (data.response?.response?.docs?.length > 0) {
              const bids = data.response.response.docs.map((doc: any) => ({
                gem_bid_id: doc.id,
                bid_number: doc.b_bid_number ? doc.b_bid_number[0] : "N/A",
                category_name: category.category_name,
                category_id: category.category_id,
                quantity: doc.b_total_quantity ? doc.b_total_quantity[0] : null,
                end_date: doc.final_end_date_sort
                  ? new Date(doc.final_end_date_sort[0]).toISOString()
                  : null,
                department: doc["ba_official_details_deptName"]
                  ? doc["ba_official_details_deptName"][0]
                  : null,
                status: "available",
              }));

              allBids = [...allBids, ...bids];

              const totalCount = data.response.response.numFound || 0;
              const currentCount = page * 10;
              hasMorePages = currentCount < totalCount;
              page++;

              if (hasMorePages) {
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } else {
              hasMorePages = false;
            }
          }

          return allBids;
        } catch (error: any) {
          console.error(
            `Error fetching ${category.category_name}:`,
            error.message
          );
          return [];
        }
      };

      const BATCH_SIZE = 50;
      const allBids: any[] = [];

      for (let i = 0; i < categories.length; i += BATCH_SIZE) {
        const batch = categories.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map((category) => fetchCategoryBids(category))
        );
        allBids.push(...batchResults.flat());

        if (i + BATCH_SIZE < categories.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Deduplicate bids by gem_bid_id (keep first occurrence)
      const uniqueBidsMap = new Map();
      allBids.forEach((bid) => {
        if (!uniqueBidsMap.has(bid.gem_bid_id)) {
          uniqueBidsMap.set(bid.gem_bid_id, bid);
        }
      });
      const uniqueBids = Array.from(uniqueBidsMap.values());

      // Check for existing rejected bids
      const { data: rejectedBids } = await supabase
        .from("bids")
        .select("gem_bid_id")
        .eq("status", "rejected");

      const rejectedBidIds = new Set(
        rejectedBids?.map((b) => b.gem_bid_id) || []
      );

      // Filter out rejected bids and save new ones
      const newBids = uniqueBids.filter(
        (bid) => !rejectedBidIds.has(bid.gem_bid_id)
      );

      if (newBids.length > 0) {
        // Upsert bids (insert new, update existing)
        const { error } = await supabase.from("bids").upsert(newBids, {
          onConflict: "gem_bid_id",
          ignoreDuplicates: false,
        });

        if (error) {
          console.error("Error saving bids:", error);
          throw error;
        }
      }

      res.json({
        message: "Bids fetched successfully",
        totalFetched: allBids.length,
        uniqueBids: uniqueBids.length,
        duplicatesRemoved: allBids.length - uniqueBids.length,
        newBidsAdded: newBids.length,
        rejectedFiltered: uniqueBids.length - newBids.length,
      });
    } catch (error: any) {
      console.error("Fetch bids error:", error);
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  }
);

// Get all unique categories
router.get("/categories", authenticate, async (req: Request, res: Response) => {
  try {
    const { data: bids, error } = await supabase
      .from("bids")
      .select("category_name, category_id")
      .neq("status", "rejected");

    if (error) throw error;

    // Get unique categories
    const uniqueCategories = Array.from(
      new Map(
        bids?.map((bid) => [
          bid.category_name,
          { name: bid.category_name, id: bid.category_id },
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    res.json({ categories: uniqueCategories });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get available bids (exclude rejected) - Admin & Member
router.get("/available", authenticate, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let query = supabase.from("bids").select("*").neq("status", "rejected");

    // Filter by category if provided
    if (category && typeof category === "string") {
      query = query.eq("category_name", category);
    }

    const { data: bids, error } = await query.order("end_date", {
      ascending: true,
    });

    if (error) throw error;

    res.json({ bids });
  } catch (error: any) {
    console.error("Get bids error:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// Get bids assigned to member
router.get("/my-bids", authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const { category } = req.query;

    let query = supabase
      .from("bids")
      .select("*")
      .eq("assigned_to", authReq.user!.id)
      .neq("status", "rejected");

    // Filter by category if provided
    if (category && typeof category === "string") {
      query = query.eq("category_name", category);
    }

    const { data: bids, error } = await query.order("due_date", {
      ascending: true,
    });

    if (error) throw error;

    res.json({ bids });
  } catch (error: any) {
    console.error("Get my bids error:", error);
    res.status(500).json({ error: "Failed to fetch assigned bids" });
  }
});

// Assign bid to member (admin only)
router.post(
  "/:bidId/assign",
  authenticate,
  isAdmin,
  [
    body("assignedTo").notEmpty(),
    body("assignedUserName").notEmpty(),
    body("dueDate").optional().isISO8601(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { bidId } = req.params;
      const { assignedTo, assignedUserName, dueDate } = req.body;

      const { data: bid, error } = await supabase
        .from("bids")
        .update({
          status: "considered",
          assigned_to: assignedTo,
          assigned_user_name: assignedUserName,
          due_date: dueDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bidId)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: "Bid assigned successfully", bid });
    } catch (error: any) {
      console.error("Assign bid error:", error);
      res.status(500).json({ error: "Failed to assign bid" });
    }
  }
);

// Update bid status
router.patch(
  "/:bidId/status",
  authenticate,
  [
    body("status").isIn([
      "available",
      "rejected",
      "considered",
      "in-progress",
      "submitted",
    ]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { bidId } = req.params;
      const { status, submittedDocLink } = req.body;
      const authReq = req as unknown as AuthRequest;

      // Check if user is admin or the assigned member
      const { data: bid } = await supabase
        .from("bids")
        .select("assigned_to")
        .eq("id", bidId)
        .single();

      if (
        authReq.user!.role !== "admin" &&
        bid?.assigned_to !== authReq.user!.id
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this bid" });
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "submitted" && submittedDocLink) {
        updateData.submitted_doc_link = submittedDocLink;
      }

      const { data: updatedBid, error } = await supabase
        .from("bids")
        .update(updateData)
        .eq("id", bidId)
        .select()
        .single();

      if (error) throw error;

      res.json({ message: "Bid status updated successfully", bid: updatedBid });
    } catch (error: any) {
      console.error("Update bid status error:", error);
      res.status(500).json({ error: "Failed to update bid status" });
    }
  }
);

// Get bid statistics (admin only)
router.get(
  "/stats",
  authenticate,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { category } = req.query;

      let query = supabase.from("bids").select("status, category_name");

      // Filter by category if provided
      if (category && typeof category === "string") {
        query = query.eq("category_name", category);
      }

      const { data: bids } = await query;

      const stats = {
        total: bids?.length || 0,
        available: bids?.filter((b) => b.status === "available").length || 0,
        considered: bids?.filter((b) => b.status === "considered").length || 0,
        inProgress: bids?.filter((b) => b.status === "in-progress").length || 0,
        submitted: bids?.filter((b) => b.status === "submitted").length || 0,
        rejected: bids?.filter((b) => b.status === "rejected").length || 0,
      };

      res.json({ stats });
    } catch (error: any) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  }
);

// Download document
router.get(
  "/document/:gemBidId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { gemBidId } = req.params;

      const documentUrl = `https://bidplus.gem.gov.in/showbidDocument/${gemBidId}`;
      const response = await fetch(documentUrl);

      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: "Failed to download document" });
      }

      const buffer = await response.arrayBuffer();
      const contentType =
        response.headers.get("content-type") || "application/pdf";
      const extension = contentType.includes("pdf") ? "pdf" : "doc";
      const filename = `${gemBidId}.${extension}`;

      res.set({
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      });

      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Download document error:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  }
);

export default router;
