import crypto from "crypto";
import moment from "moment";

export function generateSecureUserId(role: string): string {
  const rolePrefix =
    role === "student"
      ? "STU"
      : role === "instructor"
      ? "INS"
      : role === "vipstudent"
      ? "VIP"
      : "ADM";
  const datePart = moment().format("YYMMDD");

  let randomPart = "";

  // Keep generating until last character is a digit
  while (true) {
    const bytes = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
    if (/\d$/.test(bytes)) {
      randomPart = bytes;
      break;
    }
  }

  return `${rolePrefix}-${datePart}-${randomPart}`;
}
