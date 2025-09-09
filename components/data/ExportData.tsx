'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { exportToCSV, exportToExcel, generatePDFReport } from '@/app/actions/data-export';

interface ExportDataProps {
  className?: string;
}

export default function ExportData({ className }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'excel' | 'pdf',
    includeExpenses: true,
    includeBudgets: true,
    includeSubscriptions: true,
    includeSavings: true,
    startDate: '',
    endDate: '',
    categories: [] as string[],
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options = {
        startDate: exportOptions.startDate ? new Date(exportOptions.startDate) : undefined,
        endDate: exportOptions.endDate ? new Date(exportOptions.endDate) : undefined,
        categories: exportOptions.categories.length > 0 ? exportOptions.categories : undefined,
        includeExpenses: exportOptions.includeExpenses,
        includeBudgets: exportOptions.includeBudgets,
        includeSubscriptions: exportOptions.includeSubscriptions,
        includeSavings: exportOptions.includeSavings,
      };

      let result;
      
      switch (exportOptions.format) {
        case 'csv':
          result = await exportToCSV(options);
          break;
        case 'excel':
          result = await exportToExcel(options);
          break;
        case 'pdf':
          result = await generatePDFReport(options);
          break;
        default:
          throw new Error('Invalid export format');
      }

      if (!result.success) {
        alert(result.error || 'Export failed');
        return;
      }

      // Create and trigger download
      if (exportOptions.format === 'pdf') {
        // For PDF, we'll need to generate it client-side or provide the report data
        console.log('PDF Report Data:', result.data);
        alert('PDF generation would be implemented with client-side PDF library');
      } else {
        const blob = new Blob(
          [result.data], 
          { type: result.mimeType }
        );
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = () => {
    switch (exportOptions.format) {
      case 'csv':
        return <FileText size={16} />;
      case 'excel':
        return <FileSpreadsheet size={16} />;
      case 'pdf':
        return <FileImage size={16} />;
      default:
        return <Download size={16} />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download size={20} />
          Export Financial Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select
            value={exportOptions.format}
            onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
              setExportOptions(prev => ({ ...prev, format: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  CSV (Comma Separated Values)
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  Excel (.xlsx)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileImage size={16} />
                  PDF Report
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <Label>Data to Include</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expenses"
                checked={exportOptions.includeExpenses}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeExpenses: checked as boolean }))
                }
              />
              <Label htmlFor="expenses" className="text-sm font-normal">
                Expenses
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="budgets"
                checked={exportOptions.includeBudgets}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeBudgets: checked as boolean }))
                }
              />
              <Label htmlFor="budgets" className="text-sm font-normal">
                Budgets
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscriptions"
                checked={exportOptions.includeSubscriptions}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeSubscriptions: checked as boolean }))
                }
              />
              <Label htmlFor="subscriptions" className="text-sm font-normal">
                Subscriptions
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="savings"
                checked={exportOptions.includeSavings}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeSavings: checked as boolean }))
                }
              />
              <Label htmlFor="savings" className="text-sm font-normal">
                Savings
              </Label>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label>Date Range (Optional)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                From
              </Label>
              <Input
                id="startDate"
                type="date"
                value={exportOptions.startDate}
                onChange={(e) => 
                  setExportOptions(prev => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                To
              </Label>
              <Input
                id="endDate"
                type="date"
                value={exportOptions.endDate}
                onChange={(e) => 
                  setExportOptions(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || (!exportOptions.includeExpenses && !exportOptions.includeBudgets && !exportOptions.includeSubscriptions && !exportOptions.includeSavings)}
          className="w-full"
        >
          {getFormatIcon()}
          {isExporting ? 'Exporting...' : `Export as ${exportOptions.format.toUpperCase()}`}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• CSV: Best for importing into other applications</p>
          <p>• Excel: Includes separate sheets for each data type</p>
          <p>• PDF: Formatted report with summaries and charts</p>
        </div>
      </CardContent>
    </Card>
  );
}
