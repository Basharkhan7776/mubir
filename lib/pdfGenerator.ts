import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction, Organization } from './types';

/**
 * Generate PDF for a party's ledger
 */
export async function generateLedgerPDF(
  organization: Organization,
  transactions: Transaction[],
  currency: string = '₹',
  orgName: string = 'Mudir'
): Promise<void> {
  try {
    const balance = calculateBalance(transactions);
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const html = generateLedgerHTML(
      organization,
      sortedTransactions,
      balance,
      currency,
      orgName
    );

    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${organization.name} - Ledger`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Calculate balance from transactions
 */
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, transaction) => {
    return transaction.type === 'CREDIT' ? acc - transaction.amount : acc + transaction.amount;
  }, 0);
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate HTML for ledger PDF
 */
function generateLedgerHTML(
  organization: Organization,
  transactions: Transaction[],
  balance: number,
  currency: string,
  orgName: string
): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const transactionRows = transactions
    .map(
      (transaction, index) => `
    <tr class="${index % 2 === 0 ? 'even-row' : ''}">
      <td>${new Date(transaction.date).toLocaleDateString('en-IN')}</td>
      <td>${transaction.remark || '-'}</td>
      <td class="amount ${transaction.type === 'DEBIT' ? 'debit' : ''}">${
        transaction.type === 'DEBIT' ? formatCurrency(transaction.amount, currency) : '-'
      }</td>
      <td class="amount ${transaction.type === 'CREDIT' ? 'credit' : ''}">${
        transaction.type === 'CREDIT' ? formatCurrency(transaction.amount, currency) : '-'
      }</td>
    </tr>
  `
    )
    .join('');

  const totalCredit = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceColor = balance > 0 ? '#16a34a' : balance < 0 ? '#dc2626' : '#6b7280';
  const balanceText =
    balance > 0
      ? `You will get ${formatCurrency(balance, currency)}`
      : balance < 0
      ? `You will give ${formatCurrency(-balance, currency)}`
      : 'Settled';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Ledger - ${organization.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 40px;
          color: #1f2937;
          line-height: 1.6;
        }

        .header {
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }

        .org-name {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .document-title {
          font-size: 20px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .party-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .party-name {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .party-details {
          display: flex;
          gap: 20px;
          color: #6b7280;
          font-size: 14px;
        }

        .balance-card {
          background: linear-gradient(135deg, ${balanceColor}15 0%, ${balanceColor}05 100%);
          border-left: 4px solid ${balanceColor};
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 8px;
        }

        .balance-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .balance-amount {
          font-size: 28px;
          font-weight: bold;
          color: ${balanceColor};
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        thead {
          background: #f3f4f6;
        }

        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }

        .even-row {
          background: #f9fafb;
        }

        .amount {
          text-align: right;
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .debit {
          color: #16a34a;
        }

        .credit {
          color: #dc2626;
        }

        .summary {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .summary-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1f2937;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-row:last-child {
          border-bottom: none;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #3b82f6;
          font-weight: 600;
          font-size: 16px;
        }

        .summary-label {
          color: #6b7280;
        }

        .summary-value {
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }

        .no-transactions {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
          font-style: italic;
        }

        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="org-name">${orgName}</div>
        <div class="document-title">Ledger Statement</div>
      </div>

      <div class="party-info">
        <div class="party-name">${organization.name}</div>
        <div class="party-details">
          ${organization.phone ? `<span>📞 ${organization.phone}</span>` : ''}
          ${organization.email ? `<span>✉️ ${organization.email}</span>` : ''}
        </div>
      </div>

      <div class="balance-card">
        <div class="balance-label">Current Balance</div>
        <div class="balance-amount">${balanceText}</div>
      </div>

      ${
        transactions.length > 0
          ? `
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Date</th>
            <th style="width: 45%;">Particulars</th>
            <th style="width: 20%; text-align: right;">You Took</th>
            <th style="width: 20%; text-align: right;">You Gave</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-title">Summary</div>
        <div class="summary-row">
          <span class="summary-label">Total Debit (You Took)</span>
          <span class="summary-value debit">${formatCurrency(totalDebit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Credit (You Gave)</span>
          <span class="summary-value credit">${formatCurrency(totalCredit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Net Balance</span>
          <span class="summary-value" style="color: ${balanceColor};">${balanceText}</span>
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
    transactions.length !== 1 ? 's' : ''
  }
      </div>
    </body>
    </html>
  `;
}
