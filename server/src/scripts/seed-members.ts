import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";

const members = [
  { full_name: "Fahad", email: "fahad@vigility.in" },
  { full_name: "Rishabh", email: "rishabh@vigility.in" },
  { full_name: "Sarabhjeet", email: "sarabhjeet@vigility.in" },
  { full_name: "Manvi", email: "manvi@vigility.in" },
  { full_name: "Sahil", email: "sahil@vigility.in" },
  { full_name: "Anand", email: "anand@vigility.in" },
  { full_name: "Deepak", email: "deepak@vigility.in" },
];

const DEFAULT_PASSWORD = "Member@123"; // Change this to your preferred default password

async function seedMembers() {
  try {
    console.log("🌱 Seeding members...");

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const membersToInsert = members.map((member) => ({
      email: member.email,
      password: hashedPassword,
      full_name: member.full_name,
      role: "member",
    }));

    // Check for existing members
    const { data: existingUsers } = await supabase
      .from("users")
      .select("email")
      .in(
        "email",
        members.map((m) => m.email)
      );

    const existingEmails = new Set(existingUsers?.map((u) => u.email) || []);
    const newMembers = membersToInsert.filter(
      (m) => !existingEmails.has(m.email)
    );

    if (newMembers.length === 0) {
      console.log("✅ All members already exist in the database");
      return;
    }

    const { data: createdMembers, error } = await supabase
      .from("users")
      .insert(newMembers)
      .select("id, email, full_name, created_at");

    if (error) throw error;

    console.log(`✅ Successfully created ${createdMembers?.length} members:`);
    createdMembers?.forEach((member) => {
      console.log(`   - ${member.full_name} (${member.email})`);
    });

    if (existingEmails.size > 0) {
      console.log(`ℹ️  ${existingEmails.size} members already existed`);
    }

    console.log(`\n🔑 Default password for all members: ${DEFAULT_PASSWORD}`);
    console.log(
      "⚠️  Please advise members to change their password after first login\n"
    );
  } catch (error: any) {
    console.error("❌ Error seeding members:", error.message);
    process.exit(1);
  }
}

// Run the seed function
seedMembers()
  .then(() => {
    console.log("✨ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
