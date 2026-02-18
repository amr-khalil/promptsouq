import { resend } from "@/lib/resend";

const FROM = "PromptSouq <onboarding@resend.dev>";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPromptApprovedEmail({
  sellerEmail,
  promptTitle,
}: {
  sellerEmail: string;
  promptTitle: string;
}) {
  try {
    const title = escapeHtml(promptTitle);
    await resend.emails.send({
      from: FROM,
      to: sellerEmail,
      subject: `Your prompt "${promptTitle}" has been approved!`,
      html: `
        <h2>Congratulations!</h2>
        <p>Your prompt <strong>${title}</strong> has been reviewed and approved.</p>
        <p>It is now live on PromptSouq and available for buyers to purchase.</p>
        <br />
        <p>— The PromptSouq Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
}

export async function sendPromptRejectedEmail({
  sellerEmail,
  promptTitle,
  reason,
}: {
  sellerEmail: string;
  promptTitle: string;
  reason?: string | null;
}) {
  try {
    const title = escapeHtml(promptTitle);
    const reasonBlock = reason
      ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`
      : "";
    await resend.emails.send({
      from: FROM,
      to: sellerEmail,
      subject: `Your prompt "${promptTitle}" was not approved`,
      html: `
        <h2>Prompt Review Update</h2>
        <p>Your prompt <strong>${title}</strong> has been reviewed but was not approved at this time.</p>
        ${reasonBlock}
        <p>You can update your prompt and resubmit it for review.</p>
        <br />
        <p>— The PromptSouq Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send rejection email:", error);
  }
}
