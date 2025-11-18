import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { supabase } from "../config/supabase";
import { authenticate, isAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Get all members (admin only)
router.get(
  "/members",
  authenticate,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const { data: members, error } = await supabase
        .from("users")
        .select("id, email, full_name, created_at")
        .eq("role", "member")
        .order("full_name");

      if (error) throw error;

      res.json({ members });
    } catch (error: any) {
      console.error("Get members error:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  }
);

// Bulk create members (admin only)
router.post(
  "/members/bulk",
  authenticate,
  isAdmin,
  [
    body("members").isArray({ min: 1 }),
    body("members.*.full_name").trim().notEmpty(),
    body("members.*.email").isEmail().normalizeEmail(),
    body("defaultPassword").optional().isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { members, defaultPassword = "Member@123" } = req.body;
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const membersToInsert = members.map((member: any) => ({
        email: member.email,
        password: hashedPassword,
        full_name: member.full_name,
        role: "member",
      }));

      const { data: createdMembers, error } = await supabase
        .from("users")
        .insert(membersToInsert)
        .select("id, email, full_name, created_at");

      if (error) throw error;

      res.status(201).json({
        message: `${createdMembers?.length || 0} members created successfully`,
        members: createdMembers,
        defaultPassword,
      });
    } catch (error: any) {
      console.error("Bulk create members error:", error);
      if (error.code === "23505") {
        res
          .status(400)
          .json({ error: "One or more email addresses already exist" });
      } else {
        res.status(500).json({ error: "Failed to create members" });
      }
    }
  }
);

export default router;
