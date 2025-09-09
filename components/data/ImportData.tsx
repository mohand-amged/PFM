'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { importFromCSV, importFromExcel, type ImportResult } from '@/app/actions/data-import';

interface ImportDataProps {
  className?: string;
}

export default function ImportData({ className }: ImportDataProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<'expenses' | 'budgets' | 'subscriptions' | 'savings'>('expenses');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        alert('Please select a CSV or Excel (.xlsx) file');
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      let result: ImportResult;

      if (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv') {
        const content = await selectedFile.text();
        result = await importFromCSV(content, dataType);
      } else {
        const buffer = await selectedFile.arrayBuffer();
        result = await importFromExcel(Buffer.from(buffer), undefined, dataType);
      }

      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        skipped: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) {
      return <FileText size={16} className="text-blue-600" />;
    }
    return <FileSpreadsheet size={16} className="text-green-600" />;
  };

  const getResultIcon = (result: ImportResult) => {
    if (!result.success || result.errors.length > 0) {
      return <XCircle size={20} className="text-red-600" />;
    }
    if (result.skipped > 0) {
      return <AlertTriangle size={20} className="text-yellow-600" />;
    }
    return <CheckCircle size={20} className="text-green-600" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Import Financial Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Type Selection */}
        <div className="space-y-2">
          <Label>Data Type</Label>
          <Select
            value={dataType}
            onValueChange={(value: 'expenses' | 'budgets' | 'subscriptions' | 'savings') => 
              setDataType(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="budgets">Budgets</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Selection */}
        <div className="space-y-2">
          <Label>Select File</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear
              </Button>
            )}
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
              {getFileIcon(selectedFile.name)}
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!selectedFile || isImporting}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Upload size={16} className="animate-pulse" />
              Importing...
            </>
          ) : (
            <>
              <Upload size={16} />
              Import {dataType}
            </>
          )}
        </Button>

        {/* Import Progress/Result */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing file...</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <Alert className={`${
            importResult.success && importResult.errors.length === 0 
              ? 'border-green-200 bg-green-50' 
              : importResult.errors.length > 0 
                ? 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-start gap-3">
              {getResultIcon(importResult)}
              <div className="flex-1 space-y-2">
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Import {importResult.success ? 'Completed' : 'Failed'}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {importResult.imported}
                      </div>
                      <div className="text-muted-foreground">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">
                        {importResult.skipped}
                      </div>
                      <div className="text-muted-foreground">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {importResult.errors.length}
                      </div>
                      <div className="text-muted-foreground">Errors</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        View Errors ({importResult.errors.length})
                      </summary>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="space-y-3 text-xs text-muted-foreground">
          <div>
            <h4 className="font-medium text-sm mb-2">File Format Requirements:</h4>
            <div className="space-y-1">
              <p>• <strong>Expenses:</strong> Name, Amount, Date, Category (optional), Description (optional)</p>
              <p>• <strong>Budgets:</strong> Category, Monthly Limit, Month, Year, Currency (optional)</p>
              <p>• <strong>Subscriptions:</strong> Name, Price, Billing Date, Categories (optional)</p>
              <p>• <strong>Savings:</strong> Name, Amount, Date, Target Amount (optional)</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Supported Formats:</h4>
            <div className="space-y-1">
              <p>• CSV files (.csv) with comma-separated values</p>
              <p>• Excel files (.xlsx) with data in the first sheet</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>Tip:</strong> Download a sample export first to see the exact format required
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
