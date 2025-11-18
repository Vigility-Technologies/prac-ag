import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { csrfToken, endDate } = await request.json();

    if (!csrfToken) {
      return NextResponse.json(
        { error: "CSRF token is required" },
        { status: 400 }
      );
    }

    // Read categories from the parent directory
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
      {
        category_name: "Cloud Service",
        category_id: "home_clou",
      },
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
      {
        category_name: "Ai System",
        category_id: "home_info_comp_comp_aisy",
      },
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

    // Function to fetch with exponential backoff retry
    const fetchWithRetry = async (
      url: string,
      options: any,
      maxRetries = 3
    ) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          const isLastAttempt = attempt === maxRetries;

          if (isLastAttempt) {
            throw error;
          }

          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(
            `⚠️ Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw new Error("Max retries exceeded");
    };

    // Function to fetch all pages for a single category
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

          let response;
          try {
            response = await fetchWithRetry(
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
          } catch (fetchError: any) {
            console.error(
              `❌ Failed to fetch ${category.category_name} (page ${page}) after retries:`,
              fetchError.message
            );
            break;
          }

          if (!response) {
            console.error(
              `Failed to fetch ${category.category_name} after retries`
            );
            break;
          }

          if (!response.ok) {
            console.log(
              `Failed to fetch bids for ${category.category_name} (page ${page}): ${response.statusText}`,
              "error =>",
              response
            );
            console.error(
              `Failed for ${category.category_name} (page ${page}): ${response.status}`
            );
            break;
          }

          const data = await response.json();

          if (
            data.response &&
            data.response.response &&
            data.response.response.docs &&
            data.response.response.docs.length > 0
          ) {
            const bids = data.response.response.docs.map((doc: any) => ({
              id: doc.id,
              bid_number: doc.b_bid_number ? doc.b_bid_number[0] : "N/A",
              quantity: doc.b_total_quantity ? doc.b_total_quantity[0] : null,
              end_date: doc.final_end_date_sort
                ? new Date(doc.final_end_date_sort[0]).toLocaleDateString()
                : null,
              department: doc["ba_official_details_deptName"]
                ? doc["ba_official_details_deptName"][0]
                : null,
            }));

            allBids = [...allBids, ...bids];

            // Check if there are more pages
            const totalCount = data.response.response.numFound || 0;
            const currentCount = page * 10; // Assuming 10 results per page
            hasMorePages = currentCount < totalCount;
            page++;

            console.log(
              `📄 ${category.category_name}: Page ${page - 1} fetched (${
                bids.length
              } bids)`
            );
          } else {
            hasMorePages = false;
          }

          // Delay between pages to avoid rate limiting
          if (hasMorePages) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (allBids.length > 0) {
          console.log(
            `✅ ${category.category_name}: Total ${allBids.length} bids`
          );
          return {
            category_name: category.category_name,
            category_id: category.category_id,
            bids: allBids,
          };
        }

        return null;
      } catch (error: any) {
        console.error(
          `Error fetching ${category.category_name}:`,
          error,
          error.message
        );
        return null;
      }
    };

    // Process categories in smaller batches (2 at a time) to avoid connection pool exhaustion
    const BATCH_SIZE = 2;
    const allResults: any[] = [];

    for (let i = 0; i < categories.length; i += BATCH_SIZE) {
      const batch = categories.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(categories.length / BATCH_SIZE);

      console.log(
        `🔄 Batch ${batchNum}/${totalBatches}: ${batch
          .map((c) => c.category_name)
          .join(", ")}`
      );

      const batchResults = await Promise.all(
        batch.map((category) => fetchCategoryBids(category))
      );

      allResults.push(...batchResults);

      // Longer delay between batches to avoid overwhelming Netlify's connection pool
      if (i + BATCH_SIZE < categories.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Filter out null results and calculate stats
    const validResults = allResults.filter((result) => result !== null);
    const totalBids = validResults.reduce(
      (sum, result) => sum + result!.bids.length,
      0
    );
    const categoriesWithBids = validResults.length;

    return NextResponse.json({
      stats: {
        totalCategories: categories.length,
        categoriesWithBids: categoriesWithBids,
        totalBids: totalBids,
      },
      categories: validResults,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
