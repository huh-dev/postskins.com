function formatMoney(minor, currency = "USD") {
  const value = (minor ?? 0) / 100;
  try {
    return new Intl.NumberFormat(void 0, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export { formatMoney as f };
//# sourceMappingURL=format-BBBd5tQz.mjs.map
