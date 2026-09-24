import { createClient } from "@supabase/supabase-js";
import type {
  Client,
  Contact,
  Project,
  ProjectStep,
  Service,
  TimeEntry,
  Invoice,
  InvoiceItem,
} from "../types";
import { CookieService } from "./cookieService";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
  // Client operations
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("zoro_clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    console.log(data);
    return data || [];
  }

  static async getClient(id: string): Promise<Client> {
    const { data, error } = await supabase
      .from("zoro_clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async createClient(
    client: Omit<Client, "id" | "created_at" | "updated_at">,
  ): Promise<Client> {
    const { data, error } = await supabase
      .from("zoro_clients")
      .insert([client])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateClient(
    id: string,
    updates: Partial<Client>,
  ): Promise<Client> {
    const { data, error } = await supabase
      .from("zoro_clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase.from("zoro_clients").delete().eq("id", id);
    console.error(error);
    if (error) throw error;
  }

  // Contact operations
  static async getContacts(clientId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from("zoro_contacts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getContact(id: string): Promise<Contact> {
    const { data, error } = await supabase
      .from("zoro_contacts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async createContact(
    contact: Omit<Contact, "id" | "created_at" | "updated_at">,
  ): Promise<Contact> {
    const { data, error } = await supabase
      .from("zoro_contacts")
      .insert([contact])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateContact(
    id: string,
    updates: Partial<Contact>,
  ): Promise<Contact> {
    const { data, error } = await supabase
      .from("zoro_contacts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_contacts")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Project operations
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("zoro_projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getProject(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from("zoro_projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project> {
    const { data, error } = await supabase
      .from("zoro_projects")
      .insert([project])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateProject(
    id: string,
    updates: Partial<Project>,
  ): Promise<Project> {
    const { data, error } = await supabase
      .from("zoro_projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_projects")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Time Entry operations
  static async getTimeEntries(projectId?: string): Promise<TimeEntry[]> {
    let query = supabase.from("zoro_time_entries").select("*");
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query.order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getTimeEntriesByIds(ids: string[]): Promise<TimeEntry[]> {
    const entries: TimeEntry[] = [];
    const uniqueIds = [...new Set(ids)];
    for (let offset = 0; offset < uniqueIds.length; offset += 100) {
      const { data, error } = await supabase
        .from("zoro_time_entries")
        .select("*")
        .in("id", uniqueIds.slice(offset, offset + 100));
      if (error) throw error;
      entries.push(...(data || []));
    }
    return entries;
  }

  static async createTimeEntry(
    entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">,
  ): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("zoro_time_entries")
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateTimeEntry(
    id: string,
    updates: Partial<TimeEntry>,
  ): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("zoro_time_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteTimeEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_time_entries")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Invoice operations
  static async getInvoices(projectId?: string): Promise<Invoice[]> {
    let query = supabase.from("zoro_invoices").select("*");
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query.order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createInvoice(
    invoice: Omit<Invoice, "id" | "created_at" | "updated_at">,
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from("zoro_invoices")
      .insert([invoice])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getProjectTimeEntries(
    projectId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TimeEntry[]> {
    let query = supabase
      .from("zoro_time_entries")
      .select("*")
      .eq("project_id", projectId);

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query.order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getInvoice(id: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from("zoro_invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async updateInvoice(
    id: string,
    updates: Partial<Invoice>,
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from("zoro_invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_invoices")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Invoice items operations
  static async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const { data, error } = await supabase
      .from("zoro_invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async createInvoiceItem(
    item: Omit<InvoiceItem, "id">,
  ): Promise<InvoiceItem> {
    const { data, error } = await supabase
      .from("zoro_invoice_items")
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteInvoiceItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_invoice_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
  }

  static async updateInvoiceItem(
    itemId: string,
    updates: Partial<InvoiceItem>,
  ): Promise<InvoiceItem> {
    const { data, error } = await supabase
      .from("zoro_invoice_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Project steps operations
  static async getProjectSteps(projectId: string): Promise<ProjectStep[]> {
    const { data, error } = await supabase
      .from("zoro_project_steps")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async getProjectStep(id: string): Promise<ProjectStep> {
    const { data, error } = await supabase
      .from("zoro_project_steps")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async createProjectStep(
    step: Omit<ProjectStep, "id" | "created_at" | "updated_at">,
  ): Promise<ProjectStep> {
    const { data, error } = await supabase
      .from("zoro_project_steps")
      .insert([step])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateProjectStep(
    id: string,
    updates: Partial<ProjectStep>,
  ): Promise<ProjectStep> {
    const { data, error } = await supabase
      .from("zoro_project_steps")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteProjectStep(id: string): Promise<void> {
    const { error } = await supabase
      .from("zoro_project_steps")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // Service operations
  static async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from("zoro_services")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async getService(id: string): Promise<Service> {
    const { data, error } = await supabase
      .from("zoro_services")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static calculateInvoiceTotal(
    entries: TimeEntry[],
    hourlyRate: number,
  ): number {
    return entries.reduce(
      (total, entry) => total + entry.hours * hourlyRate,
      0,
    );
  }

  // Auth operations - Custom authentication using zoro_users table
  static async signInWithPassword(email: string, password: string) {
    // Query the zoro_users table
    const { data: user, error } = await supabase
      .from("zoro_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.error("User not found:", error);
      throw new Error("Email ou mot de passe incorrect");
    }

    console.log("User found:", user.email);
    console.log("Stored password hash:", user.password_hash);

    // Verify password (basic comparison - use bcryptjs in production)
    // For now, passwords are stored as plain text or hashed server-side
    const passwordMatch = await this.verifyPassword(
      password,
      user.password_hash,
    );

    console.log("Password match result:", passwordMatch);

    if (!passwordMatch) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Create session token
    const sessionToken = this.generateSessionToken();
    localStorage.setItem("zoro_auth_token", sessionToken);
    localStorage.setItem("zoro_user_email", user.email);
    localStorage.setItem("zoro_user_id", user.id);

    // Also set cookies for persistence
    CookieService.setCookie("zoro_auth_token", sessionToken);
    CookieService.setCookie("zoro_user_email", user.email);
    CookieService.setCookie("zoro_user_id", user.id);

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
  }

  static async signUpWithPassword(email: string, password: string) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("zoro_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      throw new Error("Cet email est déjà enregistré");
    }

    // Hash the password (basic - consider using bcryptjs)
    const passwordHash = await this.hashPassword(password);

    // Insert new user
    const { data: newUser, error } = await supabase
      .from("zoro_users")
      .insert([
        {
          email,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error || !newUser) {
      throw new Error("Erreur lors de la création du compte");
    }

    // Create session token
    const sessionToken = this.generateSessionToken();
    localStorage.setItem("zoro_auth_token", sessionToken);
    localStorage.setItem("zoro_user_email", newUser.email);
    localStorage.setItem("zoro_user_id", newUser.id);

    // Also set cookies for persistence
    CookieService.setCookie("zoro_auth_token", sessionToken);
    CookieService.setCookie("zoro_user_email", newUser.email);
    CookieService.setCookie("zoro_user_id", newUser.id);

    return {
      id: newUser.id,
      email: newUser.email,
      created_at: newUser.created_at,
    };
  }

  static async signOut() {
    localStorage.removeItem("zoro_auth_token");
    localStorage.removeItem("zoro_user_email");
    localStorage.removeItem("zoro_user_id");

    // Also clear cookies
    CookieService.clearAuthCookies();
  }

  static async getCurrentUser() {
    let userId = localStorage.getItem("zoro_user_id");
    let userEmail = localStorage.getItem("zoro_user_email");

    // If not in localStorage, check cookies
    if (!userId || !userEmail) {
      userId = CookieService.getCookie("zoro_user_id");
      userEmail = CookieService.getCookie("zoro_user_email");

      // Restore to localStorage from cookies
      if (userId && userEmail) {
        localStorage.setItem("zoro_user_id", userId);
        localStorage.setItem("zoro_user_email", userEmail);
      }
    }

    if (!userId || !userEmail) {
      return null;
    }

    // Verify user still exists
    const { data: user, error } = await supabase
      .from("zoro_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      localStorage.removeItem("zoro_auth_token");
      localStorage.removeItem("zoro_user_email");
      localStorage.removeItem("zoro_user_id");
      CookieService.clearAuthCookies();
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
  }

  static async sendPasswordRecoveryLink(email: string) {
    // Check if user exists
    const { data: user, error } = await supabase
      .from("zoro_users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !user) {
      // Don't reveal if email exists (security)
      return;
    }

    // Generate recovery token
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store the recovery token
    const { error: tokenError } = await supabase.from("zoro_password_reset_tokens").insert([
      {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    ]);

    if (tokenError) {
      throw new Error("Impossible de créer le lien de réinitialisation");
    }

    // Send password reset email via Edge Function
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "send-password-reset-email",
        {
          body: {
            email,
            resetToken: token,
          },
        },
      );

      if (invokeError) {
        console.error(
          "Failed to invoke password reset email function:",
          invokeError,
        );
        throw new Error("Échec de l'envoi de l'email de réinitialisation");
      }

      if (!data?.success) {
        console.error("Password reset email function returned error:", data);
        throw new Error(data?.message || "Échec de l'envoi de l'email");
      }

      console.log("Password reset email sent successfully to:", email);
    } catch (err) {
      console.error("Error sending password reset email:", err);
      throw err;
    }
  }

  static async updatePassword(password: string, token?: string) {
    let userId: string | null = null;

    if (token) {
      // Verify the reset token
      const { data: resetToken, error } = await supabase
        .from("zoro_password_reset_tokens")
        .select("user_id, expires_at, used_at")
        .eq("token", token)
        .single();

      if (error || !resetToken || resetToken.used_at) {
        throw new Error("Lien de réinitialisation invalide ou expiré");
      }

      if (new Date(resetToken.expires_at) < new Date()) {
        throw new Error("Lien de réinitialisation expiré");
      }

      userId = resetToken.user_id;

      // Mark token as used
      await supabase
        .from("zoro_password_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);
    } else {
      // Update password for current user
      userId = localStorage.getItem("zoro_user_id");
    }

    if (!userId) {
      throw new Error("Utilisateur non trouvé");
    }

    // Hash the new password
    const passwordHash = await this.hashPassword(password);

    // Update user password
    const { error } = await supabase
      .from("zoro_users")
      .update({ password_hash: passwordHash })
      .eq("id", userId);

    if (error) {
      throw new Error("Erreur lors de la mise à jour du mot de passe");
    }
  }

  // Send invoice by email using Supabase Edge Function
  static async sendInvoiceEmail(data: {
    invoiceId: string;
    recipient: string[];
    subject: string;
    message: string;
    invoiceNumber: string;
    pdfBase64?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Convert Vue Proxy to plain array to ensure proper JSON serialization
      const plainRecipient = Array.isArray(data.recipient)
        ? [...data.recipient]
        : [];

      const { data: result, error } = await supabase.functions.invoke(
        "send-invoice-email",
        {
          body: {
            invoiceId: data.invoiceId,
            recipient: plainRecipient,
            subject: data.subject,
            message: data.message,
            invoiceNumber: data.invoiceNumber,
            pdfBase64: data.pdfBase64,
          },
        },
      );

      if (error) {
        // Try to extract the actual error body from the edge function response
        let detail = error.message;
        try {
          const ctx = (error as any).context as Response | undefined;
          if (ctx) {
            const body = await ctx.text();
            detail = body || detail;
          }
        } catch {}
        throw new Error(detail);
      }

      return result as { success: boolean; message: string };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error(
        `Erreur lors de l'envoi de l'email: ${(error as Error).message || "Veuillez réessayer plus tard"}`,
      );
    }
  }

  // Save email log
  static async saveEmailLog(log: {
    invoice_id: string;
    recipient: string;
    subject: string;
    message: string;
    sent_at: string;
    success: boolean;
    error_message: string | null;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("zoro_email_logs").insert([log]);
      if (error) throw error;
      console.log("Email log saved successfully");
    } catch (error) {
      console.error("Error saving email log:", error);
      throw error;
    }
  }

  // Get email logs for an invoice
  static async getEmailLogs(invoiceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("zoro_email_logs")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching email logs:", error);
      throw error;
    }
  }

  // Helper methods for password hashing and session tokens
  private static async hashPassword(password: string): Promise<string> {
    // Simple implementation - for production, use bcryptjs
    // This is a placeholder that creates a basic hash
    // IMPORTANT: Replace this with proper bcryptjs implementation
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    // Simple implementation - for production, use bcryptjs
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    console.log("Computed password hash:", computedHash);
    console.log("Stored password hash: ", hash);
    console.log("Hashes match:", computedHash === hash);

    return computedHash === hash;
  }

  private static generateSessionToken(): string {
    // Generate a random session token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
}
