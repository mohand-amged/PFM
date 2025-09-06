'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, Table, Calendar, TrendingUp } from 'lucide-react';

interface AnalyticsExportProps {
  data: {
    subscriptions: any[];
    expenses: any[];
    savings: any[];
    walletStats: any;
    financialHealth: any;
    trendData: any[];
    cashFlowData: any[];
  };
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({ data }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | null>(null);

  const generateCSVReport = () => {
    setIsExporting(true);
    setExportType('csv');

    try {
      // Prepare data for CSV export
      const reports = [];

      // Summary Report
      const summaryData = [
        ['Financial Analytics Report', ''],
        ['Generated On', new Date().toLocaleDateString()],
        ['', ''],
        ['SUMMARY METRICS', ''],
        ['Current Balance', `$${data.walletStats.wallet.balance.toFixed(2)}`],
        ['Monthly Income', `$${data.walletStats.monthlyIncome.toFixed(2)}`],
        ['Monthly Expenses', `$${data.walletStats.monthlyExpenses.toFixed(2)}`],
        ['Net Worth', `$${data.walletStats.netWorth.toFixed(2)}`],
        ['Financial Health Score', `${data.financialHealth.score}/100`],
        ['', ''],
        ['SUBSCRIPTIONS', ''],
        ['Service', 'Price', 'Billing Date', 'Category'],
        ...data.subscriptions.map(sub => [
          sub.name,
          `$${sub.price.toFixed(2)}`,
          new Date(sub.billingDate).toLocaleDateString(),
          sub.categories?.[0] || 'General'
        ]),
        ['', ''],
        ['EXPENSES', ''],
        ['Description', 'Amount', 'Category', 'Date'],
        ...data.expenses.map(exp => [
          exp.description || 'N/A',
          `$${exp.amount.toFixed(2)}`,
          exp.category || 'Other',
          new Date(exp.date).toLocaleDateString()
        ]),
        ['', ''],
        ['SAVINGS GOALS', ''],
        ['Goal', 'Target', 'Current', 'Progress'],
        ...data.savings.map(saving => [
          saving.goal || 'N/A',
          `$${saving.targetAmount.toFixed(2)}`,
          `$${saving.currentAmount.toFixed(2)}`,
          `${((saving.currentAmount / saving.targetAmount) * 100).toFixed(1)}%`
        ]),
        ['', ''],
        ['TREND DATA', ''],
        ['Month', 'Income', 'Expenses', 'Subscriptions', 'Savings'],
        ...data.trendData.map(trend => [
          trend.month,
          `$${trend.income.toFixed(2)}`,
          `$${trend.expenses.toFixed(2)}`,
          `$${trend.subscriptions.toFixed(2)}`,
          `$${trend.savings.toFixed(2)}`
        ]),
        ['', ''],
        ['CASH FLOW', ''],
        ['Period', 'Income', 'Expenses', 'Net Cash Flow', 'Cumulative'],
        ...data.cashFlowData.map(cf => [
          cf.period,
          `$${cf.income.toFixed(2)}`,
          `$${cf.expenses.toFixed(2)}`,
          `$${cf.netCashFlow.toFixed(2)}`,
          `$${cf.cumulativeCashFlow.toFixed(2)}`
        ])
      ];

      // Convert to CSV
      const csvContent = summaryData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV export. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const generatePDFReport = () => {
    setIsExporting(true);
    setExportType('pdf');

    try {
      // Create a simplified HTML report for PDF generation
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Financial Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px 20px; text-align: center; }
            .metric-label { font-size: 12px; color: #666; display: block; }
            .metric-value { font-size: 18px; font-weight: bold; color: #2563eb; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f9fafb; font-weight: bold; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Financial Analytics Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Financial Overview</h2>
            <div class="metric">
              <span class="metric-label">Current Balance</span>
              <span class="metric-value">$${data.walletStats.wallet.balance.toLocaleString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Monthly Income</span>
              <span class="metric-value">$${data.walletStats.monthlyIncome.toLocaleString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Monthly Expenses</span>
              <span class="metric-value">$${data.walletStats.monthlyExpenses.toLocaleString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Net Worth</span>
              <span class="metric-value ${data.walletStats.netWorth >= 0 ? 'positive' : 'negative'}">$${data.walletStats.netWorth.toLocaleString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Financial Health Score</span>
              <span class="metric-value">${data.financialHealth.score}/100</span>
            </div>
          </div>

          <div class="section">
            <h2>Active Subscriptions (${data.subscriptions.length})</h2>
            <table>
              <thead>
                <tr><th>Service</th><th>Monthly Cost</th><th>Next Billing</th><th>Category</th></tr>
              </thead>
              <tbody>
                ${data.subscriptions.map(sub => `
                  <tr>
                    <td>${sub.name}</td>
                    <td>$${sub.price.toFixed(2)}</td>
                    <td>${new Date(sub.billingDate).toLocaleDateString()}</td>
                    <td>${sub.categories?.[0] || 'General'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Recent Expenses (${Math.min(data.expenses.length, 10)})</h2>
            <table>
              <thead>
                <tr><th>Description</th><th>Amount</th><th>Category</th><th>Date</th></tr>
              </thead>
              <tbody>
                ${data.expenses.slice(0, 10).map(exp => `
                  <tr>
                    <td>${exp.description || 'N/A'}</td>
                    <td>$${exp.amount.toFixed(2)}</td>
                    <td>${exp.category || 'Other'}</td>
                    <td>${new Date(exp.date).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Savings Goals Progress</h2>
            <table>
              <thead>
                <tr><th>Goal</th><th>Target</th><th>Current</th><th>Progress</th></tr>
              </thead>
              <tbody>
                ${data.savings.map(saving => `
                  <tr>
                    <td>${saving.goal || 'N/A'}</td>
                    <td>$${saving.targetAmount.toFixed(2)}</td>
                    <td>$${saving.currentAmount.toFixed(2)}</td>
                    <td>${((saving.currentAmount / saving.targetAmount) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the Subscription Tracker application.</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        alert('Please allow pop-ups to generate PDF report.');
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF export. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const generateQuickInsights = () => {
    const insights = [];
    
    if (data.subscriptions.length > 10) {
      insights.push(`📱 You have ${data.subscriptions.length} active subscriptions`);
    }
    
    const monthlySubs = data.subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    if (monthlySubs > 100) {
      insights.push(`💰 Monthly subscription cost: $${monthlySubs.toFixed(0)}`);
    }
    
    if (data.financialHealth.score < 60) {
      insights.push(`⚠️ Financial health needs attention (${data.financialHealth.score}/100)`);
    }
    
    if (data.walletStats.budgetRemaining < 0) {
      insights.push(`🚨 Over budget by $${Math.abs(data.walletStats.budgetRemaining).toFixed(0)}`);
    }
    
    return insights;
  };

  const quickInsights = generateQuickInsights();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Export Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Download your financial data for external analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Quick Insights */}
      {quickInsights.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Quick Insights</h4>
          </div>
          <ul className="space-y-1">
            {quickInsights.map((insight, index) => (
              <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Export */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">PDF Report</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive formatted report
              </p>
            </div>
          </div>
          <Button
            onClick={generatePDFReport}
            disabled={isExporting}
            className="w-full"
            variant="outline"
          >
            {isExporting && exportType === 'pdf' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Perfect for sharing or archiving
          </p>
        </div>

        {/* CSV Export */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Table className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">CSV Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Raw data for spreadsheet analysis
              </p>
            </div>
          </div>
          <Button
            onClick={generateCSVReport}
            disabled={isExporting}
            className="w-full"
            variant="outline"
          >
            {isExporting && exportType === 'csv' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Import into Excel, Google Sheets, etc.
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Exports include all your financial data. Keep files secure and don&apos;t share with unauthorized parties.
        </p>
      </div>
    </Card>
  );
};

export default AnalyticsExport;
