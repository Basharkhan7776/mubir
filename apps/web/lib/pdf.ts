import { Organization, Transaction, Receipt } from "@mudir/types";

function formatCurrency(amount: number, currency: string = "₹"): string {
  return `${currency} ${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateLedgerHTML(
  organization: Organization,
  transactions: Transaction[],
  balance: number,
  currency: string = "₹",
  orgName: string = "Mudir"
): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const transactionRows = sortedTransactions
    .map(
      (transaction) => `
    <tr>
      <td>${new Date(transaction.date).toLocaleDateString("en-IN")}</td>
      <td>${transaction.remark || "-"}</td>
      <td class="amount">${
        transaction.type === "DEBIT" ? formatCurrency(transaction.amount, currency) : "-"
      }</td>
      <td class="amount">${
        transaction.type === "CREDIT" ? formatCurrency(transaction.amount, currency) : "-"
      }</td>
    </tr>
  `
    )
    .join("");

  const totalCredit = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceText =
    balance > 0
      ? `You will get ${formatCurrency(balance, currency)}`
      : balance < 0
      ? `You will give ${formatCurrency(-balance, currency)}`
      : "Settled";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Ledger - ${organization.name}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          color: #000;
          line-height: 1.3;
          padding: 15mm;
          background: #fff;
        }

        .header {
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }

        .org-name {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .document-title {
          font-size: 11px;
          color: #000;
          font-weight: bold;
        }

        .info-section {
          margin-bottom: 12px;
        }

        .party-info {
          border: 1px solid #000;
          padding: 8px 10px;
          margin-bottom: 10px;
        }

        .party-name {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }

        .party-details {
          color: #000;
          font-size: 9px;
          line-height: 1.4;
        }

        .balance-card {
          border: 1.5px solid #000;
          padding: 8px 10px;
          margin-bottom: 12px;
          background: #fff;
        }

        .balance-label {
          font-size: 9px;
          color: #000;
          margin-bottom: 3px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .balance-amount {
          font-size: 12px;
          font-weight: bold;
          color: #000;
        }

        .table-container {
          page-break-inside: auto;
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
          page-break-inside: auto;
        }

        thead {
          display: table-header-group;
        }

        tbody {
          display: table-row-group;
        }

        th {
          padding: 6px 5px;
          text-align: left;
          font-weight: bold;
          color: #000;
          font-size: 9px;
          text-transform: uppercase;
          border-bottom: 1.5px solid #000;
          border-right: 1px solid #000;
          background: #fff;
        }

        th:last-child {
          border-right: none;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          padding: 6px 5px;
          border-bottom: 1px solid #ddd;
          border-right: 1px solid #000;
          font-size: 9px;
          color: #000;
        }

        td:last-child {
          border-right: none;
        }

        td.amount {
          font-family: 'Courier New', monospace;
          text-align: right;
        }

        .summary {
          border: 1.5px solid #000;
          padding: 10px;
          margin-top: 15px;
          page-break-inside: avoid;
        }

        .summary-title {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 6px;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 9px;
        }

        .summary-row:last-child {
          border-bottom: none;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1.5px solid #000;
          font-weight: bold;
          font-size: 10px;
        }

        .summary-label {
          color: #000;
        }

        .summary-value {
          font-weight: normal;
          font-family: 'Courier New', monospace;
          color: #000;
        }

        .footer {
          margin-top: 15px;
          padding-top: 8px;
          border-top: 1px solid #000;
          text-align: center;
          color: #666;
          font-size: 8px;
          page-break-inside: avoid;
        }

        .no-transactions {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
          font-size: 9px;
        }

        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="org-name">${orgName}</div>
        <div class="document-title">LEDGER STATEMENT</div>
      </div>

      <div class="info-section">
        <div class="party-info">
          <div class="party-name">${organization.name}</div>
          <div class="party-details">
            ${organization.phone ? `<div>Phone: ${organization.phone}</div>` : ""}
          </div>
        </div>

        <div class="balance-card">
          <div class="balance-label">Current Balance</div>
          <div class="balance-amount">${balanceText}</div>
        </div>
      </div>

      ${
        transactions.length > 0
          ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">DATE</th>
              <th style="width: 45%;">PARTICULARS</th>
              <th style="width: 20%; text-align: right;">DEBIT</th>
              <th style="width: 20%; text-align: right;">CREDIT</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-title">Summary</div>
        <div class="summary-row">
          <span class="summary-label">Total Debit (You Took)</span>
          <span class="summary-value">${formatCurrency(totalDebit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Credit (You Gave)</span>
          <span class="summary-value">${formatCurrency(totalCredit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Net Balance</span>
          <span class="summary-value">${balanceText}</span>
        </div>
      </div>
      `
          : `
      <div class="no-transactions">
        No transactions found for this party.
      </div>
      `
      }

      <div class="footer">
        Generated on ${currentDate} | ${transactions.length} transaction${
    transactions.length !== 1 ? "s" : ""
  }
      </div>
    </body>
    </html>
  `;
}

export function generateReceiptHTML(
  receipt: Receipt,
  currency: string = "₹",
  orgName: string = "Mudir"
): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const receiptDate = new Date(receipt.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const totalAmount = receipt.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemRows = receipt.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td class="amount">${item.quantity}</td>
      <td class="amount">${formatCurrency(item.price, currency)}</td>
      <td class="amount">${formatCurrency(item.price * item.quantity, currency)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Receipt - ${receipt.customerName}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          color: #000;
          line-height: 1.3;
          padding: 15mm;
          background: #fff;
        }

        .header {
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }

        .org-name {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .document-title {
          font-size: 11px;
          color: #000;
          font-weight: bold;
        }

        .info-section {
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }

        .party-info {
          border: 1px solid #000;
          padding: 8px 10px;
          flex: 1;
          margin-right: 10px;
        }

        .party-name {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }

        .party-details {
          color: #000;
          font-size: 9px;
          line-height: 1.4;
        }

        .receipt-info {
          border: 1px solid #000;
          padding: 8px 10px;
          width: 200px;
        }

        .receipt-info div {
          margin-bottom: 4px;
        }

        .table-container {
          page-break-inside: auto;
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
          page-break-inside: auto;
        }

        thead {
          display: table-header-group;
        }

        tbody {
          display: table-row-group;
        }

        th {
          padding: 6px 5px;
          text-align: left;
          font-weight: bold;
          color: #000;
          font-size: 9px;
          text-transform: uppercase;
          border-bottom: 1.5px solid #000;
          border-right: 1px solid #000;
          background: #fff;
        }

        th:last-child {
          border-right: none;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          padding: 6px 5px;
          border-bottom: 1px solid #ddd;
          border-right: 1px solid #000;
          font-size: 9px;
          color: #000;
        }

        td:last-child {
          border-right: none;
        }

        td.amount {
          font-family: 'Courier New', monospace;
          text-align: right;
        }

        .summary {
          border: 1.5px solid #000;
          padding: 10px;
          margin-top: 15px;
          page-break-inside: avoid;
        }

        .summary-title {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 6px;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 9px;
        }

        .summary-row:last-child {
          border-bottom: none;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1.5px solid #000;
          font-weight: bold;
          font-size: 10px;
        }

        .summary-label {
          color: #000;
        }

        .summary-value {
          font-weight: normal;
          font-family: 'Courier New', monospace;
          color: #000;
        }

        .footer {
          margin-top: 15px;
          padding-top: 8px;
          border-top: 1px solid #000;
          text-align: center;
          color: #666;
          font-size: 8px;
          page-break-inside: avoid;
        }

        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="org-name">${orgName}</div>
        <div class="document-title">RECEIPT STATEMENT</div>
      </div>

      <div class="info-section">
        <div class="party-info">
          <div class="party-name">Customer: ${receipt.customerName}</div>
          <div class="party-details">
            ${receipt.phone ? `<div>Phone: ${receipt.phone}</div>` : ""}
            ${receipt.description ? `<div>Notes: ${receipt.description}</div>` : ""}
          </div>
        </div>

        <div class="receipt-info">
          <div><strong>Date:</strong> ${receiptDate}</div>
          <div><strong>Total:</strong> ${formatCurrency(totalAmount, currency)}</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">ITEM</th>
              <th style="width: 15%; text-align: right;">QTY</th>
              <th style="width: 20%; text-align: right;">PRICE</th>
              <th style="width: 20%; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-title">Summary</div>
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">${formatCurrency(totalAmount, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Paid</span>
          <span class="summary-value">${formatCurrency(totalAmount, currency)}</span>
        </div>
      </div>

      <div class="footer">
        Generated on ${currentDate} | ${receipt.items.length} item${
    receipt.items.length !== 1 ? "s" : ""
  }
      </div>
    </body>
    </html>
  `;
}

export function printHtmlDocument(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  } else {
    // Fallback to window.open if iframe window is not accessible
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }
}

export function printLedger(
  organization: Organization,
  transactions: Transaction[],
  balance: number,
  currency: string = "₹",
  orgName: string = "Mudir"
) {
  const html = generateLedgerHTML(
    organization,
    transactions,
    balance,
    currency,
    orgName
  );
  printHtmlDocument(html);
}

export function printReceipt(
  receipt: Receipt,
  currency: string = "₹",
  orgName: string = "Mudir"
) {
  const html = generateReceiptHTML(receipt, currency, orgName);
  printHtmlDocument(html);
}
