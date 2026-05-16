export function normalizeNepalPhone(phone: string) {
  const cleaned = phone.replace(/[\s-]/g, "");

  if (cleaned.startsWith("+977")) {
    return cleaned.slice(4);
  }

  if (cleaned.startsWith("977")) {
    return cleaned.slice(3);
  }

  return cleaned;
}

export function isValidNepalMobile(phone: string) {
  return /^9[678]\d{8}$/.test(phone);
}
